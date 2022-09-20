from redis.exceptions import (
    RedisError
)


class RedisNoDataError(RedisError):
    def __init__(self):
        super().__init__(
            "No data in redis"
        )


class RedisGetError(RedisError):
    def __init__(self):
        super().__init__(
            "Redis get data error"
        )


class RedisSetError(RedisError):
    def __init__(self):
        super().__init__(
            "Redis set data error"
        )


class SearchTypeException(Exception):
    pass


class DBTypesDoNotExist(SearchTypeException):
    def __init__(self):
        super().__init__(
            "Search types is not found in db"
        )


class SerachException(Exception):
    pass


class QueriesDoesNotExist(SerachException):
    def __init__(self):
        super().__init__(
            "Queries is not found in db for current text"
        )


class CacheGetError(SerachException):
    def __init__(self, hash):
        self.hash = hash
        super().__init__(
            "Cache get error"
            f"hash: {hash}"
        )


class CacheSetError(SerachException):
    def __init__(self):
        super().__init__(
            "Cache set error"
        )


class SearchQueryDoesNotExistInCache(SerachException):
    def __init__(self, hash):
        self.hash = hash
        super().__init__(
            "Coordinates is not found in cache"
            f"hash: {hash}"
        )


class SearcherObjectNotCreated(SerachException):
    def __init__(self):
        self.hash = hash
        super().__init__(
            "Searcher object not created"
        )
