from enum import Enum
from typing import Type, Union


class FactoryEnum(Enum):
    """extended Enum class with classmethods
    """

    def __init__(self, factory: Type) -> None:
        self.factory = factory

    @classmethod
    def get_member(cls, key: Union[str, None] = None) -> Union[Enum, None]:
        return cls[key.upper()] if key and (key.upper() in cls.__members__.keys()) else None

    @classmethod
    def get_value(cls, key: Union[str, None] = None) -> Type:
        return cls[key.upper()].value if key and (key.upper() in cls.__members__.keys()) else None
