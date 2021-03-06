# Generated by Django 2.2.7 on 2020-02-09 14:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('search', '0006_auto_20200207_0007'),
    ]

    operations = [
        migrations.CreateModel(
            name='v_user_settings',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('username', models.CharField(max_length=150, verbose_name='Пользователь')),
                ('typename', models.CharField(max_length=100, verbose_name='Параметр поиска')),
                ('name', models.CharField(default='Новый запрос', max_length=255, verbose_name='Название запроса')),
                ('active', models.BooleanField(default=True, verbose_name='Вкл')),
            ],
            options={
                'verbose_name': 'Настройки пользователя',
                'verbose_name_plural': 'Настройки пользователя',
                'db_table': 'v_user_settings',
                'managed': False,
            },
        ),
        migrations.DeleteModel(
            name='v_userSettings',
        ),
    ]
