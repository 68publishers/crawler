FROM node:20.2.0-alpine3.18 as base

MAINTAINER support@68publishers.io

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

ENV APP_PORT=3000
ENV CRAWLEE_STORAGE_DIR=./var/crawlee
ENV CHROME_PATH=/usr/bin/chromium-browser
ENV WORKER_PROCESSES=5
ENV SENTRY_SERVER_NAME=crawler

RUN mkdir -p /app
RUN mkdir -p /home/node
RUN chown -R node:node /app && chmod -R 770 /app
RUN chown -R node:node /home/node
WORKDIR /app

COPY --chown=node:node package*.json ./
COPY --chown=node:node . .

EXPOSE 3000

FROM base as base-with-chrome

RUN apk --no-cache -U upgrade
RUN apk add --update --no-cache \
	chromium>114.0.5735.132 \
	nss \
	udev \
	freetype \
	harfbuzz \
	ca-certificates \
	ttf-freefont

RUN mkdir -p /home/node/Downloads

FROM base as dev-app

ENV NODE_ENV=development
USER node
RUN npm i

ENTRYPOINT ["npm", "run", "dev:app"]

FROM base as dev-scheduler

ENV NODE_ENV=development
USER node
RUN npm i

ENTRYPOINT ["npm", "run", "dev:scheduler"]

FROM base-with-chrome as dev-worker

ENV NODE_ENV=development
USER node
RUN npm i

ENTRYPOINT ["npm", "run", "dev:worker"]

FROM base-with-chrome as prod-all

ENV NODE_ENV=production

RUN npm i -g pm2
USER node
RUN npm ci --omit=dev

ENTRYPOINT ["pm2-runtime", "./.docker/pm2/process.all.yml"]

FROM base as prod-app

ENV NODE_ENV=production

RUN npm i -g pm2
USER node
RUN npm ci --omit=dev

ENTRYPOINT ["pm2-runtime", "./.docker/pm2/process.app.yml"]

FROM base as prod-scheduler

ENV NODE_ENV=production

RUN npm i -g pm2
USER node
RUN npm ci --omit=dev

ENTRYPOINT ["pm2-runtime", "./.docker/pm2/process.scheduler.yml"]

FROM base-with-chrome as prod-worker

ENV NODE_ENV=production

RUN npm i -g pm2
USER node
RUN npm ci --omit=dev

ENTRYPOINT ["pm2-runtime", "./.docker/pm2/process.worker.yml"]
