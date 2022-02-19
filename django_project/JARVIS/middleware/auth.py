from JARVIS.enums import (
    REMOTE_USER_HEADER, REMOTE_USER_GROUPS_HEADER, REMOTE_USER_EMAIL_HEADER, REMOTE_USER_FIRSTNAME_HEADER, REMOTE_USER_LASTNAME_HEADER
)
from django.contrib.auth.middleware import RemoteUserMiddleware
from django.contrib.auth.backends import RemoteUserBackend
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import Group, User
from django.core.exceptions import ImproperlyConfigured
from django.utils.deprecation import MiddlewareMixin
from django.contrib import auth
from django.http import HttpResponse
import base64
from security.models import ldap
import logging
logger = logging.getLogger(__name__)


class HttpRemoteUserBackend(RemoteUserBackend):
    def clean_username(self, username, shallow=False):
        try:
            username = str(base64.b64decode(username), "utf-8")
        except Exception:
            pass

        splits = username.split('\\')
        if len(splits) == 2:
            return splits[1]
        return username


class HttpRemoteUserMiddleware(RemoteUserMiddleware):
    header = REMOTE_USER_HEADER
    header_groups = REMOTE_USER_GROUPS_HEADER
    header_email = REMOTE_USER_EMAIL_HEADER
    header_firstname = REMOTE_USER_FIRSTNAME_HEADER
    header_lastname = REMOTE_USER_LASTNAME_HEADER

    def update_user_groups(self, request):
        # достаем группы из заголовка
        header_groups = request.META.get(self.header_groups)
        if not header_groups:
            return

        user = request.user
        current_groups = {}
        for group in user.groups.all():
            current_groups[group.name] = group

        # перебираем все группы из заголовка
        for header_group_name in header_groups.split(","):
            if header_group_name in set(current_groups.keys()):
                del current_groups[header_group_name]
            else:
                # если группы нет, среди текущих групп пользователя, то добавляем пользователя в эту группу
                entering_group, created = Group.objects.get_or_create(name=header_group_name)
                user.groups.add(entering_group)
        # исключаем пользователя из оставшихся групп
        for group in current_groups.values():
            user.groups.remove(group.id)

    def get_or_create_user(self, username: str, first_name: str = "", last_name: str = "", email: str = "") -> User:
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'username': username,
                'password': make_password(None),
                'first_name': '',
                'last_name': '',
                'email': '',
                'is_active': True
            }
        )
        return user

    def process_request(self, request):
        if not hasattr(request, 'user'):
            raise ImproperlyConfigured("Add django.contrib.auth.middleware.AuthenticationMiddleware")

        try:
            username = request.META[self.header]
        except KeyError:
            if self.force_logout_if_no_header and request.user.is_authenticated:
                self._remove_invalid_user(request)
            return

        if request.user.is_authenticated:
            if request.user.get_username() == self.clean_username(username, request):
                return
            self._remove_invalid_user(request)

        # аутентификация
        user = auth.authenticate(request, remote_user=username)
        if not user:
            return

        request.user = user
        auth.login(request, user)

        if not user.password:
            user.set_unusable_password()
            user.save()

        # update LDAP
        oLdap = ldap.objects.filter(active=True).first()
        if oLdap:
            oLdap.update_users(user)

        # # external users
        # # дополнительные поля
        # email = request.META.get(self.header_email, None)
        # if email is not None:
        #     request.user.email = email
        # firstname = request.META.get(self.header_firstname, None)
        # if firstname is not None:
        #     request.user.first_name = firstname
        # lastname = request.META.get(self.header_lastname, None)
        # if lastname is not None:
        #     request.user.last_name = lastname

        # # update groups for external users
        # if email or firstname or lastname:
        #     self.update_user_groups(request)
        #     request.user.save()


class BasicAuthMiddleware(MiddlewareMixin):

    def process_request(self, request):

        if hasattr(request, "user") and request.user.is_authenticated:
            return

        basic_auth_header = request.META.get("HTTP_AUTHORIZATION")
        if not basic_auth_header:
            return

        splits = basic_auth_header.split()
        if len(splits) != 2:
            return

        if splits[0].lower() != "basic":
            return

        try:
            username, password = base64.b64decode(splits[1]).decode('utf-8').split(':')
        except Exception:
            return

        # аутентификация
        user = auth.authenticate(request, username=username, password=password)
        if not user:
            return HttpResponse("Invalid Basic Auth credentials", status=401)
        request.user = user
        auth.login(request, user)
