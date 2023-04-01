FROM 68publishers/php:8.1-cli-dev-1.0.0 AS worker

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

RUN apk add --update --no-cache nodejs npm

RUN apk add --update --no-cache --virtual \
    .build-deps \
    udev \
    ttf-opensans \
    chromium \
    ca-certificates

RUN addgroup -S app && adduser -S -g app -G app app \
    && mkdir -p /home/app/Downloads \
    && chown -R app:app /home/app \
    && chown -R app:app /var/www/html

USER app

RUN node -v
RUN npm -v
