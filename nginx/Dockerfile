FROM alpine:3.23 AS ssl

WORKDIR /certs

RUN mkdir -p /certs/ssl/private && mkdir -p /certs/ssl/certs && \
	apk upgrade --no-cache && apk add --no-cache openssl && \
	openssl genrsa -out /certs/ssl/private/ca.key 2048 && \
	openssl req -x509 -new -nodes -key /certs/ssl/private/ca.key -sha256 -days 730 \
	-out /certs/ssl/certs/ca.crt \
	-subj "/C=ES/L=Málaga/O=42Malaga/OU=student/CN=DevCA" && \
	# Generate server key and CSR
	openssl genrsa -out /certs/ssl/private/cert.key 2048 && \
	openssl req -new -key /certs/ssl/private/cert.key -out /certs/ssl/private/cert.csr \
	-subj "/C=ES/L=Málaga/O=42Malaga/OU=student/CN=ponggame.com" && \
	# Sign server certificate with CA
	openssl x509 -req -in /certs/ssl/private/cert.csr -CA /certs/ssl/certs/ca.crt -CAkey /certs/ssl/private/ca.key -CAcreateserial \
	-out /certs/ssl/certs/selfsigned.crt -days 730 -sha256

FROM nginx:alpine3.22-slim AS dev

COPY --from=ssl /certs/ssl/private/cert.key /etc/ssl/private/cert.key
COPY --from=ssl /certs/ssl/certs/selfsigned.crt /etc/ssl/certs/selfsigned.crt

# RUN apk update && apk upgrade && apk add --no-cache openssl && \
# 	# Generate CA key and certificate
# 	openssl genrsa -out /etc/ssl/private/ca.key 2048 && \
# 	openssl req -x509 -new -nodes -key /etc/ssl/private/ca.key -sha256 -days 730 \
# 	-out /etc/ssl/certs/ca.crt \
# 	-subj "/C=ES/L=Málaga/O=42Malaga/OU=student/CN=DevCA" && \
# 	# Generate server key and CSR
# 	openssl genrsa -out /etc/ssl/private/cert.key 2048 && \
# 	openssl req -new -key /etc/ssl/private/cert.key -out /etc/ssl/private/cert.csr \
# 	-subj "/C=ES/L=Málaga/O=42Malaga/OU=student/CN=ponggame.com" && \
# 	# Sign server certificate with CA
# 	openssl x509 -req -in /etc/ssl/private/cert.csr -CA /etc/ssl/certs/ca.crt -CAkey /etc/ssl/private/ca.key -CAcreateserial \
# 	-out /etc/ssl/certs/selfsigned.crt -days 730 -sha256

COPY conf/nginx.conf /etc/nginx/nginx.conf
COPY conf/proxy_params.conf /etc/nginx/proxy_params.conf

EXPOSE 4343

ENTRYPOINT [ "nginx" ]

CMD [ "-g", "daemon off;" ]


FROM nginx:alpine3.22-slim AS prod

# This line will need to be deleted when we have a domain and proper certificates
COPY --from=ssl /certs/ssl/private/cert.key /etc/ssl/private/cert.key
COPY --from=ssl /certs/ssl/certs/selfsigned.crt /etc/ssl/certs/selfsigned.crt

COPY conf/nginx.conf /etc/nginx/nginx.conf
COPY conf/proxy_params.conf /etc/nginx/proxy_params.conf

RUN chown -R nginx:nginx /var/cache/nginx && chown -R nginx:nginx /run && \
	chown -R nginx:nginx /etc/nginx && chown -R nginx:nginx /var/log/nginx && \
	chown -R nginx:nginx /etc/ssl/private && \
	chown -R nginx:nginx /etc/ssl/certs

EXPOSE 4343

USER nginx

ENTRYPOINT [ "nginx" ]

CMD [ "-g", "daemon off;" ]