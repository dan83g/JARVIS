# Generated by Django 2.2.7 on 2021-02-13 18:41

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('search', '0046_auto_20201203_2253'),
    ]

    operations = [
        migrations.AlterField(
            model_name='queries',
            name='code',
            field=models.TextField(blank=True, help_text='Работает только для Rest-источников:<br>\n        1) Пример XPath: /foo/bar;<br>\n        2) Пример JSONPath: $.foo.bar[*];<br>\n           $.hits.hits[*]._source[*] - пример для elasticsearch;<br>\n        3) Python-скрипт: в переменной text находится текст ответа сервера;<br>\n           Результат обработки необходимо поместить в results в формате list of dictionaries<br>\n           При ошибке скрипта данные возвращаются в текстовом виде<br>\n           Пример:<br>\n           import json<br>\n           oJson = json.loads(text)<br>\n           results = [{"mykey": item[\'tag\']} for item in oJson]\n        ', null=True, verbose_name='XPath/JSONPath/Python-код'),
        ),
        migrations.AlterField(
            model_name='queries',
            name='name',
            field=models.CharField(default='Новый запрос', max_length=255, validators=[django.core.validators.RegexValidator(code='invalid_name', message='Доступные символы А-ЯA-Z0-9_-', regex='^([-_\\w()]+)$')], verbose_name='Название запроса'),
        ),
        migrations.AlterField(
            model_name='queries',
            name='query',
            field=models.TextField(help_text='Должен содержать SQL или относительный URL к источнику данных. <br>Допустимые параметры: {{value}},{{values}},{{values_list}},{{username}},{{now}},{{original_value}},{{original_values_list}},{{groups_list}}. <br>Директиву USE не использовать;<br>При необходимости, в начале запроса следует добавить выражения:<br> SET ANSI_WARNINGS OFF;', verbose_name='SQL-запрос/URL'),
        ),
        migrations.AlterField(
            model_name='queries',
            name='request_data',
            field=models.TextField(blank=True, help_text='Работает только для источников: Rest, ElasticSearch, Jarvis.<br>Допустимые параметры: {{value}},{{values}},{{values_list}},{{username}},{{now}},{{original_value}},{{original_values_list}},{{groups_list}}.', null=True, verbose_name='Вложенные данные запроса'),
        ),
    ]
