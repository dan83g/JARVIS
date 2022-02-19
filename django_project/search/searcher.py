import re as regex
import datetime
from dateutil import parser
import concurrent.futures
from lib.encryption import md5hash
from typing import Union, List, Tuple
from django.db.models.query import QuerySet
from lib.jinja import doJinja
from lib.handlers import Handler
from lib.variables import Formatter
import logging
logger = logging.getLogger(__name__)


class searcher(object):
    """ init_dict: dict, with_preparation: bool """

    def __init__(self, init_dict: dict, with_preparation: bool):
        self.errors = []
        self.values = []
        self.results = []

        self.name = ''
        self.position = 0
        self.typename = ''
        self.timeout = 30
        self.cpi = False
        self.script = ''
        self.columns = ''
        self.query = ''
        self.datatype = ''
        self.regexp = ''

        self.search_text = ''
        self.date_from = None
        self.date_to = None

        self.sources = []
        self.value = None
        self.prepared_values = []

        # for rest sources
        self.method = 'GET'
        self.headers = {}
        self.request_data = ""
        self.code_type = "json"
        self.code = ""

        try:
            if isinstance(init_dict, dict):
                self.__dict__.update(init_dict)
        except KeyError as error:
            raise AttributeError(f'{error}')

        # initial values
        self.prepared_query = ''

        # если запрос уже был пердобработан и данные пришли в init_dict
        if not with_preparation:
            return

        # Если текст запроса не передан
        if not self.search_text:
            self.add_error('Текст запроса отсутсвует')
            return

        self.values = []
        # вытаскиваем значения по регуляркам
        for match in regex.finditer(self.regexp, self.search_text):
            # добавляем именные группы
            value = match.groupdict()
            # добавляем группы
            value.update(dict(enumerate(match.groups())))
            # добавляем само значение
            value.update({"value": match.group()})
            self.values.append(value)

        # если значения не выделены из текста
        if not self.values:
            self.add_error('Текст не соответствует регулярному выражению')
            return

        # сохраняем первое значение до преобразования, чтобы вывести его пользователю
        self.value = self.values[0]['value']
        return

    def to_dict(self, exclude_attrs: List[str] = []) -> dict:
        """generate dict of attrs from searcher object

        :param exclude_attrs: list of exluded attrs, defaults to []
        :type exclude_attrs: List(str), optional
        :return: dict of object attrs
        :rtype: dict
        """
        result_dict = {}
        for key, value in self.__dict__.items():
            if key not in exclude_attrs:
                result_dict[key] = value.copy() if isinstance(value, (list, set, dict)) else value
        return result_dict

    def add_error(self, error: str) -> None:
        """add error string to list of errors
        """
        self.errors.append(error)

    @property
    def values_as_string(self) -> str:
        """return values string from list of prepares values
        """
        return ','.join(value for value in self.prepared_values)

    @property
    def value_as_string(self) -> str:
        """return first prepared value
        """
        if self.prepared_values:
            return str(self.prepared_values[0])

    @property
    def errors_as_string(self) -> str:
        """return error string from list of errors
        """
        return ", ".join(self.errors)

    def apply_jinja(self, text: Union[str, None]) -> Union[str, None]:
        """apply jinja template

        :param text: text with jinja templates
        :type text: Union[str, None]
        :return: prepared text with jinja
        :rtype: Union[str, None]
        """
        if not text:
            return

        try:
            text = doJinja(
                text=text,
                value=self.value_as_string,
                values=self.values_as_string,
                values_list=self.prepared_values,
                original_value=self.values[0]['value'],
                original_values_list=[value['value'] for value in self.values],
                groups_list=self.values,
                username=self.__dict__.get('username'),
                date_from=parser.parse(self.date_from) if self.date_from else None,
                date_to=parser.parse(self.date_to) if self.date_to else None,
                now=datetime.datetime.now())
        except Exception as error:
            self.add_error(f'Ошибка преобразования шаблона: {error}')
            return

        # DEPRICATED
        # replace old templates {value} {values}
        text = text.replace("{values}", self.values_as_string)
        text = text.replace("{value}", self.value_as_string)
        return text

    def _execute_handler(self, **kwargs) -> Union[List[dict], None]:
        """execute handler
        """
        handler = Handler(handler=kwargs.get('source_type'), initial_dict=kwargs)
        return handler.execute()

    def _try_web(self) -> str:
        """if WEB-source - return True, and prefill prepared_query with full url
        :return: Web or Not
        :rtype: bool
        """
        if self.sources and isinstance(self.sources, list) and self.sources[0]['source_type'] == "W":
            source = self.sources[0].copy()
            source.update({'prepared_query': self.prepared_query})
            self.prepared_query, _ = self._execute_handler(**source)
            return True

    def execute(self) -> Tuple[bool, List[dict]]:
        """wrapper method for running handlers

        :return: bool [True - data, False - webpage], List[dict] - returned data
        :rtype: Tuple[bool, List[dict]]
        """
        # preparing values
        if self.values:
            self.prepared_values = Formatter(formatter=self.datatype, values=self.values).execute()

        # preparing query by jinja
        self.prepared_query = self.apply_jinja(self.query)
        if not self.prepared_query:
            return True, None

        # if source is WEB then prepare url for iframe
        if self._try_web():
            return False, self.prepared_query

        # preparing request data
        self.request_data = self.apply_jinja(self.request_data)

        # prepare init dict for handlers
        handler_initial_dict = self.to_dict(exclude_attrs=['values', ''])

        # getting data from several sources
        with concurrent.futures.ThreadPoolExecutor() as executor:
            futures_list: list = []
            for current_source in self.sources:
                # filling data current source
                handler_initial_dict.update(current_source)
                futures_list.append(executor.submit(self._execute_handler, **handler_initial_dict))
            # joining data from several sources
            for future in concurrent.futures.as_completed(futures_list):
                try:
                    result_list, error_list = future.result()
                    if isinstance(result_list, list):
                        self.results.extend(result_list)
                    if isinstance(error_list, list):
                        self.errors.extend(error_list)
                except Exception as error:
                    self.add_error(f'Ошибка получения данных из обработчика: {error}')
        return True, self.results


class searchers(list):
    """make list of searcher object
    searchers(queries, **kwargs)
    """
    def __init__(self, queries: QuerySet, **kwargs) -> None:
        """init searchers
        :param queries: selected queries
        :type queries: QuerySet
        :param kwargs: addiditioanal attributes
        :type kwargs: **kwargs
        """
        for query in queries:
            # преобразуем к словарю, так как потом все летит в REDIS
            searcher_initial_dict = query.to_dict(**kwargs)
            searcher_initial_dict['id'] = md5hash(data=searcher_initial_dict)
            self.add(searcher(init_dict=searcher_initial_dict, with_preparation=True))

    def add(self, item):
        self.append(item)

    def add_list(self, items):
        self.extend(items)

    def count(self):
        return len(self)

    def to_dict_list(self):
        return [item.to_dict() for item in self]
