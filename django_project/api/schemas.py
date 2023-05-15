from ninja import ModelSchema, Field
from search.models import types, queries, sources
from lib.ninja_api.schemas import DataResponseSchema


# Type list response schema
class TypesSchema(ModelSchema):
    class Config:
        model = types
        model_fields = ['id', 'typename', 'regexp']


class TypesResponseSchema(DataResponseSchema):
    data: list[TypesSchema] = []


# Query list response schema
class SourceSchema(ModelSchema):
    class Config:
        model = sources
        model_fields = ['source', 'source_type']


class QuerySchema(ModelSchema):
    sources: list[SourceSchema] = Field(..., alias='source')
    regexp: str | None

    class Config:
        model = queries
        # model_fields = ['name', 'datatype', 'timeout', 'typename', 'regexp']
        model_fields = ['name', 'datatype', 'timeout', 'typename']

    @staticmethod
    def resolve_regexp(obj):
        if not obj.typename:
            return
        return f"{obj.typename.regexp}"


class QueryResponseSchema(DataResponseSchema):
    data: list[QuerySchema] = []
