FROM node:24-alpine3.21 AS dev

WORKDIR /app

RUN apk update && apk upgrade && apk add --no-cache sqlite openssl && mkdir -p ./db && touch ./db/Database.db && \
openssl req -x509 -nodes -days 730 -newkey rsa:2048 \
-keyout /etc/ssl/private/cert.key -out /etc/ssl/certs/selfsigned.crt -subj "/C=ES/L=Málaga/O=42Malaga/OU=student/CN=api"

EXPOSE 4343

ENTRYPOINT [ "npm" ]

CMD ["run", "dev"]


FROM node:24-alpine3.21 AS prod

WORKDIR /app

RUN apk update && apk upgrade && apk add --no-cache sqlite openssl && mkdir -p ./db && touch ./db/Database.db && chown -R node:node ./db && \
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