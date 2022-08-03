class SearchTypeException(Exception):
    pass


class DBGetSearchTypesDoesNotExists(SearchTypeException):
    def __init__(self):
        super().__init__(
            "Search types were not found in db"
        )


class CacheGetSearchTypesDoNotExists(SearchTypeException):
    def __init__(self):
        super().__init__(
            "Search types were not found in cache"
        )


class CacheGetSearchTypesError(SearchTypeException):
    def __init__(self):
        super().__init__(
            "Cache get error (search types)"
        )


class CacheSetSearchTypesError(SearchTypeException):
    def __init__(self):
        super().__init__(
            "Cache set error (search types)"
        )


class SerachException(Exception):
    pass


class QueriesDoesNotExists(SerachException):
    def __init__(self):
        super().__init__(
            "Queries were not found in db for current text"
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


class SearchQueryDoesNotExistsInCache(SerachException):
    def __init__(self, hash):
        self.hash = hash
        super().__init__(
            "Coordinates were not found in cache"
            f"hash: {hash}"
        )


class SearcherObjectNotCreated(SerachException):
    def __init__(self):
        self.hash = hash
        super().__init__(
            "Searcher object not created"
        )
