# Generated by Django 2.2.7 on 2020-02-02 14:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('search', '0002_auto_20200202_1602'),
    ]

    operations = [
        migrations.AddField(
            model_name='queries',
            name='timeout',
            field=models.IntegerField(default=30, verbose_name='Время ожидания'),
        ),
    ]