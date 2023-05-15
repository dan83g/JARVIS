from redis.exceptions import (
    RedisError
)


# Redis Exceptions
class RedisNoDataError(RedisError):
    def __init__(self):
        super().__init__("No data in redis")


class RedisGetError(RedisError):
    def __init__(self):
        super().__init__("Redis get data error")


class RedisSetError(RedisError):
    def __init__(self):
        super().__init__("Redis set data error")


class SearchTypeException(Exception):
    pass


class DBTypesDoNotExist(SearchTypeException):
    def __init__(self):
        super().__init__("Search types is not found in db")


# Search Exceptions
class SearchException(Exception):
    pass


class QueriesDoesNotExist(SearchException):
    def __init__(self):
        super().__init__("Queries is not found in database. Try to correct type regular exception")


class CacheGetError(SearchException):
    def __init__(self, id):
        super().__init__(f"Cache get error, id: {id}")


class SearchValueNotDefined(SearchException):
    def __init__(self):
        super().__init__("Search value is not defined")


class SearchIdNotDefined(SearchException):
    def __init__(self):
        super().__init__("Search id is not defined")


class CacheSetError(SearchException):
    def __init__(self):
        super().__init__("Cache set error")


# Searcher Exceptions
class SearcherException(Exception):
    pass


class SearcherValuesNotExist(SearcherException):
    def __init__(self):
        super().__init__("Sercher error. Values not found in the text, please check regex pattern")


class SearcherJinjaError(SearcherException):
    def __init__(self, message: str):
        super().__init__(f"Sercher error. {message}")


class SearcherHandlerError(SearcherException):
    def __init__(self, message: str):
        super().__init__(f"Sercher error. Handler execution error: {message}")


class SearcherObjectNotCreated(SearcherException):
    def __init__(self, message: str | None = None):
        super().__init__(message or "Searcher object not created")


class SearcherObjectExecutionError(SearcherException):
    def __init__(self, message: str | None = None):
        super().__init__(message or "Searcher object execution error")


class SearcherObjectReturnUrl(SearcherException):
    def __init__(self, message: str | None = None):
        super().__init__(message or "Searcher object return Url")
