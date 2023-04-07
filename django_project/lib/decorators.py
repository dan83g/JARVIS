from django.forms import Form
from pydantic import BaseModel, ValidationError
from abc import abstractmethod
from functools import wraps
import logging
import typing
from .response import Response
from JARVIS.enums import HTTP_ERROR_CODE


class Description:
    """Class-decorator for catching errors

    Args may not be present.
    :param description: defult return value
    :type description: Any

    :returns: wrapper function
    :rtype: function
    """
    def __init__(self, description: str = 'Unknown description') -> None:
        self.description = description

    def __call__(self, function):
        function.short_description = self.description

        @wraps(function)
        def wrapper(*args, **kwargs):
            return function(*args, **kwargs)
        return wrapper


class Except:
    """Class-decorator for catching errors

    :param default: defult return value
    :type default: Any
    :param logger: obj of logging library
    :type logger: logging.Logger

    :returns: wrapper function
    :rtype: Any
    """
    def __init__(self, default=None, logger=None) -> None:
        self.default = default
        self.logger = logger if logger else logging.getLogger(__name__)

    def __call__(self, function):
        @wraps(function)
        def wrapper(*args, **kwargs):
            try:
                return function(*args, **kwargs)
            except Exception as error:
                self.logger.error(
                    f"Function: {function.__name__}; Error: {error}",
                    stack_info=True
                )
                return self.default
        return wrapper


class BaseDecoratorView:
    """Base class for view"""
    @abstractmethod
    def __init__(self, *args, **kwargs) -> None:
        pass

    @abstractmethod
    def __call__(self, *args, **kwargs) -> None:
        pass


class ViewRmVaryHeader(BaseDecoratorView, Response):
    """Django view-decorator for Vary header processing

    :returns: wrapper function
    :rtype: django Response model
    """
    def __init__(self, *args, **kwargs) -> None:
        pass

    def __call__(self, view):
        @wraps(view)
        def wrapper(request, *args, **kwargs):
            response = view(request, *args, **kwargs)
            # response.remove_vary = True
            return response
        return wrapper


class ViewMethod(BaseDecoratorView, Response):
    """Django view-decorator for method filtering

    :param method: requesst method
    :type method: list
    :param message: return message
    :type message: str
    :param status: status
    :type status: str
    :param status_code: Http status response code
    :type status_code: int
    :param logger: logging.Logger object
    :type logger: logging.Logger

    :returns: wrapper function
    :rtype: django Response model
    """
    def __init__(self, method: list = ['GET'], message: str = 'Метод не поддерживается', status: str = 'error', status_code: int = 400) -> None:
        self.method = method
        self.message = message
        self.status = status
        self.status_code = status_code

    def __call__(self, view):
        @wraps(view)
        def wrapper(request, *args, **kwargs):
            if request.method not in self.method:
                return self.json_response(message=f'{self.message}: {request.method}', status=self.status, status_code=self.status_code)
            return view(request, *args, **kwargs)
        return wrapper


class ViewAuth(BaseDecoratorView, Response):
    """Django view-decorator with authentification

    :param form: used from
    :type form: Form
    :param message: return message
    :type message: str
    :param status: status
    :type status: str
    :param status_code: Http status response code
    :type status_code: int
    :param logger: logging.Logger object
    :type logger: logging.Logger

    :returns: wrapper function
    :rtype: django Response model
    """
    def __init__(self, message: str = 'Пользователь не авторизован', status: str = 'error', status_code: int = 401) -> None:
        self.message = message
        self.status = status
        self.status_code = status_code

    def __call__(self, view):
        @wraps(view)
        def wrapper(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return self.json_response(message=self.message, status=self.status, status_code=self.status_code)
            return view(request, *args, **kwargs)
        return wrapper


class ViewExcept(BaseDecoratorView, Response):
    """Django view-decorator for catching errors

    :param message: return message
    :type message: str
    :param status: status
    :type status: str
    :param status_code: Http status response code
    :type status_code: int
    :param logger: logging.Logger object
    :type logger: logging.Logger

    :returns: wrapper function
    :rtype: django Response model
    """
    def __init__(self, message: str = 'Ошибка', status: str = 'error', status_code: int = HTTP_ERROR_CODE, logger=None) -> None:
        self.message = message
        self.status = status
        self.status_code = status_code
        self.logger = logger if logger else logging.getLogger(__name__)

    def __call__(self, view):
        @wraps(view)
        def wrapper(request, *args, **kwargs):
            try:
                return view(request, *args, **kwargs)
            except Exception as error:
                self.logger.error(f"View: {view.__name__}; Error: {error}", stack_info=True)
                return self.json_response(
                    message=f'{self.message}: {error}',
                    status=self.status,
                    status_code=self.status_code
                )
        return wrapper


class ViewForm(BaseDecoratorView, Response):
    """Django view-decorator with specific form usage

    :param form: used from
    :type form: Form
    :param message: return message
    :type message: str
    :param status: status
    :type status: str
    :param status_code: Http status response code
    :type status_code: int

    :returns: wrapper function
    :rtype: django Response model
    """
    def __init__(self, form: typing.Union[Form, None] = None, message: str = 'Ошибка входных данных', status: str = 'error', status_code: int = 400) -> None:
        self.form = form
        self.message = message
        self.status = status
        self.status_code = status_code

    def __call__(self, view):
        @wraps(view)
        def wrapper(request, *args, **kwargs):
            # if self.is_json:
            #     form = self.form(json.loads(request.body))
            # else:
            #     form = self.form(getattr(request, request.method))
            form = self.form(getattr(request, request.method))
            if not form.is_valid():
                # возвращаем ошибку
                errors = ', '.join('{}: {}'.format(attr, error[0]) for attr, error in form.errors.items())
                return self.json_response(message=f'{self.message}: {errors}', status=self.status, status_code=self.status_code)
            request.form = form
            return view(request, *args, **kwargs)
        return wrapper


class ViewInputValidation(BaseDecoratorView, Response):
    """Django view-decorator with specific form usage

    :param model: pydantic validation model
    :type model: pydantic model
    :param message: return message
    :type message: str
    :param status: status
    :type status: str
    :param status_code: Http status response code
    :type status_code: int

    :returns: wrapper function
    :rtype: django Response model
    """
    def __init__(self, model: typing.Union[BaseModel, None] = None, message: str = 'Ошибка входных данных', status: str = 'error', status_code: int = 400) -> None:
        self.model = model
        self.message = message
        self.status = status
        self.status_code = status_code

    def __call__(self, view):
        @wraps(view)
        def wrapper(request, *args, **kwargs):
            pydantic_model = None
            try:
                if request.body:
                    if request.content == 'application/json':
                        pydantic_model = self.model.parse_raw(request.body)
                    elif request.content == 'application/x-www-form-urlencoded':
                        pydantic_model = self.model(**request.POST.dict())
                else:
                    pydantic_model = self.model(**request.GET.dict())
            except ValidationError as error:
                errors = ', '.join(f"{err['loc'][0]}: {err['type']}, {err['msg']}" for err in error.errors())
                return self.json_response(message=f'{self.message}: {errors}', status=self.status, status_code=self.status_code)
            request.pydantic_model = pydantic_model
            return view(request, *args, **kwargs)
        return wrapper
