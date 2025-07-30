PROD-FILE=docker-compose.yml
DEV-FILE=docker-compose-dev.yml

all:
	docker compose -f $(PROD-FILE) up --build -d

dev:
	docker compose -f $(DEV-FILE) up --build -d

clean:
	docker compose -f $(PROD-FILE) down || docker compose -f $(DEV-FILE) down