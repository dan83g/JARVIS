from django.db import models
from django.contrib.auth.models import (
    BaseUserManager, Group, User
)
from ldap3 import Server, Connection, ALL
import re
import logging

logger = logging.getLogger(__name__)

CHOICE_LDAP_PROTOCOL = (
    ('ldap', 'LDAP'),
    ('ldaps', 'LDAPS'),
)

CHOICE_RDN = (
    ('cn', 'cn'),
    ('uid', 'uid'),
    ('sAMAccountName', 'sAMAccountName'),
)

CHOICE_LDAP_USER_GUID = (
    ('uidNumber', 'uidNumber'),
    ('objectGUID', 'objectGUID'),
    ('ibm-entityUUID', 'ibm-entityUUID'),
    ('dominoUNID', 'dominoUNID'),
    ('GUID', 'GUID'),
    ('nsuniqueID', 'nsuniqueID'),
)


class UserManager(BaseUserManager):
    def create_user(self, theme: str = 'vela-blue', errors: bool = False, password=None, is_staff: bool = False, is_superuser: bool = False):
        """Creates and saves a User
        """
        user = self.model(
            errors=errors,
            theme=theme,
            is_staff=is_staff,
            is_superuser=True
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, theme: str = 'vela-blue', errors: bool = False, password=None):
        """Creates and saves a superuser
        """
        user = self.create_user(
            theme=theme,
            errors=errors,
            password=password,
            is_staff=True,
            is_superuser=True
        )
        user.save(using=self._db)
        return user


class proxy_user(User):
    class Meta:
        verbose_name = 'Пользователи'
        verbose_name_plural = 'Пользователи'
        proxy = True


class proxy_group(Group):
    class Meta:
        verbose_name = 'Группы безопасности'
        verbose_name_plural = 'Группы безопасности'
        proxy = True


# Модель LDAP
class ldap(models.Model):
    active = models.BooleanField(verbose_name='Вкл', default=True)
    source = models.CharField(max_length=100, verbose_name='Название', unique=True)
    protocol = models.CharField(max_length=10, choices=CHOICE_LDAP_PROTOCOL, default='ldap', blank=False, verbose_name='Протокол')
    host = models.CharField(max_length=100, verbose_name='Хост', help_text='IP-адрес или DNS-имя')
    port = models.IntegerField(default=389, verbose_name='Порт', help_text='По умолчанию порты: 389 - LDAP, порт 636 - LDAPS')
    user_dn = models.CharField(max_length=50, default='', verbose_name='Пользовательский DN', null=False, blank=True)
    password = models.CharField(max_length=50, default='', verbose_name='Пароль', null=False, blank=True)
    timeout = models.IntegerField(default=3, verbose_name='Время ожидания', null=False, help_text='Время ожидания подключения к серверу')
    rdn = models.CharField(max_length=20, choices=CHOICE_RDN, default='cn', blank=False, verbose_name='RDN', help_text='Уникальный атрибут для поиска пользователей')
    search_dn = models.CharField(max_length=100, default='', blank=True, verbose_name='DN поиска', help_text='Ветка дерева для поиска пользователей, например: ou=users,dc=cpi,dc=dsp')
    user_guid_param = models.CharField(max_length=50, choices=CHOICE_LDAP_USER_GUID, default='objectGUID', verbose_name='Название GUID пользователя', help_text='Название уникального параметра пользователя, для сравнения при обновлении данных пользователя')
    query = models.CharField(max_length=255, default='', blank=True, verbose_name='Запрос', help_text='Запрос к LDAP-серверу, пример: <br>(&(objectClass=posixAccount)(givenName=*)(sn=*)(uid={username}))<br> или <br> (&(objectCategory=Person)(!(UserAccountControl:1.2.840.113556.1.4.803:=2))(givenName=*)(sn=*)(sAMAccountName={username}))')

    class Meta:
        verbose_name = 'LDAP'
        verbose_name_plural = 'LDAP'
        # app_label = 'auth'

    def __init__(self, *args, **kwargs):
        self.errors = []
        super().__init__(*args, **kwargs)

    def __str__(self):
        return self.source

    @property
    def errors_as_string(self) -> str:
        if self.errors:
            return "\r\n".join(self.errors)
        return ""

    def connect(self):
        if self.protocol == 'ldaps':
            self._server = Server(self.host, port=self.port, connect_timeout=self.timeout, get_info=ALL, use_ssl=True)
        else:
            self._server = Server(self.host, port=self.port, connect_timeout=self.timeout, get_info=ALL)
        self._conn = Connection(self._server, self.user_dn, self.password, auto_bind='DEFAULT')

    def test_connection(self) -> bool:
        self._server = Server(self.host, port=self.port, connect_timeout=self.timeout, get_info=ALL)
        self._conn = Connection(self._server, self.user_dn, self.password)
        try:
            self._conn.bind()
            return True
        except Exception as error:
            self.errors.append(f"Ошибка теста подключения {self._conn.last_error or error}")
            return False

    def update_user_groups(self, user: User, groups: list[str]) -> None:
        """Update user membership in groups

        :param user: django User class
        :type user: User
        :param groups: List of groups
        :type groups: list
        """

        # retrieve current user groups
        current_groups = {}
        for group in user.groups.all():
            current_groups[group.name] = group

        # enumerate new groups
        for group_name in groups:
            if group_name in set(current_groups.keys()):
                del current_groups[group_name]
            else:
                # if group not present, then add user to group
                entering_group, _ = Group.objects.get_or_create(name=group_name)
                user.groups.add(entering_group)

        # exclude user from other groups
        for group in current_groups.values():
            user.groups.remove(group.id)

    def update_users(self, user: User) -> bool:
        """update user properties from ldap, user - object of User class"""

        # connect
        self.connect()

        if not self._conn.bound:
            self.errors.append(f"Ошибка теста подключения {self._conn.last_error}")
            return False

        # if {username} exists
        if not self.query.find('{username}'):
            self.errors.append("Отсутсвует выражение username в запросе")
            return False

        # search from LDAP
        try:
            self._conn.search(self.search_dn, self.query.format(username=user.username if user else '*'), attributes=['*', 'mail', 'memberOf'])
        except Exception as error:
            self.errors.append(f"Ошибка поиска LDAP: {self._conn.last_error or error}")
            return False

        if not self._conn.entries:
            self.errors.append(f"LDAP-сервер не вернул данные \r\n {self._conn.last_error or ''}")
            return False

        # retrieve entry list
        entries = {}
        for entry in self._conn.entries:
            if self.rdn in entry.entry_attributes_as_dict and entry.entry_attributes_as_dict[self.rdn]:
                entries[entry.entry_attributes_as_dict[self.rdn][0]] = {
                    "last_name": entry.sn.value if 'sn' in entry else '',
                    "first_name": entry.givenName.value if 'givenName' in entry else '',
                    "email": entry.mail.value if 'mail' in entry else '',
                    "groups": [re.split('[=,]', group)[1] for group in entry.memberOf.values]
                }

        # retrieve user list
        users = [user] if user else User.objects.all()

        # update users
        for user in users:
            if user.username in list(entries.keys()):
                entry = entries[user.username]
                user.email = entry["email"] or user.email
                user.last_name = entry["last_name"] or user.last_name
                user.first_name = entry["first_name"] or user.first_name
                if not user.password:
                    user.set_unusable_password()
                try:
                    self.update_user_groups(user, entry["groups"])
                except Exception:
                    self.errors.append("Ошибка получения имен групп LDAP")
                # save user
                user.save()
        return True

    def selialize(self):
        return self.__dict__

    def search(self):
        return
