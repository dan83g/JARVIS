from django.contrib import admin
# from django.contrib.admin import DateFieldListFilter

from . import models
from lib.decorators import Description


# Добавляем действие для админки
@Description("Включить выбранные")
def action_activate(modeladmin, request, queryset):
    rows_updated = queryset.update(active=True)
    if rows_updated == 1:
        message_bit = "1 запись"
    else:
        message_bit = "%s записей" % rows_updated
    modeladmin.message_user(request, "Обновлено: %s" % message_bit)


# Добавляем действие
@Description("Выключить выбранные")
def action_deactivate(modeladmin, request, queryset):
    rows_updated = queryset.update(active=False)
    if rows_updated == 1:
        message_bit = "1 запись"
    else:
        message_bit = "%s записей" % rows_updated
    modeladmin.message_user(request, "Обновлено: %s" % message_bit)


# модель настройки Источников заносим в админку
@admin.register(models.hosts)
class hostsAdmin(admin.ModelAdmin):
    fields = ['active', 'protocol', 'host', 'port']
    list_display = ['protocol', 'host', 'port', 'active']
    search_fields = ['host']
    list_filter = ['host', 'port', 'active']
    ordering = ['active', 'host', 'port']
    actions = [action_activate, action_deactivate]


# модель настройки Индексов заносим в админку
@admin.register(models.indexes)
class indexesAdmin(admin.ModelAdmin):
    fields = ['name', 'active', 'host', 'path', 'group']
    list_display = ['name', 'active', 'host', 'path']
    search_fields = ['name']
    list_filter = ['host', 'active']
    ordering = ['active', 'host', 'name']
    actions = [action_activate, action_deactivate]
