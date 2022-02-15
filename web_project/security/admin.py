from django.contrib import admin
from django.contrib import messages
from django.contrib.auth.admin import GroupAdmin, UserAdmin
from django.contrib.auth.models import Group, User
from django.utils.safestring import mark_safe
from django.forms import PasswordInput
from lib.decorators import Description
from . import models


# Добавляем действие для админки
@Description("Включить выбранные")
def action_activate(modeladmin, request, queryset):
    rows_updated = queryset.update(active=True)
    if rows_updated == 1:
        message_bit = "1 запись"
    else:
        message_bit = "%s записей" % rows_updated
    modeladmin.message_user(request, "Обновлено: %s" % message_bit)


# Добавляем действие для админки
@Description("Выключить выбранные")
def action_deactivate(modeladmin, request, queryset):
    rows_updated = queryset.update(active=False)
    if rows_updated == 1:
        message_bit = "1 запись"
    else:
        message_bit = "%s записей" % rows_updated
    modeladmin.message_user(request, "Обновлено: %s" % message_bit)


# unregister original Group and User models from admin
admin.site.unregister(Group)
admin.site.unregister(User)


# register proxy User model
@admin.register(models.proxy_user)
class proxy_userAdmin(UserAdmin):
    ordering = ['username']
    actions = [action_activate, action_deactivate]


# register proxy Group model
@admin.register(models.proxy_group)
class proxy_groupAdmin(GroupAdmin):
    list_display = ('name', 'users')
    ordering = ['name']

    def users(self, obj):
        return mark_safe(", ".join([f'<a href="/admin/security/proxy_user/{user.id}/change/">{user.username}</a>' for user in obj.user_set.all()]))
    users.short_description = 'Пользователи'
    users.allow_tags = True


@admin.register(models.ldap)
class ldapAdmin(admin.ModelAdmin):
    list_display = ['source', 'protocol', 'host', 'port']
    list_filter = ['active', 'source']
    ordering = ['active']
    actions = [action_activate, action_deactivate]

    def has_add_permission(self, request):
        if self.model.objects.count() >= 1:
            return False
        return super().has_add_permission(request)

    def formfield_for_dbfield(self, db_field, **kwargs):
        if db_field.name == 'password':
            kwargs['widget'] = PasswordInput(render_value=True)
        return super(ldapAdmin, self).formfield_for_dbfield(db_field, **kwargs)

    def response_change(self, request, obj):
        # Сохраняем модель
        if "_continue" in request.POST:
            try:
                obj.save()
            except Exception as error:
                self.message_user(request, f"Ошибка при сохранении настроек LDAP {error}", level=messages.ERROR)

        # Test LDAP connection
        if request.POST.get("_continue", None) == "Тест подключения":
            if not obj.test_connection():
                self.message_user(request, obj.errors_as_string, level=messages.ERROR)
            else:
                self.message_user(request, r"Тест подключения успешно пройден")

        # update users and groups
        elif request.POST.get("_continue", None) == "Обновить данные пользователей":
            if not obj.update_users():
                self.message_user(request, obj.errors_as_string, level=messages.ERROR)
            else:
                self.message_user(request, r"Пользователи успешно обновлены")

        return super().response_change(request, obj)
