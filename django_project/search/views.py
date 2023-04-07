import json
from django.shortcuts import render
from .exceptions import (
    DBTypesDoNotExist, SearchValueNotDefined,
    RedisGetError, RedisSetError, RedisNoDataError,
    SearcherObjectNotCreated, SearcherObjectExecutionError)
from lib.response import Response
from lib.decorators import (
    ViewRmVaryHeader, ViewAuth)
from JARVIS.enums import (
    SERVER_VERSION, QUERY_LOGGING_HANDLER)
from .service import Search, TypeDetector, AutoComplete, SearchQuery
from ninja import Router, Query
from lib.ninja_api.exceptions import UnprocessableEntityError
from lib.ninja_api.schemas import (
    DataResponseSchema, DataResponseDict
)
from .schemas import (
    SearchRequestSchema, QueryRequestSchema, ValueRequestSchema)
import logging

logger = logging.getLogger(__name__)
router = Router()


# class SearchView(View):
#     """User settings View
#     """

#     @staticmethod
#     @ViewAuth()
#     @ViewInputValidation(model=forms.SearchModel)
#     @ViewRmVaryHeader()
#     def get(request, typename: str | None = None, queryname: str | None = None, *args, **kwargs):
#         # return redirect('/', typename=typename, queryname=queryname)

#         # add data to autocomplete
#         try:
#             AutoComplete(request.pydantic_model.value).add_text_to_redis()
#         except RedisSetError:
#             pass
#         # prepare Search queries
#         search_object = Search(
#             user=request.user,
#             value=request.pydantic_model.value,
#             typename=typename,
#             queryname=queryname,
#             date_from=request.pydantic_model.date_from,
#             date_to=request.pydantic_model.date_to,
#             is_log=QUERY_LOGGING
#         )
#         # state = {text: string}
#         initial_state = json.dumps(search_object.execute())
#         return render(request, template_name='index.html', context={'SERVER_VERSION': SERVER_VERSION, 'initial_state': initial_state})

#     @staticmethod
#     @ViewAuth()
#     @ViewInputValidation(model=forms.SearchModel)
#     @ViewExcept(message="При подгоотовке запросов возникла ошибка")
#     @ViewRmVaryHeader()
#     def post(request, typename: str | None = None, queryname: str | None = None, *args, **kwargs):
#         # add data to autocomplete
#         try:
#             AutoComplete(request.pydantic_model.value).add_text_to_redis()
#         except RedisSetError:
#             pass

#         #  todo: try except with custom errors and raise ninja errors

#         # prepare Search queries
#         search_object = Search(
#             user=request.user,
#             value=request.pydantic_model.value,
#             typename=typename,
#             queryname=queryname,
#             date_from=request.pydantic_model.date_from,
#             date_to=request.pydantic_model.date_to,
#             is_log=QUERY_LOGGING
#         )
#         data = search_object.execute()
#         return Response.json_data_response(data=data)


@router.api_operation(['GET', 'POST'], '/', response=DataResponseSchema)
def search(request, params: SearchRequestSchema = Query(...)):
    try:
        # SearchRequestSchema is dinamically created (type ignore)
        AutoComplete(value=params.value).add_text_to_redis()  # type: ignore
    except RedisSetError:
        pass

    # todo: try except with custom errors and raise ninja errors
    initial_dict = params.dict()
    initial_dict.update(dict(user=request.user, log_type=QUERY_LOGGING_HANDLER))
    #     dict(username=request.user.username, log_type=QUERY_LOGGING)
    # )
    search_object = Search.init_from_dict(initial_dict=initial_dict)
    try:
        data = search_object.execute()
    except SearchValueNotDefined as error:
        raise UnprocessableEntityError(message=f'{error}') from error

    if request.method == 'POST':
        return Response.json_data_response(data=data)
    return render(request, template_name='index.html', context={'SERVER_VERSION': SERVER_VERSION, 'initial_state': json.dumps(data)})

# class SearchPath:

#     @staticmethod
#     def execute(request, params: dict):
#         if not (value := params.get('value')):
#             raise UnprocessableEntityError(message="Value not found")

#         try:
#             AutoComplete(value=value).add_text_to_redis()
#         except RedisSetError:
#             pass

#         # todo: try except with custom errors and raise ninja errors
#         # todo: do move path parameters (type and query) to query parameters

#         # prepare Search queries
#         search_object = Search(
#             user=request.user,
#             value=value,
#             typename=params.get('typename'),
#             queryname=params.get('queryname'),
#             date_from=params.get('date_from'),
#             date_to=params.get('date_to'),
#             is_log=QUERY_LOGGING
#         )

#         try:
#             data = search_object.execute()
#         except SearchValueNotDefined as error:
#             raise UnprocessableEntityError(message=f'{error}') from error

#         if request.method == 'POST':
#             return Response.json_data_response(data=data)
#         return render(request, template_name='index.html', context={'SERVER_VERSION': SERVER_VERSION, 'initial_state': json.dumps(data)})

#     @staticmethod
#     @router.api_operation(['GET', 'POST'], '/', response=DataResponseSchema)
#     def search(request, params: SearchRequestSchema = Query(...)):
#         return SearchPath.execute(request=request, params=params.dict())

#     @staticmethod
#     @router.api_operation(['GET', 'POST'], '/{typename}/', response=DataResponseSchema)
#     def search_typename(request, typename: str, params: SearchRequestSchema = Query(...)):
#         params_dict = params.dict()
#         params_dict.update(dict(typename=typename))
#         return SearchPath.execute(request=request, params=params_dict)

#     @staticmethod
#     @router.api_operation(['GET', 'POST'], '/{typename}/{queryname}/', response=DataResponseSchema)
#     def search_typename_queryname(request, typename: str, queryname: str, params: SearchRequestSchema = Query(...)):
#         params_dict = params.dict()
#         params_dict.update(dict(typename=typename, queryname=queryname))
#         return SearchPath.execute(request=request, params=params_dict)


@router.get("/query", response=DataResponseSchema)
@ViewAuth()
@ViewRmVaryHeader()
def query(request, params: QueryRequestSchema = Query(...)):
    """Query from page
    """
    # todo add autocomplete if value exists
    try:
        params_dict = params.dict()
        params_dict.update(dict(username=request.user.username))
        return SearchQuery.init_from_dict(initial_dict=params_dict).execute()
    except (SearcherObjectExecutionError, SearcherObjectNotCreated, RedisNoDataError, RedisGetError) as error:
        raise UnprocessableEntityError(message=f'{error}') from error
    except Exception as error:
        raise UnprocessableEntityError(message=f'Query execution error: {error}') from error


@router.get("/value.info", response=DataResponseSchema)
@ViewAuth()
@ViewRmVaryHeader()
def value_info(request, params: ValueRequestSchema = Query(...)):
    try:
        typename = TypeDetector(value=params.value).detect() or ""
        autocomplete = AutoComplete(value=params.value).get_text_list() or []
        return DataResponseDict(data=dict(typename=typename, autocomplete=autocomplete), message="OK")
    except (RedisGetError, DBTypesDoNotExist) as error:
        raise UnprocessableEntityError(message=f'{error}') from error
