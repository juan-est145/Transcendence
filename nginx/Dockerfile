FROM nginx:alpine3.22-slim

COPY conf/nginx.conf /etc/nginx/nginx.conf
COPY conf/proxy_params /etc/nginx/proxy_params

#USER nginx

ENTRYPOINT [ "nginx" ]

CMD [ "-g", "daemon off;" ]