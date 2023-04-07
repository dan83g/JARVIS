from django.db.models import Q
from django.http import HttpResponse
from search.searcher import Searcher
from search.models import (
    types, queries)
from lib.decorators import (
    ViewMethod, ViewAuth, ViewExcept, ViewRmVaryHeader, ViewInputValidation)
from lib.ninja_api import Ninja
from lib.ninja_api.schemas import (
    MessageResponseSchema, DataResponseSchema, MessageResponseDict, DataResponseDict)
from .exceptions import (
    UploadFileNotExists, UploadFileUnknownType, TesseractException)
from .service import OCR
from lib.response import Response
from .import forms
import logging
from JARVIS.enums import SERVER_VERSION
from ninja import Router
from lib.ninja_api.exceptions import (
    BadRequestError, UnprocessableEntityError)
from .schemas import (
    TypesSchema
)
logger = logging.getLogger(__name__)


router = Router()


# ================================= OCR ==================================
@ViewRmVaryHeader()
@ViewMethod(method=['POST'])
def ocr(request):
    try:
        ocr = OCR(user=request.user, files=request.FILES)
        return HttpResponse(ocr.get_text())
    except (UploadFileNotExists, UploadFileUnknownType) as error:
        return HttpResponse(f'{error}', status=400)
    except TesseractException as error:
        return HttpResponse(f'{error}', status=500)
    except Exception as error:
        return HttpResponse(f'Unknown exception: {error}', status=500)


# ================================= PING ==================================
@router.get("/v1/ping", response=MessageResponseSchema)
def ping(request):
    return MessageResponseDict(message=f"JARVIS (version: {SERVER_VERSION})")


# ================================= TYPES =================================
@router.get("/v1/type.list", response=DataResponseSchema)
@ViewAuth()
@ViewRmVaryHeader()
def type_list(request):
    """return list of identificator types

    :param request: Django HttpRequest
    :type request: HttpRequest
    :raises UnprocessableEntityError: when error raises
    :return: list of identificator types
    :rtype: DataResponseSchema
    """
    try:
        return DataResponseSchema(data=list(types.objects.filter(active=True, queries__active=True).distinct().order_by('priority').values()), message="OK")
    except Exception as error:
        raise UnprocessableEntityError(message=f"Types list error: {error}") from error


# ================================= QUERIES ===============================
@ViewMethod(method=['GET'])
@ViewAuth()
@ViewExcept(message='Ошибка получения данных')
@ViewRmVaryHeader()
def query_list(request):
    '''retrieving existing queries
    '''

    result_query_set = queries.objects.filter(
        # only active queries
        Q(active=True),
        # only active types
        Q(typename__active=True),
        # only permitted queries
        Q(cpi=True),
    ).prefetch_related('source')

    # adding source data to response
    results = []
    for query in result_query_set:
        result = query.selialize()
        results.append(result)
    pydantic_model = forms.ApiQueryList(__root__=results)
    return Response.json_data_response(data=pydantic_model.dict())


@ViewMethod(method=['POST'])
@ViewAuth()
@ViewInputValidation(model=forms.ApiSearchModel)
@ViewExcept(message='Ошибка получения данных')
@ViewRmVaryHeader()
def query_data(request):
    # retrieving data from sql
    query: queries | None = queries.objects.filter(
        # only active queries
        active=True,
        # only active types
        typename__active=True,
        # only permitted queries
        cpi=True,
        typename__typename=request.pydantic_model.typename,
        name=request.pydantic_model.queryname
    ).prefetch_related('source').first()

    if not query:
        return Response.json_response(message=f'Query {request.pydantic_model.queryname} not found')

    # подготавливаем данные
    init_dict: dict = query.selialize(
        search_text=request.pydantic_model.value,
        username=request.user.username)

    # Searcher class init
    try:
        searcher = Searcher.init_from_dict(initial_dict=init_dict, is_changed=True)
    except Exception as error:
        return Response.json_response(message=f'Ошибка подготовки запроса: {error}')

    # executing query
    if (result := searcher.execute()) and not result.is_ok:
        return Response.json_response(message=result.errors_as_string)

    # if is not data, redirect (iframe)
    if result.is_url:
        return Response.json_response(message='Ошибка запроса: результатом является ссылка')

    return Response.json_data_response(data=result.data, message=result.errors_as_string)
