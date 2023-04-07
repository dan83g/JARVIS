from abc import abstractproperty
from dataclasses import dataclass, field
from contextlib import contextmanager
from typing import Generator
import pyodbc
from pandas import read_sql
from .abstract import HandlerAbstractFactory
from .exceptions import HandlerConnectionError, HandlerExecutionError
from lib.enum import AdvancedEnum


SQL_ATTR_CONNECTION_TIMEOUT = 113


class IsolationLevel(AdvancedEnum):
    READ_UNCOMMITTED = 1
    READ_COMMITTED = 2
    REPEATABLE_READ = 4
    SERIALIZABLE = 8


@dataclass
class ODBCHandler(HandlerAbstractFactory):
    host: str = ''
    port: int = 0
    instance: str = ''
    driver: str = ''
    database: str = ''
    timeout: int = 30
    timeout_supported: bool = True
    prepared_query: str = ''
    user: str = ''
    password: str = ''
    filename: str = ''
    isolation_level: str = 'READ_UNCOMMITTED'
    attrs_before: dict = field(default_factory=dict)

    def __post_init__(self) -> None:
        self.attrs_before = {SQL_ATTR_CONNECTION_TIMEOUT: 5}

    @abstractproperty
    def _connection_string(self) -> str:
        return ''

    @contextmanager
    def _odbc_connection(self) -> Generator[pyodbc.Connection | None, None, None]:
        pyodbc.pooling = False
        cnxn = None
        try:
            # timeout is login timeout (5 sec)
            cnxn = pyodbc.connect(self._connection_string, timeout=5, autocommit=True, attrs_before=self.attrs_before)
            # retrieve isolation level from string
            if (isolation_level := IsolationLevel.get_member(self.isolation_level)) is None:
                isolation_level = IsolationLevel.READ_UNCOMMITTED
            # set isolation level
            cnxn.set_attr(pyodbc.SQL_ATTR_TXN_ISOLATION, isolation_level.value)
            if self.timeout_supported:
                cnxn.timeout = self.timeout
            yield cnxn
        except (pyodbc.Error) as error:
            raise HandlerConnectionError(message=f'Connection Error {self.host}:{self.port}({self.database}): {error.args[1]}') from error
            # yield None
        finally:
            if cnxn:
                cnxn.close()

    def execute(self) -> list[dict]:
        with self._odbc_connection() as cnxn:
            try:
                data_frame = read_sql(sql=self.prepared_query, con=cnxn)  # type: ignore
                data_frame.columns = [f'undefined_{index}' if name == '' else name for index, name in enumerate(data_frame.columns)]
                return list(data_frame.T.to_dict().values())
            except Exception as error:
                raise HandlerExecutionError(message=f'Transaction execution Error: {error}') from error

    def ping(self) -> bool:
        self.prepared_query = 'SELECT 1'
        self.execute()
        return True


@dataclass
class MSSQLHandler(ODBCHandler):
    port: int = 1433
    driver: str = '{ODBC Driver 17 for SQL Server}'

    @property
    def _connection_string(self) -> str:
        return r"DRIVER={driver};SERVER={host}{instance}{port};{database}UID={user};PWD={password};MARS_Connection=yes;Command Timeout={timeout};".format(
            driver=self.driver,
            host=self.host,
            instance=f'\\{self.instance}' if self.instance else '',
            port="" if self.port in (None, 0, 1433) else f",{self.port}",
            database="" if not self.database else f"DATABASE={self.database};",
            user=self.user,
            password=self.password,
            timeout=self.timeout)


@dataclass
class PostgreSQLHandler(ODBCHandler):
    port: int = 5432
    driver: str = '{PostgreSQL Unicode}'
    timeout_supported: bool = False

    @property
    def _connection_string(self) -> str:
        return f'DRIVER={self.driver};SERVER={self.host};PORT={self.port};DATABASE={self.database};UID={self.user};PWD={self.password};Timeout=5;Command Timeout={self.timeout};'


@dataclass
class MySQLHandler(ODBCHandler):
    port: int = 3306
    driver: str = '{MySQL ODBC 8.0 Unicode Driver}'

    @property
    def _connection_string(self) -> str:
        return f'DRIVER={self.driver};SERVER={self.host};PORT={self.port};DATABASE={self.database};UID={self.user};PWD={self.password};readtimeout={self.timeout};writetimeout={self.timeout};'


@dataclass
class OracleHandler(ODBCHandler):
    port: int = 1521
    driver: str = '{Oracle 21 ODBC driver}'

    @property
    def _connection_string(self) -> str:
        return f'DRIVER={self.driver};SERVER=(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST={self.host})(PORT={self.port}))(CONNECT_DATA=(SERVICE_NAME={self.host})));dbname={self.database};UID={self.user};PWD={self.password};SQL_LOGIN_TIMEOUT=5;'


@dataclass
class MariaDBHandler(ODBCHandler):
    port: int = 3306
    driver: str = '{MariaDB ODBC 3.1 Driver}'

    @property
    def _connection_string(self) -> str:
        return f'DRIVER={self.driver};SERVER={self.host};PORT={self.port};DATABASE={self.database};USER={self.user};PASSWORD={self.password};CONN_TIMEOUT=5;writetimeout={self.timeout};'


@dataclass
class SQLite(ODBCHandler):
    driver: str = '{SQLite ODBC Driver}'

    @property
    def _connection_string(self) -> str:
        return f'DRIVER={self.driver};DATABASE={self.filename};PWD={self.password};Timeout={self.timeout * 1000};'


@dataclass
class SQLite3(SQLite):
    driver: str = '{SQLite3 ODBC Driver}'


@dataclass
class ExcelHandler(ODBCHandler):
    """Exel ODBC Handler (windows only)
    """
    driver: str = '{Microsoft Excel Driver (*.xls, *.xlsx, *.xlsm, *.xlsb)}'

    @property
    def _connection_string(self) -> str:
        return f'DRIVER={self.driver};DBQ={self.filename};ReadOnly=1;'
