from abc import abstractmethod
from dataclasses import dataclass, fields
from typing import Type


@dataclass
class HandlerAbstractFactory:
    """ Abstract Factory Class for handlers
    """
    @classmethod
    def from_dict(cls, initial_dict: dict) -> Type:
        class_fields = {f.name for f in fields(cls)}
        return cls(**{key: value for key, value in initial_dict.items() if key in class_fields and value})

    @abstractmethod
    def execute(self) -> list[dict]:
        pass

    @abstractmethod
    def ping(self) -> bool:
        pass
