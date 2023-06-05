FROM node:20.2.0-alpine3.17 as base

MAINTAINER support@68publishers.io

WORKDIR /app

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

ENV APP_PORT=3000
ENV CRAWLEE_STORAGE_DIR=./var/crawlee
ENV CHROME_PATH=/usr/bin/chromium-browser
ENV WORKER_PROCESSES=5

RUN apk --no-cache -U upgrade
RUN apk add --update --no-cache --virtual \
    .build-deps \
    udev \
    ttf-opensans \
    chromium \
    ca-certificates

COPY package*.json ./
COPY . .

EXPOSE 3000

FROM base as dev

ENV NODE_ENV=development

RUN chown -R node:node /app

USER node

RUN npm i

ENTRYPOINT ["npm", "run", "dev"]

FROM base as prod

ENV NODE_ENV=production

COPY process.yml ./
RUN npm i -g pm2
RUN chown -R node:node /app

USER node

RUN npm ci --omit=dev

ENTRYPOINT ["pm2-runtime", "./process.yml"]
