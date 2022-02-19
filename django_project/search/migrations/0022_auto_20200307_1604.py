# Generated by Django 2.2.7 on 2020-03-07 13:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('search', '0021_auto_20200307_1603'),
    ]

    operations = [
        migrations.AlterField(
            model_name='sources',
            name='protocol',
            field=models.CharField(choices=[('http', 'HTTP'), ('https', 'HTTPS')], default='http', help_text='Актуален только для WEB-источников (ClickHouse, ElasticSearch, WEB, Jarvis)', max_length=10, verbose_name='Протокол'),
        ),
    ]