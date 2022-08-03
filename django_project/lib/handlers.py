import logging
import os
from requests.models import Response
from lib.enum import FactoryEnum
from abc import abstractmethod
from dataclasses import dataclass, fields, field
from typing import (
    Union, List, Any, Tuple, Type, Dict, Optional
)
from lib.parsing import Parser, ParserException
import json
from json.decoder import JSONDecodeError
import requests
from requests.auth import HTTPBasicAuth
import pandas as pd
import pandasql as ps
import sql_metadata as sql
import pyodbc
from JARVIS.enums import HTTP_ERROR_CODE
logger = logging.getLogger(__name__)


@dataclass
class HandlerAbstractFactory:
    """ Abstract Factory Class for handlers
    """
    errors: Optional[List[str]] = field(default_factory=list)

    def add_error(self, error: str) -> None:
        self.errors.append(error)

    @property
    def error_string(self) -> str:
        return ', '.join(self.errors)

    @classmethod
    def from_dict(cls, initial_dict: dict = None) -> Type:
        class_fields = {f.name for f in fields(cls)}
        return cls(**{key: value for key, value in initial_dict.items() if key in class_fields and value})

    @abstractmethod
    def execute(self) -> Tuple[List[dict], List[str]]:
        pass

    @abstractmethod
    def ping(self) -> Tuple[bool, List[str]]:
        pass


@dataclass
class ODBCHandler(HandlerAbstractFactory):
    host: str = ''
    port: int = 0
    instance: str = ''
    driver: str = ''
    database: str = ''
    timeout: int = 30
    prepared_query: str = ''
    user: str = ''
    password: str = ''
    filename: str = ''
    connection: Any = None

    def __post_init__(self) -> None:
        try:
            pyodbc.pooling = False
            self.connection = self._connection
        except (pyodbc.Error) as msg:
            self.add_error(f'Ошибка подключение к серверу {self.host}:{self.port}({self.database}): {msg.args[1]}')

    @property
    def _connection(self) -> pyodbc.Connection:
        return pyodbc.connect(self._connection_string, timeout=5)

    @property
    def _connection_string(self) -> str:
        return f'DRIVER={self.driver};SERVER={self.host};PORT={self.port};DATABASE={self.database};UID={self.user};PWD={self.password};'

    def execute(self) -> Tuple[List[dict], List[str]]:
        if not self.connection:
            return [], self.errors

        result_data = []

        try:
            data_frame = pd.read_sql(self.prepared_query, self.connection)
            data_frame.columns = [f'undefined_{index}' if name == '' else name for index, name in enumerate(data_frame.columns)]
            result_data = list(data_frame.T.to_dict().values())
        except Exception as error:
            self.add_error(f'Ошибка выполнения транзакции: {error}')
        finally:
            self.connection.close()
        return result_data, self.errors

    def ping(self) -> Tuple[bool, List[str]]:
        self.prepared_query = 'SELECT 1'
        _, _ = self.execute()
        return True if not self.errors else False, self.errors


@dataclass
class MSSQLHandler(ODBCHandler):
    port: int = 1433
    driver: str = '{ODBC Driver 17 for SQL Server}'

    @property
    def _connection(self) -> pyodbc.Connection:
        connection = pyodbc.connect(self._connection_string, timeout=5, attrs_before={113: 5})
        connection.timeout = self.timeout
        return connection

    @property
    def _connection_string(self) -> str:
        return r"DRIVER={driver};SERVER={host}{instance}{port};{database}UID={user};PWD={password};".format(
            driver=self.driver,
            host=self.host,
            instance=f'\\{self.instance}' if self.instance else '',
            port="" if self.port in (None, 0, 1433) else f",{self.port}",
            database="" if not self.database else f"DATABASE={self.database};",
            user=self.user,
            password=self.password)


@dataclass
class PostgreSQLHandler(ODBCHandler):
    port: int = 5432
    driver: str = '{PostgreSQL Unicode}'

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
    driver: str = '{Microsoft Excel Driver (*.xls, *.xlsx, *.xlsm, *.xlsb)}'

    @property
    def _connection_string(self) -> str:
        return f'DRIVER={self.driver};DBQ={self.filename};ReadOnly=1;'

    @property
    def _connection(self) -> pyodbc.Connection:
        return pyodbc.connect(self._connection_string, timeout=5, autocommit=True)


