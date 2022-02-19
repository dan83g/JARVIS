from __future__ import absolute_import, unicode_literals
from .celery import app as celery_app
import os

if os.environ.get('CELERY', default='0')=='1':
    __all__ = ('celery_app')