PROD-FILE=docker-compose.yml
DEV-FILE=docker-compose-dev.yml


all:
	docker compose -f $(PROD-FILE) up --build -d

npm-api:
	npm install --prefix API/

npm-mvc:
	npm install --prefix MVC/

dev: npm-api npm-mvc
	docker compose -f $(DEV-FILE) up --build -d

clean:
	docker compose -f $(PROD-FILE) down || docker compose -f $(DEV-FILE) down

.PHONY: all dev clean npm-api npm-mvc