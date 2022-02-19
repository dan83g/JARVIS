FROM python:3.7.12-buster

# install drivers
RUN apt-get update -qq \    
    # install curl
	&& apt-get install -yq --no-install-recommends curl apt-transport-https\
    && curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - \
    && curl https://packages.microsoft.com/config/debian/10/prod.list > /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update -qq \
    && export ACCEPT_EULA=Y \
	&& apt-get install -yq --no-install-recommends \
    unixodbc unixodbc-dev \
    # mssql    
    msodbcsql17 \
    # postgresql
    odbc-postgresql \
    # mysql
    # mysql-community-client-plugins \
    # mysql-connector-odbc \
    # sqllite
    libsqliteodbc \
    # clear build
    && rm -rf /var/lib/apt/lists/* \
    # && rm -rf /tmp/*
    && groupadd -r docker && useradd -r -g docker dockeruser

USER dockeruser
COPY ./django_project /opt/site/django_project
COPY ./entrypoint_django.sh /entrypoint.sh
# COPY ./pip.conf /etc/pip.conf
COPY ./requirements.txt /requirements.txt
RUN $(command -v pip) install --user -r /requirements.txt \
    && chmod +x /entrypoint.sh
# аргумент, который передается в docker build --build-arg SERVER_VERSION=1 --build-arg SERVER_VERSION=2
# после равно - значение по умолчанию
ARG SERVER_VERSION=unknown
ENV SERVER_VERSION=${SERVER_VERSION}
EXPOSE 80 5555
WORKDIR /opt/site/django_project
ENTRYPOINT ["/entrypoint.sh"]
# для alpine ENTRYPOINT ["sh","/entrypoint.sh"]