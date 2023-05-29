ifneq (,$(wildcard ./.env))
    include .env
    export
endif

.PHONY: test

start:
	docker-compose --env-file .env up -d
	@echo "Visit http://localhost:$(APP_PORT)"

stop:
	docker compose --env-file .env stop

down:
	docker compose --env-file .env down

db-migrations:
	docker exec -it crawler-app npm run migrations:up

init:
	make start
	make db-migrations

eslint:
	docker exec -it crawler-app npm run eslint

eslint.fix:
	docker exec -it crawler-app npm run eslint:fix

tests:
	@echo "not implemented" >&2

qa:
	@echo "not implemented" >&2

coverage:
	@echo "not implemented" >&2
