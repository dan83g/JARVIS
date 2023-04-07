from ninja import Schema
from pydantic.dataclasses import dataclass
from pydantic import BaseModel, ConfigDict
from typing import TypedDict, Any, Type


# ================== Dataclass to BaseModel ==================
def dataclass_to_model(cls: Type[object]) -> Type[BaseModel]:
    """Convert dataclass to pydantic BaseModel
    """
    return dataclass(cls, config=ConfigDict(arbitrary_types_allowed=True)).__pydantic_model__


# ======================== TypedDicts ===========================
class MessageResponseDict(TypedDict):
    """Default message respopnce dict
    """
    message: str | None


class DataResponseDict(TypedDict):
    """Default Data respopnce dict
    """
    data: list[dict[str, str]] | dict[str, Any]
    message: str | None


# ======================== Schemas ==============================
class MessageResponseSchema(Schema):
    """Default message respopnce schema
    """
    message: str = "OK"


class DataResponseSchema(Schema):
    """Default data respopnce schema
    """
    data: list[dict[str, str]] | dict[str, Any]
    message: str | None = "OK"
