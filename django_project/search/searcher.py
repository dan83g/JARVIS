from __future__ import annotations
from dataclasses import dataclass, field, fields
import re
from datetime import datetime
from dateutil import parser
import concurrent.futures
from django.db.models.query import QuerySet
from lib.encryption import md5hash
from lib.jinja import apply_jinja
from lib.handlers import Handler, HandlerType
from lib.handlers.exceptions import (
    HandlerInitError, HandlerConnectionError, HandlerExecutionError)
from lib.variables import Formatter
from lib.ninja_api.schemas import DataResponseDict
from JARVIS.enums import QUERY_PAGINATION_LIMIT, QUERY_PAGINATION_OFFSET
from .exceptions import SearcherValuesNotExist, SearcherJinjaError
import logging
logger = logging.getLogger(__name__)


@dataclass
class SearcherResult:
    url: str | None = None
    data: list = field(default_factory=list)
    errors: list = field(default_factory=list)

    @property
    def is_ok(self) -> bool:
        if (self.url or self.data):
            return True
        elif self.errors:
            return False
        return True

    @property
    def is_url(self) -> bool:
        return bool(self.url)

    @property
    def errors_as_string(self) -> str:
        return ", ".join(self.errors)

    @property
    def as_dict(self) -> DataResponseDict:
        if self.is_url:
            return DataResponseDict(data={"url": self.url}, message="OK")
        return DataResponseDict(data=self.data, message=self.errors_as_string)


