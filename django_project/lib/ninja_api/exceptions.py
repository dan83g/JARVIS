from .api import Ninja
from ninja.errors import (
    ValidationError, AuthenticationError)

api = Ninja().get_api()


class BasicHttpError(Exception):
    pass


# ======================== 400 ================================
class BadRequestError(BasicHttpError):
    def __init__(self, message: str = ''):
        self.message = message
        super().__init__("Bad Request")


@api.exception_handler(BadRequestError)
def bad_request(request, exc):
    return api.create_response(
        request,
        {"message": exc.message if exc.message else "Bad Request"},
        status=400
    )


@api.exception_handler(ValidationError)
def validation_errors(request, exc):
    return api.create_response(
        request,
        {"message": 'Bad request: ' + '; '.join(f"{'.'.join(err['loc'])}: {err['type']}, {err['msg']}" for err in exc.errors)},
        status=400
    )


# ======================== 401 ================================
class UnauthorizedError(BasicHttpError):
    def __init__(self):
        super().__init__("Unauthorized")


@api.exception_handler(UnauthorizedError)
def unauthorized(request, exc):
    return api.create_response(
        request,
        {"message": "Unauthorized"},
        status=401
    )


@api.exception_handler(AuthenticationError)
def authentication_error(request, exc):
    return api.create_response(
        request,
        {"message": "Unauthorized"},
        status=401
    )


# ======================== 403 ================================
class ForbiddenError(BasicHttpError):
    def __init__(self):
        super().__init__("Forbidden")


@api.exception_handler(ForbiddenError)
def forbidden(request, exc):
    return api.create_response(
        request,
        {"message": "Forbidden"},
        status=401,
    )


# ======================== 422 ================================
class UnprocessableEntityError(BasicHttpError):
    def __init__(self, message: str = ''):
        self.message = message
        super().__init__("Unprocessable Entity")


@api.exception_handler(UnprocessableEntityError)
def unprocessable_entity(request, exc):
    return api.create_response(
        request,
        {"message": exc.message if exc.message else "Unprocessable Entity"},
        status=422
    )


# ======================== 503 ================================
class ServiceUnavailableError(BasicHttpError):
    def __init__(self):
        super().__init__("Service Unavailable")


@api.exception_handler(ServiceUnavailableError)
def service_unavailable(request, exc):
    return api.create_response(
        request,
        {"message": "Service Unavailable"},
        status=503,
    )
