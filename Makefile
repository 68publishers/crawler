.PHONY: test performance

start:
	docker compose up -d
	@echo "visit http://localhost:8888"

stop:
	docker compose stop

down:
	docker compose down

restart:
	make stop
	make start

cache-clear:
	rm -rf var/cache/*
	rm -rf var/log/*

install-composer:
	docker exec -it cmp-crawler-worker composer install --no-interaction --no-ansi --prefer-dist --no-progress --optimize-autoloader

install-npm:
	docker exec -it cmp-crawler-worker npm install

init:
	make stop
	make start
	make cache-clear
	make install-composer
	make install-npm

tests:
	@echo "not implemented" >&2

qa:
	@echo "not implemented" >&2

#stan:
#	docker exec -it cmp-crawler-worker vendor/bin/phpstan analyse

#cs:
#	docker exec -it cmp-crawler-worker vendor/bin/php-cs-fixer fix -v

coverage:
	@echo "not implemented" >&2
