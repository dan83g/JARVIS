from __future__ import annotations
from enum import Enum
from typing import Type


class AdvancedEnum(Enum):
    """extended Enum class with classmethods
    """

    @classmethod
    def get_member(cls, key: str | None = None) -> AdvancedEnum | None:
        return cls[key.upper()] if key and (key.upper() in cls.__members__.keys()) else None


class FactoryEnum(Enum):
    """extended Enum class with classmethods
    """

    def __init__(self, factory: Type) -> None:
        self.factory = factory

    @classmethod
    def get_member(cls, key: str | None = None) -> FactoryEnum | None:
        return cls[key.upper()] if key and (key.upper() in cls.__members__.keys()) else None

    @classmethod
    def get_value(cls, key: str | None = None) -> FactoryEnum | None:
        return cls[key.upper()].value if key and (key.upper() in cls.__members__.keys()) else None
