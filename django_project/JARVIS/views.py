from django.shortcuts import render
from django.contrib import auth
from JARVIS.enums import SERVER_VERSION
from lib.decorators import (
    ViewAuth, ViewMethod, ViewInputValidation)
from lib.response import Response
from lib.ninja_api import Ninja

from security.views import router as security_router
from api.views import router as api_router
from search.views import router as search_router


# ========================== ERRORS, DEBUG = False ==================
@ViewMethod(method=['GET'])
def show_404(request, exception):
    return render(request, '404.html', {})


@ViewMethod(method=['GET'])
def show_500(request):
    return render(request, '500.html', {})


api = Ninja().get_api()
api.add_router("/user/", security_router)
api.add_router("/api/", api_router)
api.add_router("/search/", search_router)


# ================================ MAIN PAGE ========================
@ViewMethod(method=['GET'])
@ViewAuth()
def home_page(request):
    return render(request, 'index.html', context={'SERVER_VERSION': SERVER_VERSION, 'initial_state': {}})
