# Generated by Django 2.2.7 on 2020-02-13 20:32

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('search', '0013_auto_20200213_2247'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='queries',
            name='base64',
        ),
    ]
