# Generated by Django 2.2.7 on 2020-02-13 19:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('search', '0012_auto_20200213_2215'),
    ]

    operations = [
        migrations.AlterField(
            model_name='queries',
            name='group',
            field=models.ManyToManyField(blank=True, help_text='Группа для которой доступен данный запрос', to='auth.Group', verbose_name='Группа безопасности'),
        ),
    ]
