# Generated by Django 2.2.24 on 2023-01-28 19:46

from django.db import migrations, models
import lib.validators


class Migration(migrations.Migration):

    dependencies = [
        ('search', '0053_auto_20220214_0013'),
    ]

    operations = [
        migrations.AddField(
            model_name='sources',
            name='source_headers',
            field=models.TextField(blank=True, help_text='Заголовки суммируются, но приоритет отдается заголовкам в запросах, если они одинаквые. Пример: {"Accept-Encoding":"gzip, deflate, br", "Connection":"keep-alive"}', null=True, validators=[lib.validators.JsonTextValidator(code='invalid_headers', message='Неверный формат JSON')], verbose_name='Дополнительные HTTP-заголовки'),
        ),
    ]