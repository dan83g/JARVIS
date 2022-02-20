from django.urls import path
from . import views
from security.views import UserSettingsView

urlpatterns = [
    # test
    path('v1/test', views.test),

    # ping
    path('v1/ping', views.ping),

    # type
    path('v1/type.list', views.type_list),

    # query
    path('v1/query.list', views.query_list),
    path('v1/query.data', views.query_data),

    # user
    path('v1/user', UserSettingsView.as_view()),
]
