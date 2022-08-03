import os
import pytz
import logging
import logging.config
import sentry_sdk
from sentry_sdk.integrations.logging import LoggingIntegration
# from sentry_sdk.integrations.django import DjangoIntegration

from . import enums

# DEBUG
# DEBUG404 = True
DEBUG = True

# Hosts filter
ALLOWED_HOSTS = ["*"]

# Base directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATIC_ROOT = os.path.join(
    os.path.dirname(os.path.dirname(BASE_DIR)),
    "static")
# Static Files directories
STATICFILES_DIRS = [
    os.path.join(os.path.dirname(BASE_DIR), "static"),
]
STATIC_URL = '/static/'
ROOT_URLCONF = 'JARVIS.urls'

# Internationalization
LANGUAGE_CODE = 'ru-RU'
TIME_ZONE = enums.TZ
TZ = pytz.timezone(TIME_ZONE)
USE_I18N = True
USE_L10N = True
USE_TZ = True

# Installed apps
INSTALLED_APPS = [
    'jet',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'dtsearch',
    'map',
    'search',
    'security',
]

# ADMIN JET
JET_SIDE_MENU_COMPACT = True
JET_THEMES = [
    {
        'theme': 'default',
        'color': '#47bac1',
        'title': 'Default'
    },
    {
        'theme': 'green',
        'color': '#44b78b',
        'title': 'Green'
    },
    {
        'theme': 'light-green',
        'color': '#2faa60',
        'title': 'Light Green'
    },
    {
        'theme': 'light-violet',
        'color': '#a464c4',
        'title': 'Light Violet'
    },
    {
        'theme': 'light-blue',
        'color': '#5EADDE',
        'title': 'Light Blue'
    },
    {
        'theme': 'light-gray',
        'color': '#222',
        'title': 'Light Gray'
    }
]

# Redis-cache
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": f"redis://{enums.REDIS_HOST}:{enums.REDIS_PORT}/{enums.REDIS_DB_SESSIONS}",
        "OPTIONS": {
            "SOCKET_CONNECT_TIMEOUT": 5,
            "SOCKET_TIMEOUT": 5,
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
            "SERIALIZER": "django_redis.serializers.json.JSONSerializer",
            "PASSWORD": None
        }
    }
}

# Session
# AUTH_USER_MODEL = 'security.AuthUser'
SECRET_KEY = 'JARVIS'
SESSION_COOKIE_NAME = 'Jarvis-Session-Id'
SESSION_EXPIRE_AT_BROWSER_CLOSE = False
# Disable access to cookies from JavaScript
SESSION_COOKIE_HTTPONLY = True
# Require HTTPS only
# SESSION_COOKIE_SECURE = True
# Session enginebackend
SESSION_ENGINE = "django.contrib.sessions.backends.cache"
SESSION_CACHE_ALIAS = "default"

# Middleware
MIDDLEWARE = [
    'JARVIS.middleware.vary.RemoveVaryHeader',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    # "corsheaders.middleware.CorsMiddleware",
    'django.middleware.common.CommonMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'JARVIS.middleware.auth.HttpRemoteUserMiddleware',
    # 'JARVIS.middleware.auth.BasicAuthMiddleware',
    'JARVIS.middleware.sentry.SentryMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Databases
DATABASE_CONNECTION_POOLING = False
DATABASES = {
    'default': {
        'ENGINE': 'mssql',
        'NAME': enums.DB_NAME,
        'USER': enums.DB_USER,
        'PASSWORD': enums.DB_PASS,
        'HOST': enums.DB_HOST,
        'PORT': enums.DB_PORT,
        'COMMAND_TIMEOUT': enums.DB_COMMAND_TIMEOUT,
        'OPTIONS': {
            'driver': 'ODBC Driver 17 for SQL Server',
            'isolation_level': 'READ UNCOMMITTED',
            # 'unicode_results': True,
            # 'MARS_Connection' : True,
            # 'driver_supports_utf8' : True,
        }
    }
}

# Templates
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            os.path.join(BASE_DIR, 'templates')
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

AUTHENTICATION_BACKENDS = [
    'JARVIS.middleware.auth.HttpRemoteUserBackend',
    # 'django_remote_auth_ldap.backend.RemoteUserLDAPBackend',
    'django.contrib.auth.backends.ModelBackend',
]

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# DJANGO SENTRY
# sentry_sdk.init(
#     dsn=enums.SENTRY_DSN,
#     integrations=[DjangoIntegration()],
#     traces_sample_rate=1.0,
#     send_default_pii=True
# )

# DJANGO LOGGING
if enums.SENTRY == 1:
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
