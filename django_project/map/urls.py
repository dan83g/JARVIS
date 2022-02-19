from django.urls import path
from .views import (
    index, geoname_search, coordinates_search)

urlpatterns = [
    path('', index),
    path('geoname.search', geoname_search),
    path('coordinates.search', coordinates_search)
]