@dataclass
class Searcher:
    """Searcher class to prepear some properties for query
    """
    name: str
    typename: str
    regexp: str
    datatype: str
    query: str
    username: str
    limit: int = QUERY_PAGINATION_LIMIT
    offset: int = QUERY_PAGINATION_OFFSET
    value: str | None = ''
    request_data: str | None = None
    date_from: datetime | str | None = None
    date_to: datetime | str | None = None
    is_changed: bool = True
    prepared_query: str | None = ''
    timeout: int | None = None
    initial_dict: dict = field(default_factory=dict)
    values: list = field(default_factory=list)
    sources: list = field(default_factory=list)
    prepared_values: list = field(default_factory=list)

    @classmethod
    def init_from_dict(cls, initial_dict: dict, is_changed: bool) -> Searcher:
        """get only several parameters that needed to prepare

        :param initial_dict: all parameters to query
        :type initial_dict: dict
        :param is_changed: if new parameter values are present
        :type is_changed: bool
        :return: instance of Sercher class
        :rtype: Type
        """
        class_fields = {f.name for f in fields(cls)}
        init_dict: dict = {key: value for key, value in initial_dict.items() if key in class_fields and value}
        init_dict.update({'is_changed': is_changed, 'initial_dict': initial_dict.copy()})
        return cls(**init_dict)

    def __post_init__(self) -> None:
        # if no new parameter values are present (skip processing data)
        if not self.is_changed:
            return

        # preparation of datetime parameters
        self.date_from = parser.parse(self.date_from) if isinstance(self.date_from, str) else None
        self.date_to = parser.parse(self.date_to) if isinstance(self.date_to, str) else None

        # if new query, remove old values
        self.values = []
        # get values from text by regex and add them for future jinja preparation
        for match in re.finditer(self.regexp, self.value or ''):
            # add regex named groups
            value = match.groupdict()
            # add regex groups
            value.update(dict(enumerate(match.groups())))  # type: ignore
            # add value itself
            value.update({"value": match.group()})
            self.values.append(value)

        # if values not retrieved from text
        if not self.values:
            raise SearcherValuesNotExist()

    def selialize(self, exclude_attrs: list[str] = []) -> dict:
        """generate dict of attrs from Searcher object

        :param exclude_attrs: list of exluded attrs, defaults to []
        :type exclude_attrs: List(str), optional
        :return: dict of object attrs
        :rtype: dict
        """
        attrs_dict = {}
        for key, value in self.__dict__.items():
            if key not in exclude_attrs:
                attrs_dict[key] = value.copy() if isinstance(value, (list, set, dict)) else value

        result_dict = self.initial_dict.copy()
        result_dict.update(attrs_dict)

        return result_dict

    @property
    def values_as_string(self) -> str:
        """return values string from list of prepares values
        """
        return ','.join(value for value in self.prepared_values)

    @property
    def value_as_string(self) -> str | None:
        """return first prepared value
        """
        return self.prepared_values[0] if self.prepared_values else None

    def _apply_jinja(self, text: str | None) -> str | None:
        """Apply jinja template

        :param text: text with jinja templates
        :type text: str | None
        :return: prepared text with jinja
        :rtype: str | None
        """
        if not text:
            return

        try:
            return apply_jinja(
                text=text,
                value=self.value_as_string,
                values=self.values_as_string,
                values_list=self.prepared_values,
                original_value=self.values[0]['value'],
                original_values_list=[value['value'] for value in self.values],
                groups_list=self.values,
                username=self.username,
                date_from=self.date_from,
                date_to=self.date_to,
                now=datetime.now())
        except Exception as error:
            raise SearcherJinjaError(message=str(error))

    def _execute_handler(self, **kwargs) -> tuple[list[dict] | str, str | None]:
        """execute handler
        """
        # todo: add exception and default values
        try:
            handler: Handler = Handler(initial_dict=kwargs, handler_name=kwargs.get('source_type'))
            return handler.execute(), None
        except (HandlerInitError, HandlerConnectionError, HandlerExecutionError) as error:
            return [], str(error)

    def _try_web(self) -> str | None:
        """try if web source
        :return: url for iframe source
        :rtype: str | None
        """
        if self.sources and isinstance(self.sources, list) and self.sources[0]['source_type'] == HandlerType.W.name:
            source = self.sources[0].copy()
            source.update({'prepared_query': self.prepared_query})
            url, _ = self._execute_handler(**source)
            return url if isinstance(url, str) else None

    def execute(self) -> SearcherResult:
        """execute handler's fabric

        :return: result of handler execution
        :rtype: SearcherResult
        """
        # preparing values
        if self.values:
            self.prepared_values = Formatter(formatter=self.datatype, values=self.values).execute()

        # preparing query by jinja
        self.prepared_query = self._apply_jinja(self.query)

        # preparing headers by jinja
        if hasattr(self, 'headers'):
            self.headers = self._apply_jinja(self.headers)

        # preparing source_headers by jinja
        if hasattr(self, 'source_headers'):
            self.source_headers = self._apply_jinja(self.source_headers)

        # if source is WEB then prepare url for iframe
        if (url := self._try_web()):
            return SearcherResult(url=url)

        # prepare init dict for handlers
        handler_initial_dict = self.selialize(exclude_attrs=['values', ''])

        result: SearcherResult = SearcherResult()
        # getting data from several sources
        with concurrent.futures.ThreadPoolExecutor() as executor:
            futures_list: list = []
            for current_source in self.sources:
                # filling data of current source
                handler_initial_dict.update(current_source)
                # append future
                futures_list.append(executor.submit(self._execute_handler, **handler_initial_dict))
            # joining data from several sources
            for future in concurrent.futures.as_completed(futures_list):
                try:
                    result_list, error = future.result()
                    if isinstance(result_list, list):
                        result.data.extend(result_list)
                    if error and isinstance(error, str):
                        result.errors.append(error)
                except Exception as error:
                    result.errors.append(str(error))
        return result


class Searchers(list):
    """make list of Searcher object
    Searchers(queries, **kwargs)
    """
    def __init__(self, queries: QuerySet, **kwargs) -> None:
        """init Searchers
        :param queries: selected queries
        :type queries: QuerySet
        :param kwargs: addiditioanal attributes
        :type kwargs: **kwargs
        """
        for query in queries:
            # преобразуем к словарю, так как потом все летит в REDIS
            searcher_initial_dict: dict = query.selialize(**kwargs)
            searcher_initial_dict.update({'id': md5hash(data=searcher_initial_dict)})
            self.add(Searcher.init_from_dict(initial_dict=searcher_initial_dict, is_changed=True))

    def add(self, item: Searcher):
        self.append(item)

    def add_list(self, items: list[Searcher]):
        self.extend(items)

    def count(self):
        return len(self)

    def to_dict_list(self):
        return [item.selialize() for item in self]
