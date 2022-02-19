from django.shortcuts import render
from django.http import HttpResponse
from lib.decorators import (
    ViewMethod, ViewAuth, ViewInputValidation, ViewExcept
)
from lib.response import Response
from JARVIS.enums import SERVER_VERSION
from .import forms
from django.db.models import Q
from . import models


def blank(request):
    return HttpResponse("Ничего не выбрано")


@ViewMethod(method=['GET'])
@ViewAuth()
@ViewInputValidation(model=forms.DtSearchModel)
@ViewExcept(message="Ошибка загрузки страницы")
def index(request):
    context: dict = request.pydantic_model.dict()
    context['SERVER_VERSION'] = SERVER_VERSION
    # url for dtsearch_server
    dtsearch_server = models.hosts.objects.filter(active=True).first()
    if not dtsearch_server:
        return Response.json_response(message='В БД отсутствуют данные о WEB API-сервере для работы с dtSearch')
    context['dtsearch_server_url'] = str(dtsearch_server)
    # dtsearch index pathes
    index_pathes = models.indexes.objects.values('path').filter(
        active=True,
        host__active=True,
        **{key: value for key, value in {'name__in': request.pydantic_model.indexes}.items() if request.pydantic_model.indexes}
    )
    index_pathes = ",".join(index['path'] for index in index_pathes)
    context['index_pathes'] = index_pathes.replace("\\", "\\\\")
    return render(request, 'dtsearch.html', context)


@ViewMethod(method=['GET'])
@ViewAuth()
@ViewExcept(message="Ошибка получения списка")
def index_list(request):
    usr_groups = request.user.groups.all()
    rows = models.indexes.objects.filter(
        Q(active=True),
        Q(host__active=True),
        Q(group__in=usr_groups) | Q(group=None),
    ).extra(select={'id': 'path', 'value': 'name'}).values('id', 'value').order_by('name')

    if not rows:
        return Response.json_response(message='В БД отсутвуют данные о индексах или у Вас отсутсвует доступ')
    return Response.json_data_response(data=list(rows))
