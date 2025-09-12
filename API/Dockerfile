FROM node:24-alpine3.21 AS dev

WORKDIR /app

RUN apk update && apk upgrade && apk add --no-cache openssl curl && mkdir -p ./db && touch ./db/Database.db && \
	# Generate CA key and certificate
	openssl genrsa -out /etc/ssl/private/ca.key 2048 && \
	openssl req -x509 -new -nodes -key /etc/ssl/private/ca.key -sha256 -days 730 \
	-out /etc/ssl/certs/ca.crt \
	-subj "/C=ES/L=Málaga/O=42Malaga/OU=student/CN=DevCA" && \
	# Generate server key and CSR
	openssl genrsa -out /etc/ssl/private/cert.key 2048 && \
	openssl req -new -key /etc/ssl/private/cert.key -out /etc/ssl/private/cert.csr \
	-subj "/C=ES/L=Málaga/O=42Malaga/OU=student/CN=api" && \
	# Sign server certificate with CA
	openssl x509 -req -in /etc/ssl/private/cert.csr -CA /etc/ssl/certs/ca.crt -CAkey /etc/ssl/private/ca.key -CAcreateserial \
	-out /etc/ssl/certs/selfsigned.crt -days 730 -sha256
EXPOSE 4343
EXPOSE 9320

ENTRYPOINT [ "npm" ]

CMD ["run", "dev"]


FROM node:24-alpine3.21 AS prod

WORKDIR /app

RUN apk update && apk upgrade && apk add --no-cache openssl curl && mkdir -p ./db && touch ./db/Database.db && chown -R node:node ./db && \
	openssl req -x509 -nodes -days 730 -newkey rsa:2048 \
	-keyout /etc/ssl/private/cert.key -out /etc/ssl/certs/selfsigned.crt -subj "/C=ES/L=Málaga/O=42Malaga/OU=student/CN=api"

COPY package*.json ./

RUN npm install

COPY . .

RUN chown -R node:node /app && chown -R node:node /etc/ssl/private && chown -R node:node /etc/ssl/certs

EXPOSE 4343

USER node

ENTRYPOINT [ "npm" ]

CMD ["run", "start"]