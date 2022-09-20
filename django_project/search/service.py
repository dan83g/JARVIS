from dataclasses import dataclass
from datetime import datetime
from django.db.models import Q
from django.core.cache import cache, InvalidCacheBackendError
from django.contrib.auth.models import User
from django.db.models.query import QuerySet
import json
import re
import redis
from .models import types, queries
from .exceptions import (
    RedisError, RedisGetError, RedisSetError, RedisNoDataError,
    QueriesDoesNotExist, CacheSetError, SearcherObjectNotCreated, DBTypesDoNotExist)
from .searcher import searchers
from .forms import QueryList, Query
from lib.log import Log, LoggingHandlers
from lib.encoders import JsonEncoder
from JARVIS.enums import (
    REDIS_HOST, REDIS_PORT, REDIS_DB_CACHE, REDIS_CACHE_TTL)
from typing import Dict, List, Any, Union
import logging
logger = logging.getLogger(__name__)


@dataclass
class AutoComplete:
    value: str = None
    max_count: int = 10
    max_text_length: int = 50

    def __post_init__(self) -> None:
        self._redis = redis.StrictRedis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB_CACHE)
        self._auto_complete_key_prefix = "auto-complete:"

    def _add_prefixes_to_redis(self, value: str) -> Union[bool, None]:
        """add prefixes to redis

        :param value: search text
        :type value: str
        :raises CacheSetSearchTypesError: if can`t seve to cache
        """
        try:
            value = value.strip()
            for length in range(1, len(value)):
                prefix = value[0:length]
                self._redis.zadd(self._auto_complete_key_prefix, {prefix: 0})
            self._redis.zadd(self._auto_complete_key_prefix, {value + "*": 0})
            return True
        except RedisError as error:
            raise RedisSetError from error

    def _get_text_list_from_redis(self, value: str) -> List[str]:
        """get autocomlete list from redis

        :raises RedisGetData: if text not retrieved from redis
        :return: autocomplete list
        :rtype: Optional[List[str]]
        """
        try:
            results = []
            count = self.max_count
            start = self._redis.zrank(self._auto_complete_key_prefix, value)
            if not start:
                return []
            while (len(results) != count):
                range = self._redis.zrange(self._auto_complete_key_prefix, start, start + self.max_text_length - 1)
                start += self.max_text_length
                if not range or len(range) == 0:
                    break
                for entry in range:
                    entry = entry.decode('utf-8')
                    minlen = min(len(entry), len(value))
                    if entry[0:minlen] != value[0:minlen]:
                        count = len(results)
                        break
                    if entry[-1] == "*" and len(results) != count:
                        results.append(entry[0:-1])
            return results
        except RedisError as error:
            raise RedisGetError() from error

    def add_text_to_redis(self) -> bool:
        """add prefixes to the redis (autocomplete)

        :return: True if successfully added, else False
        :rtype: bool
        """
        return self._add_prefixes_to_redis(self.value)

    def get_text_list(self) -> List[str]:
        """return text list for autocomplete

        :return: text list
        :rtype: List[str]
        """
        return self._get_text_list_from_redis(self.value)


@dataclass
class TypeDetector:
    value: str = None

    def __post_init__(self) -> None:
        self._redis = redis.StrictRedis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB_CACHE)
        self._type_list_key_prefix = "type-list:"

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
            raise DBTypesDoNotExist() from error

    def _set_types_to_redis(self, types_list: List[Dict]) -> None:
        """set types to cache

        :param query_list: prepared queries
        :type query_list: List[Dict]
        :raises CacheSetSearchTypesError: if can`t seve to cache
        """
        try:
            self._redis.set(
                name=self._type_list_key_prefix,
                value=json.dumps(types_list, cls=JsonEncoder, ensure_ascii=False),
                ex=REDIS_CACHE_TTL)
            return True
        except RedisError as error:
            raise RedisSetError from error

    def _get_types_from_redis(self) -> List[Dict]:
        """get regular expressions for parsing input text

        :raises RedisNoDataError: if search types not found in cache
        :return: List if search types
        :rtype: Optional[List[Dict]]
        """
        try:
            types_list = self._redis.get(name=self._type_list_key_prefix)
            if not types_list:
                raise RedisNoDataError
            return json.loads(types_list)
        except RedisError as error:
            raise RedisGetError from error

    def detect(self) -> Union[str, None]:
        """detect search type in search string

        :return: search typename
        :rtype: Union[str, None]
        """
        try:
            serach_type_list = self._get_types_from_redis()
        except (RedisGetError, RedisNoDataError):
            serach_type_list = self._get_types_from_db()
            self._set_types_to_redis(serach_type_list)

        if not serach_type_list:
            return None

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
            raise QueriesDoesNotExist() from error

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
