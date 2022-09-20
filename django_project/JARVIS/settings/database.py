from JARVIS import enums


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

__all__ = [
    'DATABASE_CONNECTION_POOLING',
    'DATABASES'
]
