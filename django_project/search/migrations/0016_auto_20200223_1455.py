# Generated by Django 2.2.7 on 2020-02-23 11:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('search', '0015_auto_20200218_0124'),
    ]

    operations = [
        migrations.AlterField(
            model_name='queries',
            name='query',
            field=models.TextField(help_text='Должен содержать SQL или HTTP запрос к источнику данных. Должен содержать значение {value} или {values}. <br>Для сложных SQL-запросов в начале запроса следует добавить следующие выражения:<br> SET NOCOUNT ON; SET ANSI_WARNINGS OFF;', verbose_name='SQL-запрос'),
        ),
    ]