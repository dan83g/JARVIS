# Generated by Django 2.2.7 on 2020-02-17 22:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('search', '0014_remove_queries_base64'),
    ]

    operations = [
        migrations.AlterField(
            model_name='queries',
            name='script',
            field=models.TextField(blank=True, help_text='Python-скрипт, позволяющий обрабатывать выделенные по регулярным выражениям из текста значения, перед тем как они будут помещены в текст запроса. Массив values содержит значения(тип str). Пример: values = list( map(lambda x:x[:3], values)) При ошибке в скрипте он игнорируется', null=True, verbose_name='Скрипт предобрабоки'),
        ),
    ]