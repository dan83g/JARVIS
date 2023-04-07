from django.shortcuts import render
from django.contrib import auth
from lib.decorators import (
    ViewExcept, ViewAuth)
from lib.ninja_api.exceptions import UnprocessableEntityError
from lib.ninja_api.schemas import MessageResponseSchema
from .schemas import UserSchema, AuthSchema
from JARVIS.enums import SERVER_VERSION
from ninja import Router


router = Router()


# ============================ User =================================
# @api.api_operation(["POST", "PATCH"], "/path")
@router.get("/test", response=MessageResponseSchema)
@ViewAuth()
def test(request):
    raise UnprocessableEntityError(message="Ошибка получения настроек пользователя")


# ============================ User =================================
@router.get("/info", response=UserSchema)
@ViewAuth()
@ViewExcept(message="Ошибка получения настроек пользователя")
def info(request):
    return request.user


# ============================ LOGIN & LOGOUT =======================
@router.get("/login/")
def login_page(request):
    return render(request, 'login.html', {'SERVER_VERSION': SERVER_VERSION})


@router.post("/login", response=MessageResponseSchema)
def login(request, auth_schema: AuthSchema):
    user = auth.authenticate(username=auth_schema.username, password=auth_schema.password)

    if user and user.is_active:
        auth.login(request, user)
        return "OK"
    raise UnprocessableEntityError(message="Такого пользователя и пароля не существует")


@router.post("/logout", response=MessageResponseSchema)
def logout(request):
    if request.user.is_authenticated:
        auth.logout(request)
    return "OK"
