from ninja import ModelSchema, Schema
from search.models import types


class TypesSchema(ModelSchema):
    class Config:
        model = types
        model_fields = ['id', 'typename']
        # model_fields = "__all__"
