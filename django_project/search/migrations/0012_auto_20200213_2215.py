# Generated by Django 2.2.7 on 2020-02-13 19:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('auth', '0011_update_proxy_permissions'),
        ('search', '0011_auto_20200213_2211'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='queries',
            name='group',
        ),
        migrations.AddField(
            model_name='queries',
            name='group',
            field=models.ManyToManyField(blank=True, help_text='Группа для которой доступен данный запрос', null=True, to='auth.Group'),
        ),
    ]
