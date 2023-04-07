from django.contrib import admin
from django.contrib import messages

# from import_export import resources
# from import_export.admin import ImportExportModelAdmin

from lib.decorators import Description
from lib.handlers import Handler, JarvisHandler
from . import models
from django.shortcuts import redirect
from django.forms import PasswordInput
from api.forms import ApiSearchModel
import re as regex
from datetime import datetime


# Добавляем действие для админки
@Description("Включить")
def action_activate(modeladmin, request, queryset):
    rows_updated = queryset.update(active=True)
    if rows_updated == 1:
        message_bit = "1 запись"
    else:
        message_bit = "%s записей" % rows_updated
    modeladmin.message_user(request, "Обновлено: %s" % message_bit)


# Добавляем действие для админки
@Description("Выключить")
def action_deactivate(modeladmin, request, queryset):
    rows_updated = queryset.update(active=False)
    if rows_updated == 1:
        message_bit = "1 запись"
    else:
        message_bit = "%s записей" % rows_updated
    modeladmin.message_user(request, "Обновлено: %s" % message_bit)


# Добавляем действие для админки
@Description("Доступно для ЦПИ")
def action_cpi_on(modeladmin, request, queryset):
    rows_updated = queryset.update(cpi=True)
    if rows_updated == 1:
        message_bit = "1 запись"
    else:
        message_bit = "%s записей" % rows_updated
    modeladmin.message_user(request, "Обновлено: %s" % message_bit)


# Добавляем действие для админки
@Description("Не доступно для ЦПИ")
def action_cpi_off(modeladmin, request, queryset):
    rows_updated = queryset.update(cpi=False)
    if rows_updated == 1:
        message_bit = "1 запись"
    else:
        message_bit = "%s записей" % rows_updated
    modeladmin.message_user(request, "Обновлено: %s" % message_bit)


@Description("Загрузить запросы от источников")
def action_queries_from_source(modeladmin, request, queryset):
    cnt = 0
    # копируем запросы у другого JARVIS
    errors = []
    for src in filter(lambda x: x.source_type == "J", queryset):
        src_dict = src.selialize()
        src_dict['method'] = 'GET'
        src_dict['prepared_query'] = '/api/v1/query.list'
        jarvis_handler = JarvisHandler.from_dict(initial_dict=src_dict)
        result_queries, errors = jarvis_handler.execute()

        for query in result_queries:
            try:
                typename, created = models.types.objects.get_or_create(
                    typename=query.get('typename'),
                    defaults={
                        'typename': query.get('typename'),
                        'regexp': query.get('regexp'),
                        'priority': 10,
                    }
                )
            except Exception as error:
                errors.append(f"Ошибка добавления типа {query.get('typename')}: {error}")
                continue

            # добавляем запрос
            try:
                query_obj, created = models.queries.objects.get_or_create(
                    name="{name}({source})".format(name=query.get('name'), source=src.source),
                    typename=typename,
                    defaults={
                        'name': "{name}({source})".format(name=query.get('name'), source=src.source),
                        'typename': typename,
                        'position': 10,
                        'query': '/api/v1/query.data',
                        'method': 'POST',
                        'request_data': ApiSearchModel(typename=query.get('typename'), queryname=query.get('name'), value="{value}").json(),
                        'datatype': 'asis'
                    }
                )
            except Exception as error:
                errors.append(f"Ошибка добавления запроса {query.get('name')}: {error}")
                continue

            # если добавлен новый запрос то для него добавляем источник
            if created:
                cnt += 1
                query_obj.source.add(src)
                query_obj.save()

    if errors:
        modeladmin.message_user(request, r"\r\n ".join(error for error in errors), level=messages.ERROR)
    elif cnt > 0:
        modeladmin.message_user(request, "Получение запроса(ов) от источника(ов) успешно заершено. Добавлено {count} запросов".format(count=cnt))
    else:
        modeladmin.message_user(request, "Получение запроса(ов) от источника(ов) успешно заершено. Новых запросов не выявлено")


@Description("Копировать")
def copy_query(modeladmin, request, queryset):
    # копируем данные
    errors = []
    cnt = 0
    for item in queryset:
        item.pk = None
        item.active = False
        item.name = f'Копия_{item.name}_{datetime.now():%Y%m%d%H%M%S}'
        try:
            item.save()
            cnt += 1
        except Exception as error:
            errors.append(str(error))
    if errors:
        modeladmin.message_user(request, r"\r\n ".join(error for error in errors), level=messages.ERROR)
    else:
        modeladmin.message_user(request, "Скопировано: %s запись(ей)" % cnt)


@Description("Копировать")
def copy_source(modeladmin, request, queryset):
    # копируем данные
    errors = []
    cnt = 0
    for item in queryset:
        item.pk = None
        item.active = False
        item.source = f'Копия_{item.source}'
        try:
            item.save()
            cnt += 1
        except Exception as error:
            errors.append(str(error))
    if errors:
        modeladmin.message_user(request, r"\r\n ".join(error for error in errors), level=messages.ERROR)
    else:
        modeladmin.message_user(request, "Скопировано: %s запись(ей)" % cnt)


# ping sources action
@Description("Тест источников")
def action_test_sources(modeladmin, request, queryset):
    modeladmin.errors = []
    for obj in queryset:
        modeladmin.test_source(obj)
        if modeladmin.errors:
            modeladmin.message_user(request, r"\r\n ".join(error for error in modeladmin.errors), level=messages.ERROR)
        else:
            modeladmin.message_user(request, "Тест подключения к источнику(ам) завершен успешно")


