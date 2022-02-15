from django.db import models
from django.contrib.auth.models import Group
from django.core.validators import RegexValidator
from lib.validators import JsonTextValidator
from enum import Enum
from django.forms.models import model_to_dict


CHOICE_DATATYPE = (
    ('int', 'Integer'),
    ('float', 'Float'),
    ('string', 'String'),
    ('datetime', 'Date'),
    ('datetime', 'DateTime'),
    ('ipv4', 'IPv4'),
    ('ipv6', 'IPv6'),
    ('asis', 'asIS'),
)

CHOICE_PROTOCOL = (
    ('', '-'),
    ('http', 'HTTP'),
    ('https', 'HTTPS'),
)

CHOICE_FORMAT = (
    ('text', 'Text'),
    ('json', 'Json'),
    ('xml', 'XML'),
    ('python', 'Python'),
)

CHOICE_METHOD = (
    ('CONNECT', 'CONNECT'),
    ('DELETE', 'DELETE'),
    ('GET', 'GET'),
    ('HEAD', 'HEAD'),
    ('OPTIONS', 'OPTIONS'),
    ('PATCH', 'PATCH'),
    ('POST', 'POST'),
    ('PUT', 'PUT'),
    ('TRACE', 'TRACE'),
)


class SourceType(Enum):
    W = 'WEB', 'globe', True
    C = 'CLICKHOUSE', 'server', False
    M = 'MSSQL', 'database', False
    E = 'ELASTIC', 'server', False
    J = 'JARVIS', 'sitemap', False
    R = 'REST', 'cloud', False
    PGS = 'POSTGRESQL', 'database', False
    MYS = 'MYSQL', 'database', False
    EXL = 'EXCEL', 'file-excel', False
    SL1 = 'SQLITE', 'database', False
    SL3 = 'SQLITE3', 'database', False

    def __init__(self, title: str, icon_tag: str = 'database', iframe: bool = False) -> None:
        self.title = title
        self.icon_tag = icon_tag
        self.iframe = iframe

    @classmethod
    def choices(cls):
        return tuple((item.name, item.title) for item in cls)


# 1. Модель настройки иcточников
class sources(models.Model):
    active = models.BooleanField(verbose_name='Вкл', default=True)
    source = models.CharField(max_length=100, verbose_name='Название источника', unique=True)
    source_type = models.CharField(max_length=3, choices=SourceType.choices(), verbose_name='Тип источника')
    protocol = models.CharField(max_length=10, choices=CHOICE_PROTOCOL, default='', blank=True, verbose_name='Протокол', help_text='Актуален только для WEB-источников (ClickHouse, ElasticSearch, WEB, Jarvis)')
    host = models.CharField(max_length=100, verbose_name='Хост', help_text='IP-адрес или DNS-имя', null=True, blank=True)
    port = models.IntegerField(default=80, verbose_name='Порт')
    driver = models.CharField(max_length=100, verbose_name='Драйвер', null=True, blank=True, help_text='Прописывать драйвер, только при необходимости; <br> Пример: {ODBC Driver 17 for SQL Server}')
    instance = models.CharField(max_length=100, verbose_name='Экземпляр SQL-сервера', null=True, blank=True)
    database = models.CharField(max_length=100, verbose_name='База данных', null=True, blank=True)
    filename = models.CharField(max_length=256, verbose_name='Файл', null=True, blank=True)
    user = models.CharField(max_length=50, verbose_name='Пользователь', null=True, blank=True, help_text='Используется для авторизации на удаленных источниках')
    password = models.CharField(max_length=50, verbose_name='Пароль', null=True, blank=True, help_text='Используется для авторизации на удаленных источниках')

    class Meta:
        verbose_name = 'Источники данных'
        verbose_name_plural = 'Источники данных'

    def __str__(self):
        return self.source

    @classmethod
    def properties(cls):
        return [p for p in dir(cls) if isinstance(getattr(cls, p), property)]

    @property
    def iframe(self) -> str:
        return SourceType[self.source_type].iframe

    @property
    def icon_tag(self) -> str:
        return SourceType[self.source_type].icon_tag

    def to_dict(self):
        result_dict = model_to_dict(self)
        result_dict.update({prop: getattr(self, prop) for prop in self.properties()})
        return result_dict


# Модель настройки типов поиска
class types(models.Model):
    active = models.BooleanField(verbose_name='Вкл', default=True)
    typename = models.CharField(max_length=100, verbose_name='Тип идентификатора', unique=True, validators=[RegexValidator(regex=r'^([-_\w]+)$', message='Доступные символы А-ЯA-Z0-9_-', code='invalid_name')])
    priority = models.IntegerField(default=0, verbose_name='Приоритет', help_text='Приоритет в соответствии с которым сортируются типы')
    regexp = models.CharField(max_length=4000, verbose_name='Регулярное выражение', default=".+")

    class Meta:
        verbose_name = 'Идентификаторы'
        verbose_name_plural = 'Идентификаторы'

    def __str__(self):
        return self.typename


