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

__all__ = tuple(k for k in locals() if not k.startswith("_"))
