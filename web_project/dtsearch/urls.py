from django.urls import path
from . import views


urlpatterns = [
    path('', views.index),
    path('blank/', views.blank),
    path('index.list', views.index_list),
]
