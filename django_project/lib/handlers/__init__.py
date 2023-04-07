from lib.enum import FactoryEnum
from .exceptions import HandlerInitError
from .odbc import (
    MSSQLHandler, SQLite, SQLite3, PostgreSQLHandler, MySQLHandler, OracleHandler, MariaDBHandler)
from .http import (
    HTTPHandler, WebHandler, JarvisHandler, ElasticHandler, ClickHouseHandler)
from .file import (
    ExcelFileHandler, CSVFileHandler)

import logging
logger = logging.getLogger(__name__)


class HandlerType(FactoryEnum):
    M = MSSQLHandler
    R = HTTPHandler
    W = WebHandler
    J = JarvisHandler
    E = ElasticHandler
    C = ClickHouseHandler
    PGS = PostgreSQLHandler
    ORL = OracleHandler
    MAR = MariaDBHandler
    MYS = MySQLHandler
    EXL = ExcelFileHandler
    CSV = CSVFileHandler
    SL1 = SQLite
    SL3 = SQLite3


class Handler:
    """Handler factory class
    """

    def __init__(self, initial_dict: dict, handler: HandlerType | None = None, handler_name: str | None = None) -> None:
        """Handler factory init

        :param initial_dict: dict with parameters
        :type initial_dict: dict
        :param handler: one of handlers, defaults to None
        :type handler: HandlerType | None, optional
        :param handler_name: handler name, to determine HandlerType, defaults to None
        :type handler_name: str | None, optional
        :raises HandlerInitError: raises if handler is None
        """
        if isinstance(handler_name, str) and not isinstance(handler, HandlerType):
            handler = HandlerType(HandlerType.get_member(handler_name))
        if not isinstance(handler, HandlerType):
            raise HandlerInitError(message=f'Unknown handler {handler_name if handler_name else handler.name}')  # type: ignore
        self.factory = handler.factory.from_dict(initial_dict=initial_dict)

    def execute(self) -> list[dict] | str:
        """execute handler
        """
        return self.factory.execute()  # type: ignore

    def ping(self) -> bool:
        """ping source
        """
        return self.factory.ping()  # type: ignore