@dataclass
class ExcelFileHandler(ODBCHandler):

    def __post_init__(self) -> None:
        if not os.path.exists(self.filename):
            self.add_error(f'Файл {self.filename} не существует')
        try:
            self.connection = pd.ExcelFile(self.filename)
        except Exception as error:
            self.add_error(f'Ошибка подключение к файлу {self.filename}, {error}')

    @property
    def _get_tablename(self):
        tables = sql.Parser(self.prepared_query).tables
        if not tables:
            self.add_error('Невозможно выделить имя таблицы из запроса')
            return
        return tables[0]

    def execute(self) -> Tuple[List[dict], List[str]]:
        if not self.connection:
            return [], self.errors

        result_data = []
        try:
            tablename = self._get_tablename
            data_frame = self.connection.parse(tablename.strip("[]"))
            data_frame = ps.sqldf(self.prepared_query.replace(tablename, 'data_frame'), locals())
            data_frame.columns = [f'undefined_{index}' if name == '' else name for index, name in enumerate(data_frame.columns)]
            result_data = list(data_frame.T.to_dict().values())
        except Exception as error:
            self.add_error(f'Ошибка получения данных из файла {self.filename}, {error}')
        return result_data, self.errors

    def ping(self) -> Tuple[bool, List[str]]:
        return True if not self.errors else False, self.errors


@dataclass
class HTTPHandler(HandlerAbstractFactory):
    """Hanler for HTTP queries
    """

    protocol: str = 'http'
    host: str = 'host'
    port: int = None
    prepared_query: str = ''
    method: str = 'GET'
    user: str = ''
    password: str = ''
    timeout: int = 30
    headers: Union[Dict, str] = field(default_factory=dict)
    request_data: str = ''
    code_type: str = 'text'
    code: str = ''

    def __post_init__(self) -> None:
        self.url = self.prepared_query
        self.request_data = self.request_data.encode('utf-8')
        if self.headers and isinstance(self.headers, str):
            try:
                self.headers = json.loads(self.headers)
            except Exception as error:
                self.add_error(f'Ошибка декодирования http-заголовков: {error}')

    @staticmethod
    def service_url(protocol: str, host: str, port: int) -> str:
        """generating service url without path

        :param protocol: protocol name (http, https)
        :type protocol: str
        :param host: hostname ot IP
        :type host: str
        :param port: service port
        :type port: int
        :return: service url
        :rtype: str
        """
        port = f':{port}' if port not in (None, 0, 80, 443) else ''
        return f'{protocol or "http"}://{host}{port}'

    @staticmethod
    def full_url(protocol: str, host: str, port: int, relative_url: str = '') -> str:
        """generating service url with path

        :param protocol: protocol name (http, https)
        :type protocol: str
        :param host: hostname ot IP
        :type host: str
        :param port: service port
        :type port: int
        :param relative_url: relative url if present, defaults to ''
        :type relative_url: str, optional
        :return: service url with path
        :rtype: str
        """
        relative_url = f'/{relative_url}' if relative_url[:1] != '/' else relative_url
        service_url = HTTPHandler.service_url(protocol=protocol, host=host, port=port)
        return f'{service_url}{relative_url}'

    @property
    def auth(self) -> HTTPBasicAuth:
        """return HTTPBasicAuth
        """
        if not self.user:
            return
        return HTTPBasicAuth(self.user, self.password)

    def _handle_error_response(self, response: Response) -> None:
        """handling error response

        :param response: requests Response
        :type response: Response
        :return: nothing, filling self.errors
        :rtype: None
        """
        if (response.status_code in (400, 401, HTTP_ERROR_CODE)
                and response.headers.get('content-type') == 'application/json'):
            try:
                response_json = json.loads(response.text)
                if ({'message', 'status'} <= set(response_json.keys())
                        and response_json['message']):
                    self.add_error(f'Ошибка {response.status_code}({response.reason}) WEB-сервиса: {response_json["message"]}')
            except (JSONDecodeError, TypeError):
                self.add_error(f'Ошибка {response.status_code}({response.reason}) WEB-сервиса')
        else:
            self.add_error(f'Ошибка {response.status_code}({response.reason}) WEB-сервиса: {response.text[:500]}')

    def _handle_response(self, response: Response) -> Union[List[dict], None]:
        """handling valid response

        :param response: requests Response
        :type response: Response
        :return: data values
        :rtype: Union[List[dict], None]
        """
        try:
            return Parser(text=response.text, code=self.code, parser=self.code_type).execute()
        except ParserException as error:
            self.add_error(f'Ошибка парсинга данных: {error}')
        except Exception as error:
            self.add_error(f'Ошибка парсинга данных: {error}')

    def _request(self) -> Response:
        return requests.request(
            self.method,
            self.full_url(protocol=self.protocol, host=self.host, port=self.port, relative_url=self.url),
            auth=self.auth,
            timeout=self.timeout,
            data=self.request_data,
            headers=self.headers,
            verify=False)

    def execute(self) -> Tuple[List[dict], List[str]]:
        """Execute HTTP query"""

        try:
            response = self._request()
        except Exception as error:
            self.add_error(f'Удаленный WEB-сервис не доступен: {error}')
            return [], self.errors

        # handling error response
        if response.status_code != 200:
            self._handle_error_response(response)
            return [], self.errors

        # handling response
        result = self._handle_response(response)

        # отправляем на обработку
        return result, self.errors

    def ping(self) -> Tuple[bool, List[str]]:
        try:
            response = self._request()
        except Exception as error:
            self.add_error(f'Удаленный WEB-сервис не доступен: {error}')
            return False, self.errors

        # handling error response
        if response.status_code != 200:
            self._handle_error_response(response)
            return False, self.errors

        return True, []


