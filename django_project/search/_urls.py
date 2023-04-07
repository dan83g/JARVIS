from django.urls import re_path, path
from api.views import type_list
from .views import (
    query, value_info)


urlpatterns = [
    # path('type.list', type_list),

    # path('value.info', value_info),

    # index
    # re_path(r'^((?P<typename>[-_\w]+)/((?P<queryname>[-_\w()]+)/)?)?$', SearchView.as_view()),

    # single query
    # re_path('^query/(?P<hash>[a-f0-9]{32})$', query),
]
