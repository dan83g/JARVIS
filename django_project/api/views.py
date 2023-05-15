from django.db.models import Q
from django.http import HttpResponse
from ninja import Router, File
from ninja.files import UploadedFile

# from search.searcher import Searcher
from search.models import (
    types, queries)
from search.schemas import QueryRequestSchema
from search.service import SearchAPI
from search.exceptions import (
    SearcherObjectExecutionError, SearcherObjectNotCreated,
    QueriesDoesNotExist, SearcherObjectReturnUrl)
from lib.decorators import (
    set_vary_header, handle_exceptions, authenticated)
from lib.ninja_api.schemas import (
    MessageResponseSchema, DataResponseSchema, MessageResponseDict)
from .exceptions import (
    UploadFileNotExists, UploadFileUnknownType, TesseractException)
from .service import OCR
from lib.ninja_api.exceptions import (
    UnprocessableEntityError)
from JARVIS.enums import (
    SERVER_VERSION, QUERY_LOGGING_HANDLER)

from .schemas import (
    TypesResponseSchema, QueryResponseSchema
)
import logging

logger = logging.getLogger(__name__)
router = Router()


# ================================= PING ==================================
@router.get("/v1/ping", response=MessageResponseSchema)
def ping(request):
    return MessageResponseDict(message=f"JARVIS (version: {SERVER_VERSION})")


# ================================= TYPES =================================
@router.get("/v1/type.list", response=TypesResponseSchema)
@authenticated()
@handle_exceptions(message="Unexpected Error")
@set_vary_header('Accept-Encoding')
def type_list(request):
    """return list of identificator types

    :param request: Django HttpRequest
    :type request: HttpRequest
    :raises UnprocessableEntityError: when error raises
    :return: list of identificator types
    :rtype: TypesResponseSchema
    """
    try:
        return TypesResponseSchema(data=list(types.objects.filter(active=True, queries__active=True).distinct().order_by('priority')), message="OK")
    except Exception as error:
        raise UnprocessableEntityError(message=f"Types list error: {error}") from error


# ================================= QUERIES ===============================
@router.get("/v1/query.list", response=QueryResponseSchema)
@authenticated()
@handle_exceptions(message="Unexpected Error")
@set_vary_header('Accept-Encoding')
def query_list(request):
    try:
        return QueryResponseSchema(
            message="OK",
            data=list(queries.objects.filter(
                # only active queries
                Q(active=True),
                # only active types
                Q(typename__active=True),
                # only permitted queries
                Q(cpi=True)
            ).prefetch_related('source'))
        )
    except Exception as error:
        raise UnprocessableEntityError(message=f"Types list error: {error}") from error


@router.post("/v1/query.data", response=DataResponseSchema)
@authenticated()
@handle_exceptions(message="Unexpected Error")
@set_vary_header('Accept-Encoding')
def query_data(request, params: QueryRequestSchema):
    try:
        params_dict = params.dict()
        params_dict.update(dict(user=request.user, log_type=QUERY_LOGGING_HANDLER))
        return SearchAPI.init_from_dict(initial_dict=params_dict).execute()
    except (SearcherObjectExecutionError, SearcherObjectNotCreated, QueriesDoesNotExist, SearcherObjectReturnUrl) as error:
        raise UnprocessableEntityError(message=f'{error}') from error
    except Exception as error:
        raise UnprocessableEntityError(message=f'Query execution error: {error}') from error


# ================================= OCR ==================================
@router.post("/v1/ocr", response=DataResponseSchema)
@handle_exceptions(message="Unexpected Error")
def ocr(request, file: UploadedFile = File(...)) -> HttpResponse:
    """Return text from image

    :param file: Image file, defaults to File(...)
    :type file: UploadedFile, optional
    :return: text from image
    :rtype: HttpResponse(str)
    """
    try:
        ocr = OCR(user=request.user, file=file)
        return HttpResponse(ocr.get_text())
    except (UploadFileNotExists, UploadFileUnknownType) as error:
        return HttpResponse(f'{error}', status=400)
    except TesseractException as error:
        return HttpResponse(f'{error}', status=500)
    except Exception as error:
        return HttpResponse(f'Unknown exception: {error}', status=500)
