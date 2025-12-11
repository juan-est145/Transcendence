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


FROM node:24.5-trixie-slim AS dev

WORKDIR /app

COPY --from=ssl /certs/ssl/private/cert.key /etc/ssl/private/cert.key
COPY --from=ssl /certs/ssl/certs/selfsigned.crt /etc/ssl/certs/selfsigned.crt

RUN apt update && apt upgrade -y && apt install curl -y && \ 
	mkdir -p ./db && touch ./db/Sessions.db

EXPOSE 4343
EXPOSE 9320

ENTRYPOINT [ "npm" ]

CMD ["run", "dev"]

FROM node:24.5-trixie-slim AS prod

WORKDIR /app

COPY --from=ssl /certs/ssl/private/cert.key /etc/ssl/private/cert.key
COPY --from=ssl /certs/ssl/certs/selfsigned.crt /etc/ssl/certs/selfsigned.crt

COPY package*.json ./

RUN apt update && apt upgrade -y && apt install curl -y && \ 
	mkdir -p ./db && touch ./db/Sessions.db && npm install

COPY . .

RUN chown -R node:node /app && chown -R node:node /etc/ssl/private && chown -R node:node /etc/ssl/certs

EXPOSE 4343

USER node

ENTRYPOINT [ "npm" ]

CMD ["run", "start"]