import os


def to_bool(value: str) -> bool:
    return True if value.lower() in ('1', 'true', 'on', 'yes') else False


DEFAULT_HOST = 'localhost'

# TimeZone
TZ = os.environ.get('TZ', default='Europe/Moscow')

# Server vesrion
SERVER_VERSION = os.environ.get('SERVER_VERSION', default="unknown")

# Session
SESSION_PERIOD = int(os.environ.get('SESSION_PERIOD', default=8 * 60 * 60))

# Authentification
REMOTE_USER_HEADER = 'HTTP_X_USER'
REMOTE_USER_GROUPS_HEADER = 'HTTP_X_USER_GROUPS'
REMOTE_USER_EMAIL_HEADER = 'HTTP_X_USER_EMAIL'
REMOTE_USER_FIRSTNAME_HEADER = 'HTTP_X_USER_FIRSTNAME'
REMOTE_USER_LASTNAME_HEADER = 'HTTP_X_USER_LASTNAME'

# DataBase
DB_HOST = os.environ.get('DB_HOST', default=DEFAULT_HOST)
DB_PORT = os.environ.get('DB_PORT', default='')
DB_NAME = os.environ.get('DB_NAME', default='JARVIS')
DB_USER = os.environ.get('DB_USER', default='sa')
DB_PASS = os.environ.get('DB_PASS', default='Mssql2017')
DB_COMMAND_TIMEOUT = os.environ.get('DB_COMMAND_TIMEOUT', default=60)

# Redis
REDIS_HOST = os.environ.get('REDIS_HOST', default=DEFAULT_HOST)
REDIS_PORT = os.environ.get('REDIS_PORT', default=6379)
REDIS_DB_SESSIONS = int(os.environ.get('REDIS_DB_SESSIONS', default=0))
REDIS_CACHE_TTL = os.environ.get('REDIS_CACHE_TTL', default=8 * 60 * 60)

# Kafka query logging
KAFKA = to_bool(os.environ.get('KAFKA', default='0'))
KAFKA_HOST = os.environ.get('KAFKA_HOST', default=DEFAULT_HOST)
KAFKA_PORT: int = int(os.environ.get('KAFKA_PORT', default=9092))
KAFKA_TOPIC = os.environ.get('KAFKA_TOPIC', default="jarvis")

# Log filename
QUERY_LOGGING = to_bool(os.environ.get('QUERY_LOGGING', default='0'))
QUERY_LOGGING_DIR = os.environ.get('QUERY_LOGGING_DIR', default='/logs')

# Loglevel
LOGLEVEL = os.environ.get('LOGLEVEL', 'ERROR').upper()

# Sentry
SENTRY = int(os.environ.get('SENTRY', default=0))
SENTRY_HOSTNAME = os.environ.get('SENTRY_HOSTNAME', default='unknown')
SENTRY_BACKEND = os.environ.get('SENTRY_BACKEND', default='http://examplePublicKey@localhost:9000/6')
SENTRY_FRONTEND = os.environ.get('SENTRY_FRONTEND', default='http://examplePublicKey@localhost:9000/7')
