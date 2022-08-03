from django.contrib import admin
from django.urls import path, include
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

    # ============================= HOME_PAGE ===========================
    path(r'', views.home_page),

    # ============================= USER ===============================
    path(r'user/login/', views.login_page),
    path(r'user/login', views.login),
    path(r'user/logout', views.logout),
    path(r'user/status', views.status),

    # ============================= APPS ================================
    path(r'search/', include('search.urls')),
    path(r'dtsearch/', include('dtsearch.urls')),
    path(r'map/', include('map.urls')),

    # ============================= API =================================
    path(r'api/', include('api.urls')),
]
