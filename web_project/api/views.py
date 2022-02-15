from django.db.models import Q
from django.http import JsonResponse, HttpResponse
from search.searcher import searcher
from search.models import (
    types, queries)
from lib.decorators import (
    ViewMethod, ViewAuth, ViewExcept, ViewRmVaryHeader, ViewInputValidation)
from lib.response import Response
from .import forms
import logging
from JARVIS.enums import SERVER_VERSION
logger = logging.getLogger(__name__)


# ================================= TEST ==================================
@ViewRmVaryHeader()
def test(request):
    return JsonResponse({'status': 'success', 'message': 'OK'})


# ================================= PING ==================================
@ViewMethod(method=['GET'])
def ping(request):
    return HttpResponse(f"JARVIS (version: {SERVER_VERSION})")


# ================================= TYPES =================================
@ViewMethod(method=['GET'])
# @ViewAuth()
@ViewExcept(message='Ошибка получения данных')
@ViewRmVaryHeader()
def type_list(request):
    result_types = types.objects.filter(active=True, queries__active=True).distinct().order_by('priority').values()
    return Response.json_data_response(data=list(result_types))


# ================================= QUERIES ===============================
@ViewMethod(method=['GET'])
# @ViewAuth()
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
        result = query.to_dict()
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
    query = queries.objects.filter(
        # only active queries
        active=True,
        # only active types
        typename__active=True,
        # only permitted queries
        cpi=True,
        typename__typename=request.pydantic_model.typename,
        name=request.pydantic_model.queryname
    ).prefetch_related('source').first()

    # подготавливаем данные
    init_dict = query.to_dict(
        search_text=request.pydantic_model.value,
        username=request.user.username)

    # searcher class init
    try:
        query = searcher(init_dict=init_dict, with_preparation=True)
    except Exception as error:
        return Response.json_response(message=f'Ошибка подготовки запроса: {error}')

    # executing query
    is_data, response = query.execute()

    if not response and query.errors:
        return Response.json_response(message=query.errors_as_string)

    # if is not data, redirect (iframe)
    if not is_data:
        return Response.json_response(message='Ошибка запроса: результатом является ссылка')

    return Response.json_data_response(data=response, message=query.errors_as_string)
