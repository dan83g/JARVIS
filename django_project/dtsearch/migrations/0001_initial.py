# Generated by Django 2.2.7 on 2020-01-24 20:35

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='hosts',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('active', models.BooleanField(default=True, verbose_name='Вкл')),
                ('host', models.CharField(max_length=100, verbose_name='Хост')),
                ('port', models.IntegerField(default=0, verbose_name='Порт')),
            ],
            options={
                'verbose_name': 'Источники данных',
                'verbose_name_plural': 'Источники данных',
            },
        ),
        migrations.CreateModel(
            name='indexes',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('active', models.BooleanField(default=True, verbose_name='Вкл')),
                ('name', models.CharField(max_length=100, verbose_name='Название индекса')),
                ('path', models.CharField(max_length=255, verbose_name='Путь к индексу')),
                ('host', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='dtsearch.hosts', verbose_name='Источник')),
            ],
            options={
                'verbose_name': 'Индекса',
                'verbose_name_plural': 'Индекса',
            },
        ),
    ]