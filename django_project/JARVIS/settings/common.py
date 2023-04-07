import os
from JARVIS import enums

# DEBUG
# DEBUG404 = True
DEBUG = True

# Hosts filter
ALLOWED_HOSTS = ["*"]

X_FRAME_OPTIONS = 'ALLOWALL'

# Base directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATIC_ROOT = os.path.join(
    os.path.dirname(os.path.dirname(BASE_DIR)),
    "static")

# Static Files directories
STATICFILES_DIRS = [
    os.path.join(os.path.join(os.path.dirname(os.path.dirname(BASE_DIR)), "build"), "static")
]
STATIC_URL = '/static/'
ROOT_URLCONF = 'JARVIS.urls'

# Installed apps
INSTALLED_APPS = [
    'jet',
    'ninja',
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

DEFAULT_AUTO_FIELD = 'django.db.models.AutoField'
# DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

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

MIDDLEWARE = [
    'JARVIS.middleware.vary.RemoveVaryHeader',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'JARVIS.middleware.auth.HttpRemoteUserMiddleware',
    # 'JARVIS.middleware.auth.BasicAuthMiddleware',
    'JARVIS.middleware.sentry.SentryMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            os.path.join(os.path.dirname(BASE_DIR), 'templates'),
            os.path.join(os.path.dirname(os.path.dirname(BASE_DIR)), "build")
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
