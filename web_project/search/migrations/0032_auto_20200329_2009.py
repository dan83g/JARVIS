# Generated by Django 2.2.7 on 2020-03-29 17:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('search', '0031_auto_20200329_1711'),
    ]

    operations = [
        migrations.AlterField(
            model_name='queries',
            name='source',
            field=models.ManyToManyField(help_text='Источник(и) к которому будет послан запрос', to='search.sources', verbose_name='Название источника(ов)'),
        ),
    ]
