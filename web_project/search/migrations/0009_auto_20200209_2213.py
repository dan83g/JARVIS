# Generated by Django 2.2.7 on 2020-02-09 19:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('search', '0008_auto_20200209_1726'),
    ]

    operations = [
        migrations.AlterField(
            model_name='queries',
            name='datatype',
            field=models.CharField(choices=[('int', 'Integer'), ('float', 'Float'), ('string', 'String'), ('datetime', 'Date'), ('datetime', 'DateTime'), ('ipv4', 'IPv4'), ('ipv6', 'IPv6'), ('asis', 'asIS')], default='string', max_length=10, verbose_name='Тип данных'),
        ),
    ]
