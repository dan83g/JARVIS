from django.urls import path, re_path
from . import views

urlpatterns = [
    # index
    path('', views.index),
    re_path(r'^(?P<typename>[-_\w]+)/$', views.index),
    re_path(r'^(?P<typename>[-_\w]+)/(?P<name>[-_\w()]+)/$', views.index),

    # query
    re_path('^query/(?P<hash>[a-f0-9]{32})$', views.query),
]
