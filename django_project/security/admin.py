from django.contrib import admin
from django.contrib import messages
from django.contrib.auth.admin import GroupAdmin, UserAdmin
from django.contrib.auth.models import Group
from django.utils.translation import gettext_lazy as _
from django.utils.safestring import mark_safe
from django.forms import PasswordInput
from lib.decorators import Description
from lib.ldap import LDAP
from .service import UserUpdateter
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


@admin.register(models.User)
class userAdmin(UserAdmin):
    fieldsets = (
        (None, {"fields": ("username", "password")}),
        (_("Personal info"), {"fields": ("first_name", "last_name", "email")}),
        (
            _("Permissions"),
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
        (_("Important dates"), {"fields": ("last_login", "date_joined")}),
        (_("GUID"), {"fields": ("guid", )}),
        (_("Settings"), {"fields": ("settings", )}),
    )


# unregister original Group and User models from admin
admin.site.unregister(Group)
# admin.site.unregister(User)


# # register proxy User model
# @admin.register(models.proxy_user)
# class proxy_userAdmin(UserAdmin):
#     ordering = ['username']
#     actions = [action_activate, action_deactivate]


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
        # save model
        if "_continue" in request.POST:
            try:
                obj.save()
            except Exception as error:
                self.message_user(request, f"Ошибка при сохранении настроек LDAP {error}", level=messages.ERROR)

        # Test LDAP connection
        if request.POST.get("_continue", None) == "Тест подключения":
            try:
                ldap = LDAP.init_from_dict(obj.as_dict())  # type: ignore
                ldap.test_connection()
                self.message_user(request, 'Тест подключения успешно пройден')
            except Exception as error:
                self.message_user(request, f'{error}', level=messages.ERROR)

        # update users and groups
        elif request.POST.get("_continue", None) == "Обновить данные пользователей":
            try:
                UserUpdateter().update_all_existing_users()
                self.message_user(request, 'Пользователи успешно обновлены')
            except Exception as error:
                self.message_user(request, f'{error}', level=messages.ERROR)

        return super().response_change(request, obj)
