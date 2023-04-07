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

CHOICE_ISOLATION_LEVEL = (
    ('READ_UNCOMMITTED', 'READ UNCOMMITTED'),
    ('READ_COMMITTED', 'READ COMMITTED'),
    ('REPEATABLE_READ', 'REPEATABLE READ'),
    ('SERIALIZABLE', 'SERIALIZABLE')
)

CHOICE_ENCODING = (
    ('ascii', 'ASCII'),
    ('big5', 'BIG5'),
    ('big5hkscs', 'BIG5HKSCS'),
    ('cp037', 'CP037'),
    ('cp273', 'CP273'),
    ('cp424', 'CP424'),
    ('cp437', 'cp437'),
    ('cp500', 'CP500'),
    ('cp720', 'CP720'),
    ('cp737', 'CP737'),
    ('cp775', 'CP775'),
    ('cp850', 'CP850'),
    ('cp852', 'CP852'),
    ('cp855', 'CP855'),
    ('cp856', 'CP856'),
    ('cp857', 'CP857'),
    ('cp858', 'CP858'),
    ('cp860', 'CP860'),
    ('cp861', 'CP861'),
    ('cp862', 'CP862'),
    ('cp863', 'CP863'),
    ('cp864', 'CP864'),
    ('cp865', 'CP865'),
    ('cp866', 'CP866'),
    ('cp869', 'CP869'),
    ('cp874', 'CP874'),
    ('cp875', 'CP875'),
    ('cp932', 'CP932'),
    ('cp949', 'CP949'),
    ('cp950', 'CP950'),
    ('cp1006', 'CP1006'),
    ('cp1026', 'CP1026'),
    ('cp1125', 'CP1125'),
    ('cp1140', 'CP1140'),
    ('cp1250', 'CP1250'),
    ('cp1251', 'CP1251'),
    ('cp1252', 'CP1252'),
    ('cp1253', 'CP1253'),
    ('cp1254', 'CP1254'),
    ('cp1255', 'CP1255'),
    ('cp1256', 'CP1256'),
    ('cp1257', 'CP1257'),
    ('cp1258', 'CP1258'),
    # ('euc_jp', 'EUC-JP'),
    # ('euc_jis_2004', 'EUC-JIS-2004'),
    # ('euc_jisx0213', 'EUC-JISX0213'),
    # ('euc_kr', 'EUC-KR'),
    # ('gb2312', 'GB2312'),
    # ('gbk', 'GBK'),
    # ('gb18030', 'GB18030'),
    # ('hz', 'HZ'),
    # ('iso2022_jp', 'ISO2022-JP'),
    # ('iso2022_jp_1', 'ISO2022-JP-1'),
    # ('iso2022_jp_2', 'ISO2022-JP-2'),
    # ('iso2022_jp_2004', 'ISO2022-JP-2004'),
    # ('iso2022_jp_3', 'ISO2022-JP-3'),
    # ('iso2022_jp_ext', 'ISO2022-JP-EXT'),
    ('iso2022_kr', 'ISO2022-KR'),
    ('latin_1', 'LATIN-1'),
    ('iso8859_2', 'ISO8859-2'),
    # ('iso8859_3', 'ISO8859-3'),
    # ('iso8859_4', 'ISO8859-4'),
    # ('iso8859_5', 'ISO8859-5'),
    # ('iso8859_6', 'ISO8859-6'),
    # ('iso8859_7', 'ISO8859-7'),
    # ('iso8859_8', 'ISO8859-8'),
    # ('iso8859_9', 'ISO8859-9'),
    # ('iso8859_10', 'ISO8859-10'),
    # ('iso8859_11', 'ISO8859-11'),
    # ('iso8859_13', 'ISO8859-13'),
    # ('iso8859_14', 'ISO8859-14'),
    # ('iso8859_15', 'ISO8859-15'),
    # ('iso8859_16', 'ISO8859-16'),
    ('johab', 'JOHAB'),
    ('koi8_r', 'KOI8-R'),
    ('koi8_t', 'KOI8-T'),
    ('koi8_u', 'KOI8-U'),
    ('kz1048', 'KZ1048'),
    ('mac_cyrillic', 'MAC-CYRILLIC'),
    # ('mac_greek', 'MAC-GREEK'),
    # ('mac_iceland', 'MAC-ICELAND'),
    # ('mac_latin2', 'MAC-LATIN2'),
    # ('mac_roman', 'MAC-ROMAN'),
    # ('mac_turkish', 'MAC-TURKISH'),
    # ('ptcp154', 'PTCP154'),
    # ('shift_jis', 'SHIFT-JIS'),
    # ('shift_jis_2004', 'SHIFT-JIS-2004'),
    # ('shift_jisx0213', 'SHIFT-JISX0213'),
    ('utf_32', 'UTF-32'),
    ('utf_32_be', 'UTF-32BE'),
    ('utf_32_le', 'UTF-32LE'),
    ('utf_16', 'UTF-16'),
    ('utf_16_be', 'UTF-16BE'),
    ('utf_16_le', 'UTF-16LE'),
    ('utf_7', 'UTF-7'),
    ('utf_8', 'UTF-8'),
    ('utf_8_sig', 'UTF-8 BOM')
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
    CSV = 'CSV', 'file', False
    SL1 = 'SQLITE', 'database', False
    SL3 = 'SQLITE3', 'database', False

    def __init__(self, title: str, icon: str = 'database', iframe: bool = False) -> None:
        self.title = title
        self.icon = icon
        self.iframe = iframe

    @classmethod
    def choices(cls):
        return tuple((item.name, item.title) for item in cls)


# Модель настройки иcточников
class sources(models.Model):
    active = models.BooleanField(default=True, verbose_name='Вкл')
    source = models.CharField(max_length=100, verbose_name='Название источника', unique=True)
    source_type = models.CharField(max_length=3, choices=SourceType.choices(), verbose_name='Тип источника')
    protocol = models.CharField(max_length=10, choices=CHOICE_PROTOCOL, default='', blank=True, verbose_name='Протокол', help_text='Актуален только для WEB-источников (ClickHouse, ElasticSearch, WEB, Jarvis)')
    host = models.CharField(max_length=100, verbose_name='Хост', help_text='IP-адрес или DNS-имя', null=True, blank=True)
    port = models.IntegerField(default=80, verbose_name='Порт')
    driver = models.CharField(max_length=100, verbose_name='Драйвер', null=True, blank=True, help_text='Прописывать драйвер, только при необходимости; <br> Пример: {ODBC Driver 17 for SQL Server}')
    instance = models.CharField(max_length=100, verbose_name='Экземпляр SQL-сервера', null=True, blank=True)
    database = models.CharField(max_length=100, verbose_name='База данных', null=True, blank=True)
    isolation_level = models.CharField(max_length=16, choices=CHOICE_ISOLATION_LEVEL, default='READ_UNCOMMITTED', verbose_name='Уровень изоляции')
    filename = models.CharField(max_length=256, verbose_name='Файл базы данных', null=True, blank=True)
    file_directory = models.CharField(max_length=256, verbose_name='Файловая директория', null=True, blank=True, help_text='Директория выступает в качестве базы данных, а файлы в качестве таблиц')
    source_headers = models.TextField(
        null=True,
        blank=True,
        verbose_name='Дополнительные HTTP-заголовки',
        validators=[JsonTextValidator(message='Неверный формат JSON', code='invalid_headers')],
        help_text=r'Заголовки суммируются, но приоритет отдается заголовкам в запросах, если они одинаквые. Пример: {"Accept-Encoding":"gzip, deflate, br", "Connection":"keep-alive"}'
    )
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
    def iframe(self) -> bool:
        return SourceType[self.source_type].iframe

    @property
    def icon(self) -> str:
        return SourceType[self.source_type].icon

    def selialize(self):
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
    encoding = models.CharField(max_length=16, choices=CHOICE_ENCODING, default='utf_8', verbose_name='Кодировка', help_text=r'Только для файлов. Кодировка файла')
    separator = models.CharField(max_length=8, default=',', verbose_name='Разделитель', help_text=r'Только для файлов. Разделитель полей в файле (tab - \t)')
    columns_exists = models.BooleanField(default=True, verbose_name='Имена столбцов', help_text=r'Только для файлов. Имена столбцов присутствуют')

    class Meta:
        unique_together = ['typename', 'name']
        verbose_name = 'Запросы'
        verbose_name_plural = 'Запросы'

    def __str__(self):
        return str(self.name)

    def selialize(self, **kwargs) -> dict:
        result_dict = model_to_dict(self, fields=[field.name for field in self._meta.concrete_fields])
        # append sources and regexp
        result_dict.update(
            sources=[src.selialize() for src in self.source.all() if src.active is True],
            typename=self.typename.typename,
            regexp=self.typename.regexp)
        # add addiditionl attrs
        result_dict.update(**kwargs)
        return result_dict
