#!/usr/bin/env /bin/sh

# check TRY_CONNECTIONS
if [ -n "${TRY_CONNECTIONS}" ] && [ "${TRY_CONNECTIONS}" -eq "${TRY_CONNECTIONS}" ] 2>/dev/null; then
  TRY_CONNECT=${TRY_CONNECTIONS}
else
  TRY_CONNECT="20"
fi

# try port
wait_for_port() {
  local name="$1" host="$2" port="$3"
  local j=0
  while ! nc -z "$host" "$port" >/dev/null 2>&1 < /dev/null; do
    j=$((j+1))
    if [ $j -ge $TRY_CONNECT ]; then
      echo >&2 "$(date) - $host:$port still not reachable, giving up"
      exit 1
    fi
    echo "$(date) - waiting for $name... $j/$TRY_CONNECT"
    sleep 5
  done
}

# GUNICORN
run_gunicorn() {
    local host="$1" port="$2" project="$3"    
    gunicorn $project.wsgi:application --bind $host:$port --workers 8 --timeout=500 --max-requests=1000
}

# CELERY
run_celery() {
    local project="$1"
    echo "$(date) - CELERY WORKERS AND CELERY BEAT are starting"
    [ -e /opt/site/django_project/celerybeat.pid ] && unlink /opt/site/django_project/celerybeat.pid && echo "$(date) - celerybeat.pid has been deleted" 
    celery -A "$project" worker -l info &
    celery -A "$project" beat -l info -S django
}

# FLOWER
run_flower() {
    local host="$1" port="$2" redis_host="$3" redis_port="$4" redis_db="$5" project="$6"
    echo "$(date) - FLOWER is starting at "$host":"$port" with redis://"$redis_host":"$redis_port"/"$redis_db""
    celery flower -A "$project" --address="$host" --port="$port" --url_prefix=flower --broker=redis://"$redis_host":"$redis_port"/"$redis_db"
}

# WAITING REDIS
wait_for_port "REDIS" "${REDIS_HOST}" "${REDIS_PORT}"
echo "$(date) - REDIS is OK at "${REDIS_HOST}:${REDIS_PORT}

# WAITING MSSQL
wait_for_port "MSSQL" "${DB_HOST}" "${DB_PORT}"
echo "$(date) - MSSQL is OK at "${DB_HOST}:${DB_PORT}

# install PYTHON packages
if [ -f "/requirements.txt" ]; then
    $(command -v pip) install --user -r /requirements.txt
fi

# execute custom sql migrations
cat ./migrations.sql | python /opt/site/django_project/manage.py dbshell

# migrate current database
echo "$(date) - Aplying database migrations"
python /opt/site/django_project/manage.py migrate

# CELERY
if [ "${CELERY}" = "1" ]; then
  run_celery "${DJANGO_PROJECT}" &
fi

# FLOWER
if [ "${CELERY}" = "1" ] && [ "${FLOWER}"=="1" ]; then  
  run_flower "${FLOWER_HOST}" "${FLOWER_PORT}" "${REDIS_HOST}" "${REDIS_PORT}" "${REDIS_DB_CELERY}" "${DJANGO_PROJECT}" &
fi

# GUNICORN
run_gunicorn "${GUNICORN_HOST}" "${GUNICORN_PORT}" "${DJANGO_PROJECT}"