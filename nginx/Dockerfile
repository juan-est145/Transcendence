FROM nginx:alpine3.22-slim AS dev

COPY conf/nginx.conf /etc/nginx/nginx.conf
COPY conf/proxy_params /etc/nginx/proxy_params

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