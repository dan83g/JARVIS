from django.db import models
from django.core.validators import RegexValidator


CHOICE_PROTOCOL = (
    ('http', 'HTTP'),
    ('https', 'HTTPS'),
)

CHOICE_CRS = (
    # default
    ('EPSG3857', 'EPSG3857'),
    ('EPSG3395', 'EPSG3395'),
    ('EPSG4326', 'EPSG4326'),
)


# переопределяем
class IntegerFieldMinMax(models.IntegerField):
    def __init__(self, verbose_name=None, name=None, min_value=None, max_value=None, **kwargs):
        self.min_value, self.max_value = min_value, max_value
        models.IntegerField.__init__(self, verbose_name, name, **kwargs)

    def formfield(self, **kwargs):
        defaults = {'min_value': self.min_value, 'max_value': self.max_value}
        defaults.update(kwargs)
        return super(IntegerFieldMinMax, self).formfield(**defaults)


# Модель настройки источников
class tile_server(models.Model):
    active = models.BooleanField(verbose_name='Вкл', default=True)
    name = models.CharField(max_length=50, default='New tile-server', verbose_name='Название', unique=True)
    priority = models.IntegerField(default=0, verbose_name='Порядок', help_text='Указывает на порядок тайловых серверов')
    protocol = models.CharField(max_length=10, choices=CHOICE_PROTOCOL, default='http', verbose_name='Протокол')
    host = models.CharField(max_length=100, verbose_name='Хост')
    port = models.IntegerField(default=0, verbose_name='Порт')
    url = models.CharField(max_length=255, blank=True, verbose_name='URL', help_text='Например: /tiles/googlemap_{z}_{x}_{y}.png')
    crs = models.CharField(max_length=10, choices=CHOICE_CRS, default='EPSG3857', verbose_name='Пространственная привязка', help_text='EPSG3857 - Google, OSM, EPSG3395 - Yandex, EPSG4326 - ArcGis')
    min_zoom = IntegerFieldMinMax(default=0, min_value=0, max_value=20, verbose_name='Минимальный ZOOM')
    max_zoom = IntegerFieldMinMax(default=18, min_value=0, max_value=20, verbose_name='Максимальный ZOOM')

    class Meta:
        verbose_name = 'Тайловые сервера'
        verbose_name_plural = 'Тайловые сервера'

    def __str__(self):
        port = f":{self.port}" if self.port not in (0, None) else ""
        return f"{self.protocol}://{self.host}{port}{self.url}"


class sources(models.Model):
    CHOICE_SOURCE = (
        ('C', 'CLICKHOUSE'),
        ('M', 'MSSQL'),
        ('W', 'WEB'),
    )

    active = models.BooleanField(verbose_name='Вкл', default=True)
    source = models.CharField(max_length=100, verbose_name='Название источника')
    source_type = models.CharField(max_length=1, choices=CHOICE_SOURCE, verbose_name='Тип источника')
    driver = models.CharField(max_length=100, verbose_name='Драйвер', null=True, blank=True)
    host = models.CharField(max_length=100, verbose_name='Хост')
    port = models.IntegerField(default=0, verbose_name='Порт')
    instance = models.CharField(max_length=100, verbose_name='Экземпляр SQL-сервера', null=True, blank=True)
    database = models.CharField(max_length=100, verbose_name='База данных', null=True, blank=True)
    user = models.CharField(max_length=50, verbose_name='Пользователь', null=True, blank=True)
    password = models.CharField(max_length=50, verbose_name='Пароль', null=True, blank=True)

    class Meta:
        verbose_name = 'Источники данных'
        verbose_name_plural = 'Источники данных'

    def __str__(self):
        return self.source


class coordinate(models.Model):
    active = models.BooleanField(verbose_name='Вкл', default=True)
    name = models.CharField(max_length=100, verbose_name='Название', unique=True, validators=[RegexValidator(regex=r'^([-_\w]+)$', message='Доступные символы А-ЯA-Z0-9_-', code='invalid_name')])
    priority = models.IntegerField(default=0, verbose_name='Приоритет', help_text='Приоритет в соответствии с которым сортируются типы')
    regexp = models.CharField(
        max_length=4000,
        verbose_name='Регулярное выражение',
        default=r"(?P<lat>-?\d{1,3})[\.\,](?P<lat_dec>\d{1,15})[;\t ](?P<long>-?\d{1,3})[\.\,](?P<long_dec>\d{1,15})(\x20)?(?P<text>\w+)?",
        help_text='''Основная задача состоит в том, чтобы создать регулярное выражение содержащее 4-5 именных групп:<br>
        lat - целые числа широты; <br>
        lat_dec - десятичные числа широты; <br>
        long - целые числа долготы; <br>
        long_dec - десятичные числа долготы; <br>
        text - подпись для данной точки (если есть)''')

    class Meta:
        verbose_name = 'Координаты'
        verbose_name_plural = 'Координаты'

    def __str__(self):
        return self.name
