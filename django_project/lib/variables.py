from dataclasses import dataclass, field
from typing import List, Union
from lib.enum import FactoryEnum
from functools import partial
import ipaddress


def single_quotes(values: List[str]) -> List[str]:
    return [f"'{value['value']}'" for value in values]


def asis(values: List[str]) -> List[str]:
    return [f"{value['value']}" for value in values]


def replace_comma(values: List[str]) -> List[str]:
    return [value['value'].replace(",", ".") for value in values]


def ipv4_string(values: List[str]) -> List[str]:
    result_values = []
    for value in values:
        try:
            # rm zeros
            value = '.'.join(f'{int(i)}' for i in value['value'].split('.'))
            result_values.append(str(int(ipaddress.ip_address(value))))
        except Exception:
            pass
    return result_values


def ipv6_string(values: List[str]) -> List[str]:
    result_values = []
    for value in values:
        try:
            result_values.append(str(int(ipaddress.ip_address(value['value']))))
        except Exception:
            pass
    return result_values


class FormatType(FactoryEnum):
    STRING = partial(single_quotes)
    DATE = partial(single_quotes)
    DATETIME = partial(single_quotes)
    INT = partial(asis)
    ASIS = partial(asis)
    FLOAT = partial(replace_comma)
    IPV4 = partial(ipv4_string)
    IPV6 = partial(ipv6_string)


@dataclass
class Formatter:
    """Formatting variables for the future substitution in query
    """
    formatter: Union[FormatType, str]
    values: List[str] = field(default_factory=list)

    def __post_init__(self) -> None:
        if isinstance(self.formatter, str):
            self.formatter = FormatType.get_member(self.formatter)

    def execute(self) -> List[str]:
        return self.formatter.factory(self.values)
