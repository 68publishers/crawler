start:
	docker compose up -d
	@echo "Visit http://localhost:3000"

stop:
	docker compose stop

down:
	docker compose down

init:
	make start

eslint:
	docker exec -it crawler-app npm run eslint

eslint.fix:
	docker exec -it crawler-app npm run eslint:fix

.PHONY: tests
tests:
	@echo "not implemented" >&2

qa:
	@echo "not implemented" >&2

coverage:
	@echo "not implemented" >&2
