# Generated by Django 2.2.7 on 2020-09-28 19:35

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('search', '0043_auto_20200926_1821'),
    ]

    operations = [
        migrations.AlterField(
            model_name='queries',
            name='headers',
            field=models.TextField(blank=True, help_text='Работает только для источников: ClickHouse, Rest, ElasticSearch, Jarvis. Пример: {"Accept-Encoding":"gzip, deflate, br", "Connection":"keep-alive"}', null=True, validators=[django.core.validators.RegexValidator(code='invalid_headers', message='Неверный формат данных', regex='^{(([\\x20]+)?".+"([\\x20]+)?:([\\x20]+)?".+"([\\x20]+)?,?)+}$')], verbose_name='Дополнительные HTTP-заголовки'),
        ),
        migrations.AlterField(
            model_name='queries',
            name='response_format',
            field=models.CharField(blank=True, choices=[('text', 'Text'), ('json', 'Json'), ('xml', 'XML'), ('python', 'Python')], default='json', help_text='Работает только для Rest-источников<br>Работает в паре с полем XPath/JSONPath/Python-скрипт', max_length=10, null=True, verbose_name='Обработка ответа сервера'),
        ),
        migrations.AlterField(
            model_name='queries',
            name='script',
            field=models.TextField(blank=True, help_text='Python-скрипт, позволяющий обрабатывать выделенные по регулярным выражениям из текста значения, перед тем как они будут помещены в текст запроса.  При любой ошибке в скрипте он игнорируется.<br>Массив values содержит массив значений(тип str).<br>Пример: values = list( map(lambda x:x[:3], values))', null=True, verbose_name='Скрипт предобрабоки'),
        ),
        migrations.AlterField(
            model_name='queries',
            name='xpath',
            field=models.TextField(blank=True, help_text='Работает только для Rest-источников:<br>\n        1) Пример XPath: /foo/bar;<br>\n        2) Пример JSONPath: $.foo.bar[*];<br>\n           $.hits.hits[*]._source.source[*] - пример для elasticsearch;<br>\n        3) Python-скрипт: в results[0] находится текст ответа сервера;<br>\n           Результат обработки необходимо поместить в results в формате list of dictionary<br>\n           При ошибке скрипта данные возвращаются в текстовом виде<br>\n           Пример:<br>\n           import json<br>\n           oJson = json.loads(results[0])<br>\n           results = [{"mykey": item[\'tag\']} for item in oJson]\n        ', null=True, verbose_name='XPath/JSONPath/Python'),
        ),
    ]