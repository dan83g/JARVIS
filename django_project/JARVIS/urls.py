from django.contrib import admin
from django.urls import path, include
from files import views as files_views
from api.views import type_list
from . import views

handler404 = views.show_404
handler500 = views.show_500

admin.site.site_header = 'Администрирование "Jarvis"'
admin.site.site_title = "Jarvis admin"
admin.site.index_title = "Welcome to Jarvis"

urlpatterns = [
    # ============================= ADMIN ===============================
    path(r'jet/', include('jet.urls', 'jet')),
    path('admin/', admin.site.urls),

    # ============================= ALIVE_TEST ==========================
    path(r'ping', views.ping),

    # ============================= HOME_PAGE ===========================
    path(r'', views.home_page),
    path('type.list', type_list),

    # ============================= LOGIN ===============================
    path(r'login/', views.login_page),
    path(r'login', views.login),
    path(r'logout', views.logout),
    path(r'status', views.status),

    # ============================= APPS ================================
    path(r'files/', files_views.getFiles, name='getFiles'),
    path(r'stream/', files_views.getMediaStream),
    path(r'search/', include('search.urls')),
    path(r'dtsearch/', include('dtsearch.urls')),
    path(r'map/', include('map.urls')),

    # API
    path(r'api/', include('api.urls')),
]
