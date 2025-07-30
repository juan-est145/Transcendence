FROM node:24-alpine3.21 AS dev

WORKDIR /app

RUN apk update && apk upgrade && apk add --no-cache sqlite && mkdir -p ./db && touch ./db/Database.db

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8080

ENTRYPOINT [ "npm" ]

CMD ["run", "dev"]


FROM node:24-alpine3.21 AS prod

WORKDIR /app

RUN apk update && apk upgrade && apk add --no-cache sqlite && mkdir -p ./db && touch ./db/Database.db && chown -R node:node ./db

COPY package*.json ./
RUN npm install

COPY . .

RUN chown -R node:node /app

EXPOSE 8080

USER node

ENTRYPOINT [ "npm" ]

CMD ["run", "start"]