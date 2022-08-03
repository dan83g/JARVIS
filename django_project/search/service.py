from dataclasses import dataclass
from datetime import datetime
from django.db.models import Q
from django.core.cache import cache, InvalidCacheBackendError
from django.contrib.auth.models import User
from django.db.models.query import QuerySet
import re
from .models import types, queries
from .exceptions import (
    QueriesDoesNotExists, CacheSetError, SearcherObjectNotCreated, DBGetSearchTypesDoesNotExists,
    CacheGetSearchTypesDoNotExists, CacheGetSearchTypesError, CacheSetSearchTypesError)
from .searcher import searchers
from .forms import QueryList, Query
from lib.log import Log, LoggingHandlers
from JARVIS.enums import (REDIS_CACHE_TTL, REDIS_SEARCH_TYPES_ID)
from typing import Dict, List, Any, Union
import logging
logger = logging.getLogger(__name__)


@dataclass
class TypeDetector:
    value: str = None

    def _get_types_from_db(self) -> List[Dict]:
        """get regular expressions for parsing input text

        :raises SearchTypesDoesNotExists: if search types was not found in db
        :return: List if types
        :rtype: Optional[List[Dict]]
        """
        try:
            return list(
                types.objects.filter(active=True).values('typename', 'regexp').order_by('priority', 'typename')
            )
        except types.DoesNotExist as error:
            raise DBGetSearchTypesDoesNotExists() from error

    def _set_types_to_cache(self, types_list: List[Dict]) -> None:
        """set types to cache

        :param query_list: prepared queries
        :type query_list: List[Dict]
        :raises CacheSetSearchTypesError: if can`t seve to cache
        """
        try:
            cache.set(REDIS_SEARCH_TYPES_ID, types_list, timeout=REDIS_CACHE_TTL)
        except InvalidCacheBackendError as error:
            raise CacheSetSearchTypesError() from error

    def _get_types_from_cache(self) -> List[Dict]:
        """get regular expressions for parsing input text

        :raises CacheGetSearchTypesDoesNotExists: if search types was not found in cache
        :raises CacheGetSearchTypesError: if search types was not retrieved from cache
        :return: List if search types
        :rtype: Optional[List[Dict]]
        """
        try:
            types_list = cache.get(REDIS_SEARCH_TYPES_ID)
            if not types_list:
                raise CacheGetSearchTypesDoNotExists()
            return types_list
        except types.DoesNotExist as error:
            raise CacheGetSearchTypesError() from error

    def detect(self) -> Union[str, None]:
        """detect search type in search string

        :return: search typename
        :rtype: Union[str, None]
        """
        try:
            serach_type_list = self._get_types_from_cache()
        except (CacheGetSearchTypesDoNotExists, CacheGetSearchTypesError):
            serach_type_list = self._get_types_from_db()
            self._set_types_to_cache(serach_type_list)

        for serach_type in serach_type_list:
            if re.search(serach_type.get('regexp', ''), self.value):
                return serach_type.get('typename')


class Search:
    def __init__(self, user: User, typename: str = None, name: str = None, value: str = None, date_from: datetime = None, date_to: datetime = None, is_log: bool = False) -> None:
        self.user = user
        self.typename = typename
        self.name = name
        self.value = value
        self.date_from = date_from
        self.date_to = date_to
        self.is_log = is_log

    def _get_queries_from_db(self) -> QuerySet:
        """get list of queries

        :raises SearchTypesDoesNotExists: if search types was not found in db
        :return: List if types
        :rtype: Optional[List[Dict]]
        """
        try:
            return queries.objects.filter(
                # only active queries
                Q(active=True),
                # only active types
                Q(typename__active=True),
                # only for active sources
                Q(source__active=True),
                # security filter
                Q(group__id__isnull=True) | Q(group__in=self.user.groups.all()),
                # addiditional filter if typename or query name is present
                **{key: value for key, value in {'typename__typename': self.typename, 'name': self.name}.items() if value}
            ).prefetch_related('source').order_by('position').distinct()
        except queries.DoesNotExist as error:
            raise QueriesDoesNotExists() from error

    def _set_queries_to_cache(self, query_list: List[Dict]) -> None:
        """set queries to cache

        :param query_list: prepared queries
        :type query_list: List[Dict]
        :raises CacheSetError: if cant seve to cache
        """
        for query in query_list:
            try:
                cache.set(query['id'], query, timeout=REDIS_CACHE_TTL)
            except InvalidCacheBackendError as error:
                raise CacheSetError from error

    def _log(self, values: List[str]):
        """log query if needed

        :param values: parsed values from text
        :type values: List[str]
        """
        Log(
            # handlers=[LoggingHandlers.FILE, LoggingHandlers.KAFKA],
            handlers=[LoggingHandlers.FILE],
            username=self.user.username,
            typename=self.typename,
            values=values
        ).log()

    def _get_query(self, query: Any) -> Query:
        return Query(
            id=query.get('id'),
            title=query.get('name'),
            icon=query['sources'][0].get('icon'),
            iframe=query['sources'][0].get('iframe')
        )

    def execute(self) -> List[Dict]:
        if not self.typename:
            self.typename = TypeDetector(self.value).detect()

        # init searchers
        query_list = searchers(
            self._get_queries_from_db(),
            search_text=self.value,
            username=self.user.username,
            date_from=self.date_from,
            date_to=self.date_to
        )

        # verify if at least one Searcher object has been created
        if not query_list:
            raise SearcherObjectNotCreated()

        # cast query_list
        query_list = query_list.to_dict_list()

        # write to cache
        self._set_queries_to_cache(query_list)

        # log query
        if self.is_log:
            self._log(values=[item['value'] for item in query_list[0].values])

        return QueryList(__root__=[self._get_query(query) for query in query_list]).dict()
