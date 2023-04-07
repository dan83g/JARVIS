import logging
import logging.config
import sentry_sdk
from sentry_sdk.integrations.logging import LoggingIntegration
from JARVIS import enums

# DJANGO SENTRY
# sentry_sdk.init(
#     dsn=enums.SENTRY_DSN,
#     integrations=[DjangoIntegration()],
#     traces_sample_rate=1.0,
#     send_default_pii=True
# )

# DJANGO LOGGING
if enums.SENTRY:
    sentry_logging = LoggingIntegration(
        level=logging.INFO,
        event_level=logging.ERROR
    )
    sentry_sdk.init(
        dsn=enums.SENTRY_BACKEND,
        integrations=[sentry_logging],
        server_name=enums.SENTRY_HOSTNAME
    )

# LOGGING SETTINGS
logging.config.dictConfig({
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'console': {
            'format': '%(asctime)s %(name)-12s %(levelname)-8s %(message)s'
        },
        'file': {
            'format': '%(asctime)s %(name)-12s %(levelname)-8s %(message)s'
        }
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'console'
        },
        'sentry': {
            'level': enums.LOGLEVEL,
            'class': 'sentry_sdk.integrations.logging.SentryHandler',
        }
        # 'file': {
        #     'level': 'DEBUG',
        #     'class': 'logging.FileHandler',
        #     'formatter': 'file',
        #     'filename': '/tmp/debug.log'
        # },
    },
    'loggers': {
        '': {
            # отображать ошибки не меньше чем ERROR ( DEBUG, INFO, WARNING, ERROR, CRITICAL ) NOTSET - не выводить данные
            'level': enums.LOGLEVEL,
            'handlers': ['console', 'sentry'],
            # 'handlers': ['console', 'file', 'sentry']
        },
        'JARVIS': {
            'level': 'DEBUG',
            'handlers': ['console'],
            # чтобы не дублировать в консоли
            'propagate': False,
        }
        # выключить из лога определенный модуль
        # 'search.views': {
        #     'level': 'NOTSET',
        #     'propagate': False,
        # },
        # "django_auth_ldap": {"level": "DEBUG", "handlers": ["console"]},
    }
})


# import logging
# logger = logging.getLogger(__name__)
# logger.warning("Your log message is here")
# logger.info("The value of var is %s", var)
# logger.warning("Your log message is here")
# logger.critical

# Одна из хитростей в конфигурации Django по умолчанию - регистрация запросов с помощью runserver. Переопределив конфигурацию Django, мы потеряем ее, но ее достаточно легко добавить обратно:
# from django.utils.log import DEFAULT_LOGGING
# logging.config.dictConfig({
#     # ...
#     'formatters': {
#         # ...
#         'django.server': DEFAULT_LOGGING['formatters']['django.server'],
#     },
#     'handlers': {
#         # ...
#         'django.server': DEFAULT_LOGGING['handlers']['django.server'],
#     },
#     'loggers': {
#         # ...
#         'django.server': DEFAULT_LOGGING['loggers']['django.server'],
#     },
# })
