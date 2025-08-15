PROD-FILE=docker-compose.yml
DEV-FILE=docker-compose-dev.yml


all:
	docker compose -f $(PROD-FILE) up --build -d

npm-api:
	npm install --prefix API/

npm-mvc:
	npm install --prefix MVC/

dev-db:
	mkdir -p ./API/db && touch ./API/db/Database.db && mkdir -p ./MVC/db && touch ./MVC/db/Sessions.db

dev: npm-api npm-mvc dev-db
	docker compose -f $(DEV-FILE) up --build -d

clean:
	docker compose -f $(PROD-FILE) down || docker compose -f $(DEV-FILE) down

.PHONY: all dev clean npm-api npm-mvc