# model sources
@admin.register(models.sources)
class sourcesAdmin(admin.ModelAdmin):
    list_display = ['source', 'active', 'source_type', 'protocol', 'host', 'port', 'instance', 'database', 'file_directory']
    search_fields = ['source']
    list_filter = ['source_type', 'host', 'active']
    ordering = ['-active', 'source']
    actions = [action_activate, action_deactivate, copy_source, action_test_sources, action_queries_from_source]
    list_per_page = 100
    fieldsets = (
        (None, {
            'fields': ('source', 'active', 'source_type', 'host', 'port'),
        }),
        ('База данных', {
            'fields': ('driver', 'instance', 'database', 'isolation_level', 'filename', ),
        }),
        ('Файловая директория', {
            'fields': ('file_directory', ),
        }),
        ('HTTP-источник', {
            'fields': ('protocol', 'source_headers'),
        }),
        ('Аутентификация', {
            'fields': ('user', 'password'),
        }),
    )

    def formfield_for_dbfield(self, db_field, **kwargs):
        """hide passwords in admin
        """
        if db_field.name == 'password':
            kwargs['widget'] = PasswordInput(render_value=True)
        return super(sourcesAdmin, self).formfield_for_dbfield(db_field, **kwargs)

    def response_change(self, request, obj):
        self.errors = []
        if "_continue" in request.POST and request.POST.get("_continue", None) == "Тест подключения":
            try:
                obj.save()
            except Exception as error:
                self.message_user(request, f"Ошибка при сохранении запроса {error}", level=messages.ERROR)

            # тестируем подключение
            if not self.test_source(obj):
                self.message_user(request, r"\r\n ".join(error for error in self.errors), level=messages.ERROR)
            else:
                self.message_user(request, r"Тест подключения успешно пройден")

        return super().response_change(request, obj)

    def test_source(self, obj):
        try:
            handler = Handler(initial_dict=obj.selialize(), handler_name=obj.source_type)
            return handler.ping()
        except Exception as error:
            self.errors.extend(f'{error}')
        return False


# модель настройки типов идентификаторов
@admin.register(models.types)
class typesAdmin(admin.ModelAdmin):
    fields = ['typename', 'active', 'priority', 'regexp']
    list_display = ['typename', 'active', 'priority', 'regexp']
    search_fields = ['typename']
    list_filter = ['typename', 'active']
    ordering = ['-active', 'priority', 'typename']
    actions = [action_activate, action_deactivate]
    list_per_page = 100

    def response_change(self, request, obj):
        if "_continue" in request.POST and request.POST.get("_continue", None) == "Тест регулярки":
            value = request.POST.get("_test_value", None)
            # если тестовое значение не определено, то выдаем ошибку
            if not value:
                self.message_user(request, "Тестовое значение не опредлено", level=messages.ERROR)
                return super().response_change(request, obj)

            obj = models.types(obj)
            try:
                obj.save()
                # ищем регулярку
                self.message_user(request, f"Рузультат: {', '.join(match.group() for match in regex.finditer(obj.regexp, value))}")
            except Exception as error:
                self.message_user(request, f"Ошибка при сохранении запроса {error}", level=messages.ERROR)
        return super().response_change(request, obj)


# модель настройки запросов
@admin.register(models.queries)
class queriesAdmin(admin.ModelAdmin):
    # fields = ['typename', 'active', 'name', 'cpi', 'position', 'source', 'timeout', 'group', 'datatype', 'query', 'method', 'headers', 'request_data', 'code_type', 'code']
    list_display = ['name', 'active', 'typename', 'all_sources', 'cpi', 'position', 'timeout', 'datatype', 'query']
    search_fields = ['name']
    list_filter = ['typename', 'source', 'datatype', 'active', 'cpi']
    ordering = ['-active', 'typename', 'position', 'name']
    actions = [action_activate, action_deactivate, action_cpi_on, action_cpi_off, copy_query]
    list_per_page = 100
    fieldsets = (
        (None, {
            'fields': ('typename', 'active', 'name', 'cpi', 'position', 'source', 'timeout', 'group', 'datatype', 'query'),
        }),
        ('HTTP', {
            'fields': ('method', 'headers', 'request_data', 'code_type', 'code'),
        }),
        ('Файл', {
            'fields': ('encoding', 'separator', 'columns_exists')
        })
    )

    # так либо объявить такие данные в модели
    def all_sources(self, obj):
        return "\n".join([p.source for p in obj.source.all()])
    all_sources.short_description = "Источники"

    def response_change(self, request, obj):
        if "_continue" in request.POST and request.POST.get("_continue", None) == "Тест запроса":
            value = request.POST.get("_test_value", None)
            # if test vaslue is absent, then return error message
            if not value:
                self.message_user(request, "Тестовое значение не опредлено", level=messages.ERROR)
                return super().response_change(request, obj)

            obj = models.queries(obj)
            try:
                obj.save()
                return redirect(f"/search/{obj.typename}/{obj.name}/?value={value}&nocache=1", permanent=True)
            except Exception as error:
                self.message_user(request, f"Ошибка при сохранении запроса {error}", level=messages.ERROR)
        return super().response_change(request, obj)

#     def has_add_permission(self, request, obj=None):
#         return False

#     def has_change_permission(self, request, obj=None):
#         return False

#     def has_delete_permission(self, request, obj=None):
#         return False
