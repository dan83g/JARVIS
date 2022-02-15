# Generated by Django 2.2.24 on 2021-09-23 20:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('map', '0010_coordinate'),
    ]

    operations = [
        migrations.AlterField(
            model_name='coordinate',
            name='regexp',
            field=models.CharField(default='(?P<lat>-?\\d{1,3})[\\.\\,](?P<lat_dec>\\d{1,15})[;\\t ](?P<long>-?\\d{1,3})[\\.\\,](?P<long_dec>\\d{1,15})\\x20(?P<text>\\w+)?', help_text='Основная задача состоит в том, чтобы создать регулярное выражение содержащее 4-5 именных групп:<br>\n        lat - целые числа широты; <br>\n        lat_dec - десятичные числа широты; <br>\n        long - целые числа долготы; <br>\n        long_dec - десятичные числа долготы; <br>\n        text - подпись для данной точки (если есть)', max_length=4000, verbose_name='Регулярное выражение'),
        ),
    ]
