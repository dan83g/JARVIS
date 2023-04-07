from django.contrib import admin
from django.urls import path, include
from . import views
# from security.views import api as user_api
# from api.views import api as api_api
from .views import api

handler404 = views.show_404
handler500 = views.show_500

admin.site.site_header = 'Администрирование "Jarvis"'
admin.site.site_title = "Jarvis admin"
admin.site.index_title = "Welcome to Jarvis"

urlpatterns = [
    # ============================= ADMIN ===============================
    path(r'jet/', include('jet.urls', 'jet')),
    path('admin/', admin.site.urls),

    # ============================= HOME_PAGE ===========================
    path("", views.home_page),

    # ============================= APPS ================================
    # path(r'search/', include('search.urls')),
    path(r'dtsearch/', include('dtsearch.urls')),
    path(r'map/', include('map.urls')),

    path("", api.urls)
    # ============================= user =================================
    # path("user/", user_api.urls),

    # ============================= API =================================
    # path(r'api/', api_api.urls),
    # path(r'api/', include('api.urls')),
]
