from __future__ import annotations
from datetime import date, datetime
from enum import Enum, EnumMeta


class TryParse:
    @staticmethod
    def date(value: date | str | None, default_value: date = date.today(), format: str | None = None) -> date:
        """try parse date string

        :param value: input value
        :type value: str
        :param format: date format, defaults to None
        :type format: str | None, optional
        :return: date
        :rtype: date
        """
        if not value:
            return default_value

        if isinstance(value, date):
            return value

        try:
            if format is None:
                return date.fromisoformat(value)
            else:
                return datetime.strptime(value, format).date()
        except ValueError:
            return default_value

    @staticmethod
    def datetime(value: datetime | str | None, default_value: datetime = datetime.now(), format: str | None = None) -> datetime:
        """try parse datetime string

        :param value: input value
        :type value: str
        :param format: datetime format, defaults to None
        :type format: str | None, optional
        :return: datetime
        :rtype: datetime
        """
        if not value:
            return default_value

        if isinstance(value, datetime):
            return value

        try:
            if format is None:
                return datetime.fromisoformat(value)
            else:
                return datetime.strptime(value, format)
        except ValueError:
            return default_value

    @staticmethod
    def int(value: int | str | None, default_value: int = 0) -> int:
        """try parse int string

        :param value: str with int
        :type value: str | None
        :param default_value: default int value, defaults to 0
        :type default_value: int, optional
        :return: result int
        :rtype: int
        """
        if not value:
            return default_value

        if isinstance(value, int):
            return value

        try:
            return int(value)
        except ValueError:
            return default_value

    @staticmethod
    def float(value: float | str | None, default_value: float = 0) -> float:
        """try parse float string

        :param value: str with float
        :type value: str | None
        :param default_value: default float value, defaults to 0
        :type default_value: float, optional
        :return: result float
        :rtype: float
        """
        if not value:
            return default_value

        if isinstance(value, float):
            return value

        try:
            return float(value)
        except ValueError:
            return default_value

    @staticmethod
    def bool(value: bool | str | None, default_value: bool = False) -> bool:
        """try parse bool string

        :param value: str with bool
        :type value: str | None
        :param default_value: default bool value, defaults to 0
        :type default_value: bool, optional
        :return: result bool
        :rtype: bool
        """
        if value is None:
            return default_value

        if isinstance(value, bool):
            return value

        try:
            value = value.lower()
            if value not in ("yes", "true", "t", "1", "no", "false", "f", "0", "on", "off"):
                raise ValueError()

            return True if value in ('1', 'true', 'on', 'yes', 't') else False
        except ValueError:
            return default_value

    @staticmethod
    def enum(value: Enum | str | None, enum_meta: EnumMeta, default_value: Enum) -> Enum:
        """try parse Enum

        :param value: str
        :type value: Enum | str | None
        :param default_value: default enum value
        :type default_value: enum, optional
        :return: result Enum
        :rtype: Enum
        """
        if value is None:
            return default_value

        if isinstance(value, Enum):
            return value

        try:
            return enum_meta[value.upper()] if value and (value.upper() in enum_meta.__members__.keys()) else default_value  # type: ignore
        except ValueError:
            return default_value
