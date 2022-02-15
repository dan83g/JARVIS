from django.conf.urls import url
from . import views


# из wiew.py метод show
urlpatterns = [
    url('^$', views.getFiles),
    url('^$', views.getMediaStream),
]