# Модель запросов
class queries(models.Model):
    name = models.CharField(max_length=255, verbose_name='Название запроса', default="Новый запрос", validators=[RegexValidator(regex=r'^([-_\w()]+)$', message='Доступные символы А-ЯA-Z0-9_-', code='invalid_name')])
    active = models.BooleanField(verbose_name='Вкл', default=True)
    position = models.IntegerField(default=0, verbose_name='Порядок', help_text='Порядок, указывающий на последовательность вывода результатов запросов на экран (по возрастанию) ')
    typename = models.ForeignKey(types, on_delete=models.CASCADE, verbose_name='Тип идентификатора')
    source = models.ManyToManyField(sources, verbose_name='Название источника(ов)', help_text='Источник(и) к которому будет послан запрос')
    timeout = models.IntegerField(default=30, verbose_name='Время ожидания', help_text='Время ожидания, после которого запрос прекратит исполнятся')
    group = models.ManyToManyField(Group, blank=True, verbose_name='Группа безопасности', help_text='Группа(ы) для которой доступен данный запрос, если не выбранна ни одна, то доступна всем. ')
    cpi = models.BooleanField(verbose_name='ЦПИ', default=False, help_text='Данный запрос доступен для внешних источников(других ЦПИ)')
    query = models.TextField(verbose_name='SQL-запрос/URL', help_text='Должен содержать SQL или относительный URL к источнику данных. <br>Допустимые параметры: {{value}},{{values}},{{values_list}},{{username}},{{date_from}},{{date_to}},{{now}},{{original_value}},{{original_values_list}},{{groups_list}}. <br>Директиву USE не использовать;<br>При необходимости, в начале запроса следует добавить выражения:<br> SET ANSI_WARNINGS OFF;')
    datatype = models.CharField(max_length=10, choices=CHOICE_DATATYPE, verbose_name='Тип данных', default="string", help_text='В каком формате значения будут подставлены в запрос')
    method = models.CharField(max_length=10, choices=CHOICE_METHOD, null=True, blank=True, verbose_name='Тип запроса', default="GET", help_text="Работает только для источников: ClickHouse, Rest, ElasticSearch, Jarvis")
    headers = models.TextField(
        null=True,
        blank=True,
        verbose_name='Дополнительные HTTP-заголовки',
        validators=[JsonTextValidator(message='Неверный формат JSON', code='invalid_headers')],
        help_text=r'Работает только для источников: ClickHouse, Rest, ElasticSearch, Jarvis. Пример: {"Accept-Encoding":"gzip, deflate, br", "Connection":"keep-alive"}'
    )
    request_data = models.TextField(null=True, blank=True, verbose_name='Вложенные данные запроса', help_text=r"Работает только для источников: Rest, ElasticSearch, Jarvis.<br>Допустимые параметры: {{value}},{{values}},{{values_list}},{{username}},{{now}},{{original_value}},{{original_values_list}},{{groups_list}}.")
    code_type = models.CharField(max_length=10, choices=CHOICE_FORMAT, null=True, blank=True, verbose_name='Обработка ответа сервера', help_text="Работает только для Rest-источников<br>Работает в паре с полем XPath/JSONPath/Python-скрипт")
    code = models.TextField(
        null=True,
        blank=True,
        verbose_name='XPath/JSONPath/Python-код',
        help_text=r'''Работает только для Rest-источников:<br>
        1) Пример XPath: /foo/bar;<br>
        2) Пример JSONPath: $.foo.bar[*];<br>
           $.hits.hits[*]._source[*] - пример для elasticsearch;<br>
        3) Python-скрипт: в переменной text находится текст ответа сервера;<br>
           Результат обработки необходимо поместить в results в формате list of dictionaries<br>
           При ошибке скрипта данные возвращаются в текстовом виде<br>
           Пример:<br>
           import json<br>
           oJson = json.loads(text)<br>
           results = [{"mykey": item['tag']} for item in oJson]
        ''')

    class Meta:
        unique_together = ['typename', 'name']
        verbose_name = 'Запросы'
        verbose_name_plural = 'Запросы'

    def __str__(self):
        return str(self.name)

    def to_dict(self, **kwargs) -> dict:
        result_dict = model_to_dict(self, fields=[field.name for field in self._meta.concrete_fields])
        # append sources and regexp
        result_dict.update(
            sources=[src.to_dict() for src in self.source.all() if src.active is True],
            typename=self.typename.typename,
            regexp=self.typename.regexp)
        # add addiditionl attrs
        result_dict.update(**kwargs)
        return result_dict
