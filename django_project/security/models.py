from django.db import models
from django.utils.translation import gettext_lazy as _
from django.forms.models import model_to_dict
from django.contrib.auth.models import (
    Group, AbstractUser)
from lib.validators import JsonTextValidator
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

CHOICE_LDAP_USER_CLASS = (
    ('posixAccount', 'posixAccount'),
    ('Person', 'Person'),
    ('inetOrgPerson', 'inetOrgPerson'),
    ('organizationalPerson', 'organizationalPerson'),
)


# User Model
class User(AbstractUser):
    guid = models.CharField(_("User guid"), null=True, max_length=38, help_text=_('Guid is using to synchronize data from LDAP server'))
    settings = models.TextField(
        verbose_name=_("User settings"),
        null=True,
        blank=True,
        validators=[JsonTextValidator(message=_('Invalid JSON format'), code='invalid_json_format')],
        help_text=r'Example: {"theme": "vela-blue", "errors": "true"}'
    )

    class Meta:
        db_table = 'auth_user'

    def __str__(self):
        return self.username


# Group Model
class proxy_group(Group):
    class Meta:
        verbose_name = 'Группы безопасности'
        verbose_name_plural = 'Группы безопасности'
        proxy = True


# LDAP Server Model
class ldap(models.Model):
    active = models.BooleanField(verbose_name='Вкл', default=True)
    source = models.CharField(max_length=100, verbose_name='Название', unique=True)
    protocol = models.CharField(max_length=10, choices=CHOICE_LDAP_PROTOCOL, default='ldap', blank=False, verbose_name='Протокол')
    host = models.CharField(max_length=100, verbose_name='Хост', help_text='IP-адрес или DNS-имя')
    port = models.IntegerField(default=389, verbose_name='Порт', help_text='По умолчанию порты: 389 - LDAP, порт 636 - LDAPS')
    user_dn = models.CharField(max_length=50, default='', verbose_name='Пользовательский DN', null=False, blank=True)
    password = models.CharField(max_length=50, default='', verbose_name='Пароль', null=False, blank=True)
    timeout = models.IntegerField(default=3, verbose_name='Время ожидания', null=False, help_text='Время ожидания подключения к серверу')
    search_dn = models.CharField(max_length=100, default='', blank=True, verbose_name='DN поиска', help_text='Ветка дерева для поиска пользователей, например: ou=users,dc=cpi,dc=dsp')
    rdn = models.CharField(max_length=20, choices=CHOICE_RDN, default='cn', blank=False, verbose_name='RDN', help_text='Уникальный атрибут для поиска пользователей')
    user_guid_param = models.CharField(max_length=50, choices=CHOICE_LDAP_USER_GUID, default='objectGUID', verbose_name='Название GUID пользователя', help_text='Название уникального параметра пользователя, для сравнения при обновлении данных пользователей')
    user_class = models.CharField(max_length=50, choices=CHOICE_LDAP_USER_CLASS, default='Person', verbose_name='Название CLASS пользователя', help_text='Название класса пользователя, для поиска данных пользователей')
    # query = models.CharField(max_length=255, default='', blank=True, verbose_name='Запрос', help_text='Запрос к LDAP-серверу, пример: <br>(&(objectClass=posixAccount)(givenName=*)(sn=*)(uid={username}))<br> или <br> (&(objectCategory=Person)(!(UserAccountControl:1.2.840.113556.1.4.803:=2))(givenName=*)(sn=*)(sAMAccountName={username}))')

    class Meta:
        verbose_name = 'LDAP'
        verbose_name_plural = 'LDAP'
        # app_label = 'auth'

    def __str__(self):
        return self.source

    def as_dict(self) -> dict:
        return model_to_dict(self, fields=[field.name for field in self._meta.concrete_fields])
