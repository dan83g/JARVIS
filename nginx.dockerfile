FROM nginx_sso:1.21.3
COPY ./static /opt/site/static
COPY ./nginx /etc/nginx
COPY ./entrypoint_nginx.sh /entrypoint.sh
COPY ./krb5.conf.template /krb5.conf.template
RUN chmod +x /entrypoint.sh
VOLUME ["/etc/nginx/keytab"]
VOLUME ["/logs"]
VOLUME ["/media"]
WORKDIR /etc/nginx
ENTRYPOINT ["/entrypoint.sh"]