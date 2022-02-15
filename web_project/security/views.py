from django.views import View
from lib.response import Response
from lib.decorators import (
    ViewExcept, ViewAuth)


class UserSettingsView(View):
    """User settings View
    """
    @staticmethod
    @ViewAuth()
    @ViewExcept(message="Ошибка получения настроек пользователя")
    def get(request):
        """get user settings
        """
        user = request.user
        response_data = {
            "username": user.username,
            "last_name": user.last_name,
            "first_name": user.first_name,
            "last_login": user.last_login,
            "groups": [group.name for group in user.groups.all()]}
        return Response.json_data_response(data=response_data)
