from __future__ import absolute_import, unicode_literals
import os
from celery import Celery

# Настройка необходима на WINDOWS-машинах
os.environ.setdefault('FORKED_BY_MULTIPROCESSING', '1')

broker = 'redis://{host}:{port}/{db}'.format(
    host=os.environ.get('REDIS_HOST', default='localhost'),
    port=os.environ.get('REDIS_PORT', default=6379),
    db=os.environ.get('REDIS_DB_CELERY', default=1))

project = os.environ.get('DJANGO_PROJECT', default='web_project')

# экземпляр класса celery, localhost или redis-контейнер
app = Celery(project, broker=broker, backend=broker)

# принудительно добавить файл с tasks  broker=,include=['proj.tasks'])

app.config_from_object('django.conf:settings', namespace='CELERY')

# single conf
# app.conf.timezone = 'Europe/Moscow'

# many config
app.conf.update(
    task_serializer='json',
    accept_content=['json'],  # Ignore other content
    result_serializer='json',
    timezone='Europe/Moscow',
    enable_utc=False,
    maxinterval=1,
)

# Обнаруживает все таски во всех приложениях
app.autodiscover_tasks()
