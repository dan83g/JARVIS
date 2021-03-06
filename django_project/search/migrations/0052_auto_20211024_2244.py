# Generated by Django 2.2.24 on 2021-10-24 19:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('search', '0051_auto_20211013_2312'),
    ]

    operations = [
        migrations.AddField(
            model_name='sources',
            name='filename',
            field=models.CharField(blank=True, max_length=256, null=True, verbose_name='Файл'),
        ),
        migrations.AlterField(
            model_name='sources',
            name='source_type',
            field=models.CharField(choices=[('W', 'WEB'), ('C', 'CLICKHOUSE'), ('M', 'MSSQL'), ('E', 'ELASTIC'), ('J', 'JARVIS'), ('R', 'REST'), ('PGS', 'POSTGRESQL'), ('MYS', 'MYSQL'), ('EXL', 'EXCEL')], max_length=3, verbose_name='Тип источника'),
        ),
    ]
