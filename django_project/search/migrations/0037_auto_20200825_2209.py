# Generated by Django 2.2.7 on 2020-08-25 19:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('search', '0036_auto_20200825_2155'),
    ]

    operations = [
        migrations.AlterField(
            model_name='queries',
            name='response_format',
            field=models.CharField(blank=True, choices=[('text', 'Text'), ('json', 'Json'), ('xml', 'XML')], default='json', help_text='Работает только для Rest-источников', max_length=10, null=True, verbose_name='Формат возвращаемых данных'),
        ),
    ]