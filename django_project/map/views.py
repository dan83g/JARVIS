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

    # getting tile servers data
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

    # if present text with coordinates
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
