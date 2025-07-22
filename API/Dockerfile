FROM node:24-alpine3.21

WORKDIR /app

RUN apk update && apk upgrade && apk add --no-cache sqlite && mkdir -p ./db && touch ./db/Database.db

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

ENTRYPOINT [ "npm" ]

CMD ["run", "dev"]