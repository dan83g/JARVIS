from unittest import result
from django.shortcuts import render, redirect
from django.views import View
from django.db.models import Q
from django.core.cache import cache
import re as regex

from search.exceptions import (
    RedisGetError, RedisSetError, DBTypesDoNotExist)
from . import models, forms
import logging
from .searcher import searcher, searchers
from lib.response import Response
from lib.log import Log, LoggingHandlers
from lib.decorators import (
    ViewExcept, ViewRmVaryHeader, ViewAuth, ViewMethod, ViewInputValidation)
from JARVIS.enums import (
    REDIS_CACHE_TTL, SERVER_VERSION, QUERY_LOGGING, HTTP_ERROR_CODE)
from .service import Search, TypeDetector, AutoComplete
from JARVIS.enums import HTTP_ERROR_CODE
logger = logging.getLogger(__name__)


class SearchView(View):
    """User settings View
    """

    # @staticmethod
    # @ViewAuth()
    # @ViewInputValidation(model=forms.SearchModel)
    # @ViewRmVaryHeader()
    # def get(request, typename: str = None, name: str = None, *args, **kwargs):
    #     return render(request, template_name='index.html', context={'SERVER_VERSION': SERVER_VERSION})
    
        # если тип заранее не определен, то определяем его по регуляркам
        # if not typename:
        #     # если typename не передается, то пытаемя найти по всем регуляркам
        #     types = models.types.objects.filter(active=True).order_by('priority', 'typename')
        #     for row in types:
        #         # getting values from regexp
        #         match = regex.search(row.regexp, request.pydantic_model.value)
        #         if match:
        #             typename = row.typename
        #             break

        # # query
        # queries = models.queries.objects.filter(
        #     # only active queries
        #     Q(active=True),
        #     # only active types
        #     Q(typename__active=True),
        #     # only for active sources
        #     Q(source__active=True),
        #     # security filter
        #     Q(group__id__isnull=True) | Q(group__in=request.user.groups.all()),
        #     # addiditional filter if typename or query name is present
        #     **{key: value for key, value in {'typename__typename': typename, 'name': name}.items() if value}
        # ).prefetch_related('source').order_by('position').distinct()

        # if for user and existing input data no queries
        # if not queries:
        #     return Response.json_response(message='Для текущих данных запросов нет', status_code=HTTP_ERROR_CODE)

        # init searchers
        # query_list = searchers(
        #     queries,
        #     search_text=request.pydantic_model.value,
        #     username=request.user.username,
        #     date_from=request.pydantic_model.date_from,
        #     date_to=request.pydantic_model.date_to)

        # if no identificaors in input text
        # if query_list and query_list[0].value is None:
        #     return Response.json_response(message='Идентификаторов в тексте не выявлено')

        # # caching list of queries in redis cache
        # new_queries = query_list.to_dict_list()
        # for query in new_queries:
        #     cache.set(query['id'], query, timeout=REDIS_CACHE_TTL)

        # context
        # context = {
        #     'SERVER_VERSION': SERVER_VERSION,
        #     'typename': typename,
        #     'queries': new_queries,
        #     'value': new_queries[0]['value'] if new_queries and 'value' in new_queries[0] else ""}

        # # logging query
        # if QUERY_LOGGING:
        #     Log(
        #         # handlers=[LoggingHandlers.FILE, LoggingHandlers.KAFKA],
        #         handlers=[LoggingHandlers.FILE],
        #         username=request.user.username,
        #         typename=typename,
        #         values=[item['value'] for item in query_list[0].values]).log()

        # render
        # return render(request, template_name='index.html', context=context)

    @staticmethod
    @ViewAuth()
    @ViewInputValidation(model=forms.SearchModel)
    @ViewExcept(message="При подгоотовке запросов возникла ошибка")
    @ViewRmVaryHeader()
    def post(request, typename: str = None, name: str = None, *args, **kwargs):
        # add data to autocomplete
        try:
            AutoComplete(request.pydantic_model.value).add_text_to_redis()
        except RedisSetError:
            pass
        # prepare Search queries
        search_object = Search(
            user=request.user,
            typename=typename,
            name=name,
            value=request.pydantic_model.value,
            date_from=request.pydantic_model.date_from,
            date_to=request.pydantic_model.date_to,
            is_log=QUERY_LOGGING
        )
        data = search_object.execute()
        return Response.json_data_response(data=data)


@ViewMethod(method=['GET'])
@ViewAuth()
@ViewRmVaryHeader()
def query(request, hash: str = None):
    """query from page

    :param hash: index in redis cache for retrieving cached query, defaults to None
    :type hash: str, optional
    """

    if not hash:
        return Response.json_response(message='Присланы некоректные данные', status_code=400)

    # retrieving query from redis cache
    try:
        init_dict = cache.get(str(hash))
        if not init_dict:
            raise ValueError('Запрос отсутсвует в REDIS')
    except Exception as error:
        return Response.json_response(message=f'Ошибка получения запроса из REDIS: {error}')

    # set username
    init_dict['username'] = request.user.username
    init_dict['search_text'] = request.GET.get('value', None)

    try:
        query = searcher(init_dict=init_dict, with_preparation=bool(init_dict['search_text']))
    except Exception as error:
        return Response.json_response(message=f'Ошибка подготовки запроса: {error}')

    # executing query
    is_data, result = query.execute()

    if not result and query.errors:
        return Response.json_response(message=query.errors_as_string)

    # if IFrame then redirect
    if not is_data:
        return redirect(result)

    # all other
    return Response.json_data_response(data=result, message=query.errors_as_string)


@ViewMethod(method=['GET'])
@ViewAuth()
@ViewInputValidation(model=forms.BaseSearchModel)
@ViewRmVaryHeader()
def value_info(request, *args, **kwargs):
    autocomplete = []
    try:
        autocomplete = AutoComplete(request.pydantic_model.value).get_text_list()
    except (RedisGetError, ) as error:
        logger.error(f"{error}")

    typename = ""
    try:
        typename = TypeDetector(request.pydantic_model.value).detect() or ""
    except (DBTypesDoNotExist) as error:
        logger.error(f"{error}")
    return Response.json_data_response(data={'typename': typename, 'autocomplete': autocomplete})
