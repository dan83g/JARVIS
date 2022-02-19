from django.db import models
from django.contrib.auth.models import Group


CHOICE_PROTOCOL = (
    ('http', 'HTTP'),
    ('https', 'HTTPS'),
)


# Модель настройки ичточников
class hosts(models.Model):
    active = models.BooleanField(verbose_name='Вкл', default=True)
    protocol = models.CharField(max_length=10, choices=CHOICE_PROTOCOL, default='http', verbose_name='Протокол', help_text='http или https')
    host = models.CharField(max_length=100, verbose_name='Хост', help_text='IP или имя хоста')
    port = models.IntegerField(default=0, verbose_name='Порт')

    class Meta:
        verbose_name = 'Источники данных'
        verbose_name_plural = 'Источники данных'

    def __str__(self):
        return "{protocol}://{host}:{port}".format(
            protocol=self.protocol,
            host=self.host,
            port=self.port
        )


# Модель настройки ичточников
class indexes(models.Model):
    host = models.ForeignKey(hosts, on_delete=models.CASCADE, verbose_name='Источник')
    active = models.BooleanField(verbose_name='Вкл', default=True)
    name = models.CharField(max_length=100, verbose_name='Название индекса')
    path = models.CharField(max_length=255, unique=True, verbose_name='Путь к индексу')
    group = models.ManyToManyField(Group, blank=True, verbose_name='Группа безопасности', help_text='Группа(ы) для которой доступен данный индекс, если не выбранна ни одна, то доступна всем. ')

    class Meta:
        verbose_name = 'Индексы'
        verbose_name_plural = 'Индексы'

    def __str__(self):
        return self.name
