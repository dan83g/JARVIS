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

# test cgi connection 
wait_for_port "DJANGO" "${CGI_HOST}" "${CGI_PORT}"
echo "$(date) - DJANGO is OK at "${CGI_HOST}:${CGI_PORT}


# LOGS
if [ ! -d "/logs" ]; then
    mkdir /logs
fi

# logs
if [ "${ACCESS_LOG}" = "1" ]; then
  export ACCESS_LOG="access_log /logs/nginx_access.log;"
else
  export ACCESS_LOG=""
fi

# log level
case "${LOGLEVEL}" in
  "debug"|"warn"|"error"|"crit"|"alert"|"emerg")
    export LOGLEVEL="${LOGLEVEL}"
  ;;
  *)
    export LOGLEVEL="error"
  ;;
esac

# BASIC_AUTH
if [ -n "${BASIC_AUTH}" ] && [ "${BASIC_AUTH}" = "1" ]; then  
  export BASIC_AUTH="on"
else  
  export BASIC_AUTH="off"
fi

if [ "${ERROR_LOG}" = "1" ]; then
  export ERROR_LOG="error_log /logs/nginx_error.log ${LOGLEVEL};"
else
  export ERROR_LOG=""
fi

# CACHE
if [ -n "${CACHE}" ] && [ "${CACHE}" = "1" ]; then  
  export CACHE="include cache.conf;"
else  
  export CACHE=""
fi

# cache size
if [ -n "${CACHE_SIZE}" ]; then  
  export CACHE_SIZE=${CACHE_SIZE}
else  
  export CACHE_SIZE="1"
fi

# cache period
if [ -n "${CACHE_PERIOD}" ] && [ "${CACHE_PERIOD}" -eq "${CACHE_PERIOD}" ] 2>/dev/null; then
  export CACHE_PERIOD=${CACHE_PERIOD}
else  
  export CACHE_PERIOD="30"
fi

# cache error period
if [ -n "${CACHE_ERROR_PERIOD}" ] && [ "${CACHE_ERROR_PERIOD}" -eq "${CACHE_ERROR_PERIOD}" ] 2>/dev/null; then
  export CACHE_ERROR_PERIOD=${CACHE_ERROR_PERIOD}
else
  export CACHE_ERROR_PERIOD="5"  
fi

# create directory
if ! [ -d /cache ]; then
  mkdir /cache && chmod -R 777 /cache && echo "$(date) - CACHE-DIRECTORY (/cache) has been created"
fi

if [ -n "${DOMAIN}" ]; then 
  export DOMAIN_LOWER=$( echo ${DOMAIN} | awk '{ print tolower($0) }' )
else  
  export DOMAIN_LOWER=""
fi

# KDC
if ! [ -n "${KDC}" ]; then  
  export KDC="dc"
fi

# prepare krb5.conf
envsubst "$(env | sed -e 's/=.*//' -e 's/^/\$/g')" < /krb5.conf.template > /etc/krb5.conf

# prepare cache template
envsubst "$(env | sed -e 's/=.*//' -e 's/^/\$/g')" < /etc/nginx/templates/include/cache.conf > /etc/nginx/cache.conf &&

# prepare settings file
envsubst "$(env | sed -e 's/=.*//' -e 's/^/\$/g')" < /etc/nginx/templates/main/"${TEMPLATE}".conf > /etc/nginx/nginx.conf &&

# launch NGINX
nginx -g "daemon off;"