@dataclass
class WebHandler(HTTPHandler):
    method: str = 'GET'

    def execute(self) -> Tuple[str, List[str]]:
        """return url for iframe
        """
        return self.full_url(protocol=self.protocol, host=self.host, port=self.port, relative_url=self.url), self.errors

    def ping(self) -> Tuple[bool, List[str]]:
        self.url = '/'
        return super().ping()


@dataclass
class JarvisHandler(HTTPHandler):
    method: str = 'POST'
    code_type: str = 'json'
    code: str = '$.data[*]'

    def _handle_response(self, response: Response) -> Union[List[dict], None]:

        try:
            response_json = json.loads(response.text)
            if ({'message', 'status'} <= set(response_json.keys())
                    and response_json['message']
                    and response_json['message'] != 'OK'):
                self.add_error(response_json["message"])
        except Exception:
            pass
        return super()._handle_response(response=response)

    def ping(self) -> Tuple[bool, List[str]]:
        self.method = 'GET'
        self.url = '/api/v1/ping'
        return super().ping()


@dataclass
class ElasticHandler(HTTPHandler):
    method: str = 'GET'
    code_type: str = 'json'
    code: str = '$.hits.hits[*]._source[*]'

    def __post_init__(self) -> None:
        super().__post_init__()
        if self.method == "GET":
            self.request_data = None

    def ping(self) -> Tuple[bool, List[str]]:
        self.url = '/_cat/health'
        return super().ping()


@dataclass
class ClickHouseHandler(HTTPHandler):
    code_type: str = 'json'
    code: str = '$.data[*]'

    def __post_init__(self) -> None:
        self.method = 'POST'
        self.url = '/?add_http_cors_header=1&query='
        self.request_data = f'{self.prepared_query} Format JSON'

    def ping(self) -> Tuple[bool, List[str]]:
        self.url = '/ping'
        return super().ping()


class HandlerType(FactoryEnum):
    M = MSSQLHandler
    R = HTTPHandler
    W = WebHandler
    J = JarvisHandler
    E = ElasticHandler
    C = ClickHouseHandler
    PGS = PostgreSQLHandler
    MYS = MySQLHandler
    EXL = ExcelFileHandler
    SL1 = SQLite
    SL3 = SQLite3


@dataclass
class Handler:
    """Handler factory class
    """
    handler: Union[HandlerType, str]
    initial_dict: Dict = field(default_factory=dict)

    def __post_init__(self) -> None:
        if isinstance(self.handler, str):
            self.handler = HandlerType.get_member(self.handler)

    def _create_factory(self, handler: HandlerType) -> HandlerAbstractFactory:
        return handler.factory.from_dict(initial_dict=self.initial_dict)

    def execute(self) -> Tuple[List[dict], List[str]]:
        """execute handler
        """
        factory = self._create_factory(handler=self.handler)
        return factory.execute()

    def ping(self) -> Tuple[bool, List[str]]:
        """ping source
        """
        factory = self._create_factory(handler=self.handler)
        return factory.ping()
