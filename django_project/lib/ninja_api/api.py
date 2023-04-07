import orjson
from datetime import datetime, date
from ninja import NinjaAPI
from ninja.renderers import BaseRenderer
from ninja.parser import Parser


class ORJSONParser(Parser):
    def parse_body(self, request):
        return orjson.loads(request.body)


class ORJSONRenderer(BaseRenderer):
    media_type = "application/json"

    def default(self, obj):
        if isinstance(obj, (date, datetime)):
            return obj.isoformat()

    def render(self, request, data, *, response_status):
        return orjson.dumps(data, default=self.default)


class SingletonBaseClass(type):
    _instances = {}

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super(SingletonBaseClass, cls).__call__(*args, **kwargs)
        return cls._instances[cls]


class Ninja(metaclass=SingletonBaseClass):
    def __init__(self):
        self.api = NinjaAPI(parser=ORJSONParser(), renderer=ORJSONRenderer(), description="Jarvis API", version="1.5.1")

    def get_api(self) -> NinjaAPI:
        return self.api
