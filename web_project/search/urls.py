from django.urls import path, re_path
from . import views

urlpatterns = [
    # index
    path('', views.index),
    re_path(r'^(?P<typename>[-_\w]+)/$', views.index),
    re_path(r'^(?P<typename>[-_\w]+)/(?P<name>[-_\w()]+)/$', views.index),

    # query
    re_path('^query/(?P<md5hash>[a-f0-9]{32})$', views.query),
    # re_path(r'^query/(?P<typename>[-_\w]+)/(?P<name>[-_\w()]+)/$', views.query_alt),
]

# path('query/<uuid:uuid>', views.query),
# path('<slug:typename>/', views.index),
# str [^/]+
# int [0-9]+
# slug [-a-zA-Z0-9_]+  или [-_\w]+
# uuid [0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}
# path '.+' Example: '/path/to/file'
