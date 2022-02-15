# Generated by Django 2.2.24 on 2021-10-10 22:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('search', '0049_auto_20210925_1510'),
    ]

    operations = [
        migrations.AlterField(
            model_name='queries',
            name='code_type',
            field=models.CharField(blank=True, choices=[('text', 'Text'), ('json', 'Json'), ('xml', 'XML'), ('python', 'Python')], help_text='Работает только для Rest-источников<br>Работает в паре с полем XPath/JSONPath/Python-скрипт', max_length=10, null=True, verbose_name='Обработка ответа сервера'),
        ),
        migrations.AlterField(
            model_name='sources',
            name='source_type',
            field=models.CharField(choices=[('W', 'WEB'), ('C', 'CLICKHOUSE'), ('M', 'MSSQL'), ('E', 'ELASTIC'), ('J', 'JARVIS'), ('R', 'REST')], max_length=3, verbose_name='Тип источника'),
        ),
    ]
