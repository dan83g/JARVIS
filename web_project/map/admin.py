from django.contrib import admin
from django.forms import PasswordInput
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


# Добавляем действие для админки
@Description("Выключить выделенные")
def action_deactivate(modeladmin, request, queryset):
    rows_updated = queryset.update(active=False)
    if rows_updated == 1:
        message_bit = "1 запись"
    else:
        message_bit = "%s записей" % rows_updated
    modeladmin.message_user(request, "Обновлено: %s" % message_bit)


# модель настройки тайлового сервера
@admin.register(models.tile_server)
class tile_serverAdmin(admin.ModelAdmin):
    fields = ['name', 'active', 'priority', 'protocol', 'host', 'port', 'url', 'crs', 'min_zoom', 'max_zoom']
    list_display = ['name', 'active', 'priority', 'host', 'port']
    search_fields = ['host']
    list_filter = ['host', 'port', 'active']
    ordering = ['-active', 'priority']
    actions = [action_activate, action_deactivate]


# модель настройки регулярок для координат
@admin.register(models.coordinate)
class coordinateAdmin(admin.ModelAdmin):
    fields = ['name', 'active', 'priority', 'regexp']
    list_display = ['name', 'active', 'priority', 'regexp']
    search_fields = ['name']
    list_filter = ['active']
    ordering = ['-active', 'priority']
    actions = [action_activate, action_deactivate]


# модель настройки Источников заносим в админку
@admin.register(models.sources)
class sourcesAdmin(admin.ModelAdmin):
    fields = ['source', 'active', 'source_type', 'driver', 'host', 'port', 'instance', 'database', 'user', 'password']
    list_display = ['source', 'active', 'source_type', 'driver', 'host', 'port', 'instance', 'database', 'user', 'password']
    search_fields = ['source']
    list_filter = ['source', 'host', 'active']
    ordering = ['-active', 'source']
    actions = [action_activate, action_deactivate]

    def formfield_for_dbfield(self, db_field, **kwargs):
        if db_field.name == 'password':
            kwargs['widget'] = PasswordInput(render_value=True)
        return super(sourcesAdmin, self).formfield_for_dbfield(db_field, **kwargs)
