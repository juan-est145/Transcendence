FROM node:24-alpine3.21 AS dev

WORKDIR /app

COPY package*.json ./
RUN apk update && apk upgrade && apk add --no-cache openssl && openssl req -x509 -nodes -days 730 -newkey rsa:2048 \
-keyout /etc/ssl/private/cert.key -out /etc/ssl/certs/selfsigned.crt -subj "/C=ES/L=Málaga/O=42Malaga/OU=student/CN=localhost" && npm install

COPY . .

EXPOSE 4343

ENTRYPOINT [ "npm" ]

CMD ["run", "dev"]

FROM node:24-alpine3.21 AS prod

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN chown -R node:node /app

EXPOSE 4343

USER node

ENTRYPOINT [ "npm" ]

CMD ["run", "dev"]