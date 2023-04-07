class CoordinatesException(Exception):
    pass


class CoordinatesTypesDoesNotExists(CoordinatesException):
    def __init__(self):
        super().__init__(
            "Coordinate types was not found in db"
        )


class CacheGetError(CoordinatesException):
    def __init__(self, id):
        self.id = id
        super().__init__(
            "Cache get error"
            f"id: {id}"
        )


class CacheSetError(CoordinatesException):
    def __init__(self):
        super().__init__(
            "Cache set error"
        )


class CoordinatesDoesNotExistsInCache(CoordinatesException):
    def __init__(self, id):
        self.id = id
        super().__init__(
            "Coordinates were not found in cache"
            f"id: {id}"
        )
