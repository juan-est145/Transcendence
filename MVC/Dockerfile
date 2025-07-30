FROM node:24-alpine3.21 AS dev

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

ENTRYPOINT [ "npm" ]

CMD ["run", "dev"]

FROM node:24-alpine3.21 AS prod

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN chown -R node:node /app

EXPOSE 3000

USER node

ENTRYPOINT [ "npm" ]

CMD ["run", "dev"]