from __future__ import annotations
from .service import DefaultQueryParameters
from ninja import Schema
from pydantic import validator
from lib.ninja_api.schemas import dataclass_to_model


DefaultQueryModel = dataclass_to_model(DefaultQueryParameters)


class SearchRequestSchema(DefaultQueryModel):
    type: str | None = None


class QueryRequestSchema(DefaultQueryModel):
    id: str

    @validator('id')
    def validator_id(cls, v, values, **kwargs):
        if not v or (v and len(v) != 32):
            raise ValueError("parameter 'id' is not valid")
        return v


class ValueRequestSchema(Schema):
    value: str
