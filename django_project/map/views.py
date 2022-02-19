from django.shortcuts import render
from django.core.cache import cache
from JARVIS.enums import SERVER_VERSION, REDIS_CACHE_TTL
from lib.response import Response
from lib.handlers import Handler, HandlerType
from lib.decorators import (
    ViewAuth, ViewExcept, ViewMethod, ViewInputValidation)
from lib.encryption import md5hash
from .import service
from .import models
from .import forms


@ViewMethod(method=['GET'])
@ViewAuth()
@ViewInputValidation(model=forms.MapIndexModel)
@ViewExcept(message="Ошибка отображения картографического сервиса")
def index(request):

    # gettings data about tile servers
    tiles = models.tile_server.objects.filter(active=True).order_by('priority')
    if not tiles:
        return Response.json_response(message='В БД отсутствуют данные о тайловых серверах')

    # tiles
    tiles = [{
        "name": tile.name,
        "url": tile.__str__(),
        "min_zoom": tile.min_zoom,
        "max_zoom": tile.max_zoom,
        "crs": tile.crs,
    } for tile in tiles]

    # init context
    context = {
        'SERVER_VERSION': SERVER_VERSION,
        'username': request.user.username,
        'geoname': request.pydantic_model.geoname,
        'tiles': tiles}

    # if text with coordinates is present
    if request.pydantic_model.coordinates:
        coordinates_list = service.get_geo_json_coordinates(request.pydantic_model.coordinates)
        coordinates_hash = md5hash(coordinates_list)
        cache.set(coordinates_hash, coordinates_list, timeout=REDIS_CACHE_TTL)
        context.update({'coordinates_hash': coordinates_hash})
    return render(request, template_name='map.html', context=context)


@ViewMethod(method=['POST'])
@ViewAuth()
@ViewInputValidation(model=forms.MapGeoName)
@ViewExcept(message="Ошибка получения геоданных")
def geoname_search(request):
    """getting data about geonames
    """
    source = models.sources.objects.filter(active=True, source="GEONAMES").first()
    if not source:
        return Response.json_response(message='В БД нет источника с именем "GEONAMES". Обратитесь к администратору')

    handler = Handler(
        handler=HandlerType.M,
        initial_dict=dict(
            driver=source.driver,
            host=source.host,
            port=source.port,
            instance=source.instance,
            database=source.database,
            user=source.user,
            password=source.password,
            prepared_query=f"geonames.sp_search_geonames {request.pydantic_model.geoname}"))
    returned_data, retrurned_errors = handler.execute()

    if retrurned_errors:
        return Response.json_response(message=','.join([error for error in retrurned_errors]))
    return Response.json_data_response(data=returned_data)


@ViewMethod(method=['POST'])
@ViewAuth()
@ViewInputValidation(model=forms.MapCoordinates)
@ViewExcept(message="Ошибка извлечения координат")
def coordinates_search(request):
    coordinates_list = []
    if request.pydantic_model.coordinates_hash:
        try:
            coordinates_list = cache.get(str(request.pydantic_model.coordinates_hash))
            if not coordinates_list:
                raise ValueError('Запрос отсутсвует в REDIS')
        except Exception as error:
            return Response.json_response(message=f'Координаты отсутсвуют в REDIS: {error}')
    elif request.pydantic_model.coordinates:
        coordinates_list = service.get_geo_json_coordinates(request.pydantic_model.coordinates)
    return Response.json_data_response(data=coordinates_list)


# class UserDataView(View):
#     """User geojson data View
#     """

#     @staticmethod
#     @ViewAuth()
#     @ViewExcept(message="Ошибка получения данных пользователя")
#     def get(request):
#         """get all user layers
#         """
#         rows = models.user_data.objects.filter(user=request.user).extra(select={'value': 'layername'}).values('id', 'value')
#         if not rows:
#             return Response.json_data_response(data=[], message='В БД нет сохраненных слоев пользователя')
#         return Response.json_data_response(data=list(rows))

#     @staticmethod
#     @ViewAuth()
#     @ViewInputValidation(model=forms.Get_MapUserDataModel)
#     @ViewExcept(message="Ошибка получения данных пользователя")
#     def post(request):
#         """get layer by id
#         """
#         layer = models.user_data.objects.filter(pk=request.pydantic_model.id).first()
#         if not layer:
#             return Response.json_response(message='В БД нет данных')
#         return Response.json_data_response(data=layer.data_as_json())

#     @staticmethod
#     @ViewAuth()
#     @ViewInputValidation(model=forms.MapUserDataModel)
#     @ViewExcept(message="Ошибка сохранения данных пользователя")
#     def put(request):
#         """save layer
#         """
#         user_data, _ = models.user_data.objects.update_or_create(
#             layername=request.pydantic_model.layername,
#             user=request.user,
#             defaults={
#                 'layername': request.pydantic_model.layername,
#                 'data': json.dumps(request.pydantic_model.data),
#                 'user': request.user})
#         return Response.json_data_response(message=f'Слой {user_data.layername} успешно сохранен')

#     @staticmethod
#     @ViewAuth()
#     @ViewInputValidation(model=forms.MapUserDataModel)
#     @ViewExcept(message="Ошибка удаления данных пользователя")
#     def delete(request):
#         """delete layer
#         """
#         models.user_data.objects.filter(pk=request.pydantic_model.id).delete()
#         return Response.json_data_response(message='Слой успешно удален', data={"id": request.pydantic_model.id})
