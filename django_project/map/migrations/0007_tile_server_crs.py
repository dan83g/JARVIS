# Generated by Django 2.2.7 on 2021-02-16 19:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('map', '0006_auto_20210213_2141'),
    ]

    operations = [
        migrations.AddField(
            model_name='tile_server',
            name='crs',
            field=models.CharField(choices=[('EPSG3857', 'EPSG3857'), ('EPSG3395', 'EPSG3395'), ('EPSG4326', 'EPSG4326')], default='EPSG3857', max_length=10, verbose_name='Пространственная привязка'),
        ),
    ]
