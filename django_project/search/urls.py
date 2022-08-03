from django.urls import re_path, path
from api.views import type_list
from .views import (SearchView, query, type_detect)


urlpatterns = [
    path('type.list', type_list),

    path('type.detect', type_detect),

    # index
    re_path(r'^((?P<typename>[-_\w]+)/((?P<name>[-_\w()]+)/)?)?$', SearchView.as_view()),

    # single query
    re_path('^query/(?P<hash>[a-f0-9]{32})$', query),
]
