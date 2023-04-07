import os
from lib.tryparse import TryParse
from lib.log import LoggingHandlers


DEFAULT_HOST = 'localhost'

# Server vesrion
SERVER_VERSION = os.environ.get('SERVER_VERSION', default="unknown")

# ERROR
HTTP_ERROR_CODE = 422

# TimeZone
TZ = os.environ.get('TZ', default='Europe/Moscow')

# SESSION
SESSION_PERIOD = TryParse.int(os.environ.get('SESSION_PERIOD'), default_value=8 * 60 * 60)

# AUTH
REMOTE_USER_HEADER = 'HTTP_X_USER'
REMOTE_USER_GROUPS_HEADER = 'HTTP_X_USER_GROUPS'
REMOTE_USER_EMAIL_HEADER = 'HTTP_X_USER_EMAIL'
REMOTE_USER_FIRSTNAME_HEADER = 'HTTP_X_USER_FIRSTNAME'
REMOTE_USER_LASTNAME_HEADER = 'HTTP_X_USER_LASTNAME'

# DATABASE
DB_HOST = os.environ.get('DB_HOST', default=DEFAULT_HOST)
DB_PORT = os.environ.get('DB_PORT', default='')
DB_NAME = os.environ.get('DB_NAME', default='JARVIS')
DB_USER = os.environ.get('DB_USER', default='sa')
DB_PASS = os.environ.get('DB_PASS', default='Mssql2017')
DB_COMMAND_TIMEOUT = TryParse.int(os.environ.get('DB_COMMAND_TIMEOUT'), default_value=60)

# REDIS
REDIS_HOST = os.environ.get('REDIS_HOST', default=DEFAULT_HOST)
REDIS_PORT = TryParse.int(os.environ.get('REDIS_PORT'), default_value=6379)
REDIS_DB_SESSIONS = TryParse.int(os.environ.get('REDIS_DB_SESSIONS'), default_value=0)
REDIS_DB_QUERIES = TryParse.int(os.environ.get('REDIS_DB_QUERIES'), default_value=1)
REDIS_DB_CACHE = TryParse.int(os.environ.get('REDIS_DB_CACHE'), default_value=2)
REDIS_CACHE_TTL = TryParse.int(os.environ.get('REDIS_CACHE_TTL'), default_value=8 * 60 * 60)

# QUERY
QUERY_PAGINATION_LIMIT = TryParse.int(os.environ.get('QUERY_PAGINATION_LIMIT'), default_value=100)
QUERY_PAGINATION_OFFSET = TryParse.int(os.environ.get('QUERY_PAGINATION_OFFSET'), default_value=0)

# TESSERACT
TESSERACT_PARAMS = os.environ.get('TESSERACT_PARAMS', default='-c tessedit_char_whitelist="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789().-_@ " ')

# KAFKA LOGGING
KAFKA = TryParse.bool(os.environ.get('KAFKA'), default_value=False)
KAFKA_HOST = os.environ.get('KAFKA_HOST', default=DEFAULT_HOST)
KAFKA_PORT: int = TryParse.int(os.environ.get('KAFKA_PORT'), default_value=9092)
KAFKA_TOPIC = os.environ.get('KAFKA_TOPIC', default="jarvis")

# Logging
# FILE, KAFKA
QUERY_LOGGING_HANDLER = TryParse.enum(os.environ.get('QUERY_LOGGING_HANDLER'), LoggingHandlers, LoggingHandlers.NO)
QUERY_LOGGING_DIR = os.environ.get('QUERY_LOGGING_DIR', default='/logs')

# Loglevel
LOGLEVEL = os.environ.get('LOGLEVEL', 'ERROR').upper()

# Sentry
SENTRY = TryParse.bool(os.environ.get('SENTRY'), default_value=False)
SENTRY_HOSTNAME = os.environ.get('SENTRY_HOSTNAME', default='unknown')
SENTRY_BACKEND = os.environ.get('SENTRY_BACKEND', default='http://examplePublicKey@localhost:9000/6')
SENTRY_FRONTEND = os.environ.get('SENTRY_FRONTEND', default='http://examplePublicKey@localhost:9000/7')
