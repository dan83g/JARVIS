from dataclasses import dataclass, field
from requests import request
from requests.auth import HTTPBasicAuth
from requests.models import Response
from orjson import loads, JSONDecodeError
from lib.parsing import Parser, ParserException
from .abstract import HandlerAbstractFactory
from .exceptions import HandlerConnectionError, HandlerExecutionError


@dataclass
class HTTPHandler(HandlerAbstractFactory):
    """Hanler for HTTP queries
    """

    protocol: str = 'http'
    host: str = 'host'
    port: int | None = None
    prepared_query: str = ''
    method: str = 'GET'
    user: str = ''
    password: str = ''
    timeout: int = 30
    headers: dict | str = field(default_factory=dict)
    source_headers: dict | str = field(default_factory=dict)
    request_data: str | None = ''
    code_type: str = 'text'
    code: str = ''

    def __post_init__(self) -> None:
        self.url = self.prepared_query
        self.request_data_bytes: bytes = self.request_data.encode('utf-8') if isinstance(self.request_data, str) else b''
        self.headers = self._join_headers(source_headers=self.source_headers, query_headers=self.headers)

    @staticmethod
    def service_url(protocol: str, host: str, port: int | None) -> str:
        """generating service url without path

        :param protocol: protocol name (http, https)
        :type protocol: str
        :param host: hostname ot IP
        :type host: str
        :param port: service port
        :type port: int | None
        :return: service url
        :rtype: str
        """
        _port = f':{port}' if port not in (None, 0, 80, 443) else ''
        return f'{protocol or "http"}://{host}{_port}'

    @staticmethod
    def full_url(protocol: str, host: str, port: int | None, relative_url: str = '') -> str:
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
    def auth(self) -> HTTPBasicAuth | None:
        """return HTTPBasicAuth
        """
        if not self.user:
            return
        return HTTPBasicAuth(self.user, self.password)

    @classmethod
    def _convert_headers(cls, headers: None | str | dict) -> dict:
        """convert headers to Dict

        :param headers: HTTP headers in json format
        :type headers: None | str | dict
        :return: headers in dict
        :rtype: dict
        """
        if not headers:
            return {}

        if isinstance(headers, dict):
            return headers.copy()

        try:
            return loads(headers)
        except JSONDecodeError:
            return {}

    @classmethod
    def _join_headers(cls, source_headers: None | str | dict, query_headers: None | str | dict) -> dict:
        """join headers with qquery headers priority

        :param source_headers: source headers
        :type source_headers: None | str | dict
        :param query_headers: query headers
        :type query_headers: None | str | dict
        :return: joined headers
        :rtype: dict
        """
        headers = cls._convert_headers(source_headers)
        headers.update(cls._convert_headers(query_headers))
        return headers

    def _handle_error_response(self, response: Response) -> None:
        """handling error response

        :param response: requests Response
        :type response: Response
        :return: nothing, filling self.errors
        :rtype: None
        """
        if (response.status_code in (400, 401, 422) and response.headers.get('content-type') == 'application/json'):
            try:
                response_json = loads(response.text)
                if ({'message'} <= set(response_json.keys()) and response_json['message']):
                    raise HandlerExecutionError(message=f'Ошибка {response.status_code}({response.reason}) WEB-сервиса: {response_json["message"]}')
            except (JSONDecodeError, TypeError) as error:
                raise HandlerExecutionError(message=f'Ошибка {response.status_code}({response.reason}) WEB-сервиса') from error
        else:
            raise HandlerExecutionError(message=f'Ошибка {response.status_code}({response.reason}) WEB-сервиса: {response.text[:500]}')

    def _handle_response(self, response: Response) -> list[dict]:
        """handling valid response

        :param response: requests Response
        :type response: Response
        :return: data values
        :rtype: list[dict]
        """
        try:
            return Parser(text=response.text, code=self.code, parser=self.code_type).execute()
        except ParserException as error:
            raise HandlerExecutionError(message=f'Ошибка парсинга данных: {error}') from error
        except Exception as error:
            raise HandlerExecutionError(message=f'Ошибка парсинга данных: {error}') from error

    def _request(self) -> Response:
        return request(
            self.method,
            self.full_url(protocol=self.protocol, host=self.host, port=self.port, relative_url=self.url),
            auth=self.auth,
            timeout=self.timeout,
            data=self.request_data_bytes,
            headers=self.headers if isinstance(self.headers, dict) else None,
            verify=False)

    def execute(self) -> list[dict]:
        """Execute HTTP query"""

        try:
            response = self._request()
        except Exception as error:
            raise HandlerExecutionError(message=f'Ошибка выполнения запроса: {error}') from error

        # handling error response
        if response.status_code != 200:
            self._handle_error_response(response)
            return []

        # handling response
        return self._handle_response(response)

    def ping(self) -> bool:
        try:
            response = self._request()
        except Exception as error:
            raise HandlerConnectionError(message=f'Удаленный WEB-сервис не доступен: {error}') from error
        # handling error response
        if response.status_code != 200:
            self._handle_error_response(response)
        return True


@dataclass
class WebHandler(HTTPHandler):
    method: str = 'GET'

    def execute(self) -> str:
        """return url for iframe
        """
        return self.full_url(protocol=self.protocol, host=self.host, port=self.port, relative_url=self.url)

    def ping(self) -> bool:
        self.url = '/'
        return super().ping()


@dataclass
class JarvisHandler(HTTPHandler):
    method: str = 'POST'
    code_type: str = 'json'
    code: str = '$.data[*]'

    def _handle_response(self, response: Response) -> list[dict] | None:

        try:
            response_json = loads(response.text)
            if ({'message', 'status'} <= set(response_json.keys())
                    and response_json['message']
                    and response_json['message'] != 'OK'):
                raise HandlerExecutionError(message=response_json["message"])
        except Exception:
            pass
        return super()._handle_response(response=response)

    def ping(self) -> bool:
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

    def ping(self) -> bool:
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

    def ping(self) -> bool:
        self.url = '/ping'
        return super().ping()
