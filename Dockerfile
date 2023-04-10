FROM node:19.8.1-alpine3.17

WORKDIR /app

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

RUN apk add --update --no-cache --virtual \
    .build-deps \
    udev \
    ttf-opensans \
    chromium \
    ca-certificates

COPY package*.json ./

RUN npm install

COPY . .
COPY ./.docker/node/start-node.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/start-node.sh

RUN addgroup -S app && adduser -S -g app -G app app \
    && mkdir -p /home/app/Downloads \
    && chown -R app:app /home/app \
    && chown -R app:app /app

USER app

CMD ["start-node.sh"]
