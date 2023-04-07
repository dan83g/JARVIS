from django.shortcuts import render
from JARVIS.enums import SERVER_VERSION
from lib.response import Response
from lib.handlers import Handler, HandlerType
from lib.decorators import (
    ViewAuth, ViewExcept, ViewMethod, ViewInputValidation)
from .service import CoordinatesCache, Coordinates
from .import models
from .import forms
import logging
logger = logging.getLogger(__name__)


@ViewMethod(method=['GET'])
@ViewAuth()
@ViewInputValidation(model=forms.MapIndexModel)
@ViewExcept(message="Ошибка отображения картографического сервиса")
def index(request):

    # getting tile servers data
    tiles = models.tile_server.objects.filter(active=True).order_by('priority').first()
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
        coordinates = Coordinates(user=request.user).get_geojson_coordinates(
            text_with_coordinates=request.pydantic_model.coordinates,
            id=None
        )
        id = CoordinatesCache.set(request.user, coordinates)
        context['id'] = id
    return render(request, template_name='map.html', context=context)


@ViewMethod(method=['POST'])
@ViewAuth()
@ViewInputValidation(model=forms.MapGeoName)
@ViewExcept(message="Ошибка получения геоданных")
def geoname_search(request):
    """getting geodata
    """
    source = models.sources.objects.filter(active=True, source="GEONAMES").first()
    if not source:
        return Response.json_response(message='В БД нет источника с именем "GEONAMES". Обратитесь к администратору')

    handler = Handler(
        initial_dict=dict(
            driver=source.driver,
            host=source.host,
            port=source.port,
            instance=source.instance,
            database=source.database,
            user=source.user,
            password=source.password,
            prepared_query=f"geonames.sp_search_geonames {request.pydantic_model.geoname}"),
        handler=HandlerType.M)
    returned_data, retrurned_errors = handler.execute()

    if retrurned_errors:
        return Response.json_response(message=','.join([error for error in retrurned_errors]))
    return Response.json_data_response(data=returned_data)


@ViewMethod(method=['POST'])
@ViewAuth()
@ViewInputValidation(model=forms.MapCoordinates)
@ViewExcept(message="Ошибка извлечения координат")
def coordinates_search(request):
    coordinates = Coordinates(user=request.user).get_geojson_coordinates(
        text_with_coordinates=request.pydantic_model.coordinates,
        id=request.pydantic_model.id
    )
    return Response.json_data_response(data=coordinates)
