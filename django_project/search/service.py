import json
import re
import redis
from dataclasses import asdict, fields, dataclass
from pydantic import validator
from datetime import datetime
from django.db.models import Q
from django.core.cache import cache, InvalidCacheBackendError
from django.contrib.auth.models import User
from django.db.models.query import QuerySet
from .models import types, queries
from .exceptions import (
    RedisError, RedisGetError, RedisSetError, RedisNoDataError, SearchIdNotDefined,
    QueriesDoesNotExist, CacheSetError, DBTypesDoNotExist,
    SearcherObjectNotCreated, SearcherObjectExecutionError, SearchValueNotDefined)
from .searcher import Searchers, Searcher
from .forms import QueryList, Query
from lib.log import Log, LoggingHandlers
from lib.encoders import JsonEncoder
from lib.ninja_api.schemas import DataResponseDict
from JARVIS.enums import (
    REDIS_HOST, REDIS_PORT, REDIS_DB_CACHE, REDIS_CACHE_TTL,
    QUERY_PAGINATION_LIMIT, QUERY_PAGINATION_OFFSET)
from typing import Any
import logging
logger = logging.getLogger(__name__)


@dataclass
class AutoComplete:
    value: str
    max_count: int = 10
    max_text_length: int = 50

    def __post_init__(self) -> None:
        self._redis = redis.StrictRedis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB_CACHE)
        self._auto_complete_key_prefix = "auto-complete:"

    def _add_prefixes_to_redis(self, value: str) -> bool:
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

    def _get_text_list_from_redis(self, value: str) -> list[str]:
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
        if not self.value or len(self.value) < 4:
            return False
        return self._add_prefixes_to_redis(self.value)

    def get_text_list(self) -> list[str]:
        """return text list for autocomplete

        :return: text list
        :rtype: List[str]
        """
        return self._get_text_list_from_redis(self.value)


@dataclass
class TypeDetector:
    value: str

    def __post_init__(self) -> None:
        self._redis = redis.StrictRedis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB_CACHE)
        self._type_list_key_prefix = "type-list:"

    def _get_types_from_db(self) -> list[dict]:
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

    def _set_types_to_redis(self, types_list: list[dict]) -> bool:
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

    def _get_types_from_redis(self) -> list[dict]:
        """get regular expressions for parsing input text

        :raises RedisNoDataError: if search types not found in cache
        :return: List if search types
        :rtype: list[dict]
        """
        try:
            types_list = self._redis.get(name=self._type_list_key_prefix)
            if not types_list:
                raise RedisNoDataError
            return json.loads(types_list)
        except RedisError as error:
            raise RedisGetError from error

    def detect(self) -> str | None:
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


@dataclass(kw_only=True)
class DefaultQueryParameters:
    value: str
    date_from: datetime | None = None
    date_to: datetime | None = None
    limit: int | None = QUERY_PAGINATION_LIMIT
    offset: int | None = QUERY_PAGINATION_OFFSET

    @classmethod
    def init_from_dict(cls, initial_dict: dict):
        class_fields = {f.name for f in fields(cls)}
        return cls(**{key: value for key, value in initial_dict.items() if key in class_fields and value})

    @validator('limit')
    def validator_pagination_limit(cls, v, values, **kwargs):
        return QUERY_PAGINATION_LIMIT if not v or v <= 0 else v

    @validator('offset')
    def validator_pagination_offset(cls, v, values, **kwargs):
        return QUERY_PAGINATION_OFFSET if not v or v < 0 else v

    @property
    def as_dict(self) -> dict:
        return asdict(self)

    @property
    def as_dict_without_none(self) -> dict:
        return {key: value for key, value in self.as_dict.items() if value is not None}

    @property
    def is_changed(self) -> bool:
        return bool(self.value) or self.limit != QUERY_PAGINATION_LIMIT or self.offset != QUERY_PAGINATION_OFFSET or bool(self.date_from) or bool(self.date_to)


@dataclass(kw_only=True)
class Search(DefaultQueryParameters):
    user: User
    typename: str | None = None
    query: str | None = None
    log_type: LoggingHandlers = LoggingHandlers.NO

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
                Q(group__id__isnull=True) | Q(group__in=User.objects.get(username=self.user.username).groups.all()),
                # addiditional filter if typename or query name is present
                **{key: value for key, value in {'typename__typename': self.typename, 'name': self.query}.items() if value}
            ).prefetch_related('source').order_by('position').distinct()
        except queries.DoesNotExist as error:
            raise QueriesDoesNotExist() from error

    def _set_queries_to_cache(self, query_list: list[dict]) -> None:
        """set queries to cache

        :param query_list: prepared queries
        :type query_list: List[Dict]
        :raises CacheSetError: if cant seve to cache
        """
        for query in query_list:
            if not (id := query.get('id')):
                raise SearchIdNotDefined()

            try:
                cache.set(id, query, timeout=REDIS_CACHE_TTL)
            except InvalidCacheBackendError as error:
                raise CacheSetError from error

    def _log(self, values: list[str]):
        """log query if needed

        :param values: parsed values from text
        :type values: List[str]
        """
        Log(
            # handlers=[LoggingHandlers.FILE, LoggingHandlers.KAFKA],
            handlers=[self.log_type],
            username=self.user.username,
            typename=self.typename if self.typename else 'Unknown',
            values=values
        ).log()

    def _get_query(self, query: Any) -> Query:
        return Query(
            id=query.get('id'),
            title=query.get('name'),
            icon=query['sources'][0].get('icon'),
            iframe=query['sources'][0].get('iframe')
        )

    def execute(self) -> dict:
        if self.value and not self.typename:
            self.typename = TypeDetector(value=self.value).detect()

        if not self.value:
            raise SearchValueNotDefined()

        # init Searchers
        query_list = Searchers(
            self._get_queries_from_db(),
            value=self.value,
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
        if self.log_type != LoggingHandlers.NO:
            self._log(values=[item['value'] for item in query_list[0].values])

        return QueryList(__root__=[self._get_query(query) for query in query_list]).dict()


@dataclass(kw_only=True)
class SearchQuery(DefaultQueryParameters):
    id: str
    username: str
    value: str | None = None

    def __post_init__(self) -> None:
        self._redis = redis.StrictRedis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB_CACHE)

    def _get_query_from_redis(self) -> dict:
        """get query dict from redis

        :raises RedisNoDataError: when no data is available
        :raises RedisGetError: when get data fails
        :return: List if search types
        :rtype: list[dict]
        """
        try:
            if not (result := cache.get(self.id)):
                raise RedisNoDataError
            return result
        except Exception as error:
            raise RedisGetError from error

    def execute(self) -> DataResponseDict:
        """init and execute Searcher

        :raises SearcherObjectNotCreated: if Sercher object have not been created
        :raises SearcherObjectExecutionError: if Sercher execution method have been ececuted with errors
        :return: result of execution method
        :rtype: str | list[dict] | None
        """
        init_dict: dict = self._get_query_from_redis()
        init_dict.update(self.as_dict_without_none)
        try:
            searcher = Searcher.init_from_dict(initial_dict=init_dict, is_changed=self.is_changed)
        except Exception as error:
            raise SearcherObjectNotCreated from error

        if (result := searcher.execute()) and not result.is_ok:
            raise SearcherObjectExecutionError(message=result.errors_as_string)

        return result.as_dict
