# Generated by Django 4.1.6 on 2023-04-08 19:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('search', '0057_remove_sources_columns_exists_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='sources',
            name='file_directory',
            field=models.CharField(blank=True, help_text='Директория выступает в качестве базы данных, а файлы в качестве таблиц', max_length=256, null=True, verbose_name='Файловая директория'),
        ),
        migrations.AlterField(
            model_name='sources',
            name='filename',
            field=models.CharField(blank=True, max_length=256, null=True, verbose_name='Файл базы данных'),
        ),
    ]