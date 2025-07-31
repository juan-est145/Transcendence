FROM nginx:alpine3.22-slim AS dev

RUN apk update && apk upgrade && apk add --no-cache openssl && openssl req -x509 -nodes -days 730 -newkey rsa:2048 \
-keyout /etc/ssl/private/cert.key -out /etc/ssl/certs/selfsigned.crt -subj "/C=ES/L=Málaga/O=42Malaga/OU=student/CN=localhost"

COPY conf/nginx.conf /etc/nginx/nginx.conf
COPY conf/proxy_params /etc/nginx/proxy_params

EXPOSE 4343

ENTRYPOINT [ "nginx" ]

CMD [ "-g", "daemon off;" ]


FROM nginx:alpine3.22-slim AS prod

COPY conf/nginx.conf /etc/nginx/nginx.conf
COPY conf/proxy_params /etc/nginx/proxy_params

RUN chown -R nginx:nginx /var/cache/nginx && chown -R nginx:nginx /run\
&& chown -R nginx:nginx /etc/nginx && chown -R nginx:nginx /var/log/nginx

USER nginx

ENTRYPOINT [ "nginx" ]

CMD [ "-g", "daemon off;" ]