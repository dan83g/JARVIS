# Generated by Django 2.2.24 on 2022-02-13 21:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('search', '0052_auto_20211024_2244'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='queries',
            name='user',
        ),
        migrations.AlterField(
            model_name='sources',
            name='driver',
            field=models.CharField(blank=True, help_text='Прописывать драйвер, только при необходимости; <br> Пример: {ODBC Driver 17 for SQL Server}', max_length=100, null=True, verbose_name='Драйвер'),
        ),
        migrations.AlterField(
            model_name='sources',
            name='host',
            field=models.CharField(blank=True, help_text='IP-адрес или DNS-имя', max_length=100, null=True, verbose_name='Хост'),
        ),
        migrations.AlterField(
            model_name='sources',
            name='source_type',
            field=models.CharField(choices=[('W', 'WEB'), ('C', 'CLICKHOUSE'), ('M', 'MSSQL'), ('E', 'ELASTIC'), ('J', 'JARVIS'), ('R', 'REST'), ('PGS', 'POSTGRESQL'), ('MYS', 'MYSQL'), ('EXL', 'EXCEL'), ('SL1', 'SQLITE'), ('SL3', 'SQLITE3')], max_length=3, verbose_name='Тип источника'),
        ),
        migrations.DeleteModel(
            name='user_queries',
        ),
    ]
