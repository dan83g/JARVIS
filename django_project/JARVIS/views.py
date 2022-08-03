from django.shortcuts import render
from django.contrib import auth
from JARVIS.enums import SERVER_VERSION
from lib.decorators import (
    ViewAuth, ViewMethod, ViewInputValidation)
from lib.response import Response
from . import forms


# ========================== ERRORS, DEBUG = False ==================
@ViewMethod(method=['GET'])
def show_404(request, exception):
    return render(request, '404.html', {})


@ViewMethod(method=['GET'])
def show_500(request):
    return render(request, '500.html', {})


# =============================== STATUS =====================
@ViewMethod(method=['GET', 'POST'])
@ViewAuth()
def status(request):
    user = request.user
    groups = ",".join([group.name for group in user.groups.all()])
    response_data = {
        "username": user.username,
        "lastname": user.last_name,
        "firstname": user.first_name,
        "groups": groups,
        "last_login": user.last_login
    }
    return Response.json_data_response(data=response_data)


# ================================ MAIN PAGE ========================
@ViewMethod(method=['GET'])
@ViewAuth()
def home_page(request):
    return render(request, 'index.html', context={'SERVER_VERSION': SERVER_VERSION})


# ============================ LOGIN & LOGOUT =======================
@ViewMethod(method=['GET'])
def login_page(request):
    return render(request, 'login.html', {'SERVER_VERSION': SERVER_VERSION})


@ViewMethod(method=['GET', 'POST'])
@ViewInputValidation(model=forms.AuthModel)
def login(request):
    user = auth.authenticate(
        username=request.pydantic_model.username,
        password=request.pydantic_model.password)

    if user and user.is_active:
        auth.login(request, user)
        return Response.json_data_response()
    return Response.json_response(message='Такого пользователя и пароля не существует', status_code=400)


@ViewMethod(method=['GET', 'POST'])
def logout(request):
    if request.user.is_authenticated:
        auth.logout(request)
    return Response.json_data_response()
