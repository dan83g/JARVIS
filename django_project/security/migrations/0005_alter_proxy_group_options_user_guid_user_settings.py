# Generated by Django 4.1.6 on 2023-04-08 20:32

from django.db import migrations, models
import lib.validators


class Migration(migrations.Migration):

    dependencies = [
        ('security', '0004_ldap_user_guid_param_alter_ldap_protocol'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='proxy_group',
            options={'verbose_name': 'Группы безопасности', 'verbose_name_plural': 'Группы безопасности'},
        ),
        migrations.AddField(
            model_name='user',
            name='guid',
            field=models.CharField(help_text='Guid is using to synchronize data from LDAP server', max_length=38, null=True, verbose_name='User guid'),
        ),
        migrations.AddField(
            model_name='user',
            name='settings',
            field=models.TextField(blank=True, help_text='Example: {"theme": "vela-blue", "errors": "true"}', null=True, validators=[lib.validators.JsonTextValidator(code='invalid_json_format', message='Invalid JSON format')], verbose_name='User settings'),
        ),
    ]