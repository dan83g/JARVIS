# Generated by Django 2.2.7 on 2020-02-09 19:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('search', '0009_auto_20200209_2213'),
    ]

    operations = [
        migrations.AlterField(
            model_name='types',
            name='typename',
            field=models.CharField(max_length=100, unique=True, verbose_name='Тип идентификатора'),
        ),
    ]
