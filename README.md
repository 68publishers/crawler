<div align="center" style="text-align: center; margin-bottom: 50px">
<img src="public/images/logo.svg" alt="Crawler Logo" align="center" width="200">
<h1 align="center">Crawler</h1>
<p>Scenario-based crawler written in Node.js</p>
</div>

## Table of Contents

* [About](#about)
* [Development setup](#development-setup)
* [Production setup](#production-setup)
* [Environment variables](#environment-variables)
* [Rest API and Queues board](#rest-api-and-queues-board)
* [Working with scenarios](#working-with-scenarios)
* [Working with scenario schedulers](#working-with-scenario-schedulers)
* [Tutorial: Creating the fist scenario](#tutorial--creating-the-first-scenario)
* [Integrations](#integrations)
* [License](#license)

## About

Crawler is a standalone application written in Node.js built on top of [Express.js](https://github.com/expressjs/express), [Crawlee](https://github.com/apify/crawlee), [Puppeteer](https://github.com/puppeteer/puppeteer) and [BullMQ](https://github.com/taskforcesh/bullmq), allowing you to crawl data from web pages by defining scenarios. This is all controlled through the Rest API.

![Crawler admin](docs/images/main.png)

## Development setup

### Prerequisites

- Docker compose
- Make

### Installation

```sh
$ https://github.com/68publishers/crawler.git crawler
$ cd crawler
$ make init
```

### Creating a user

HTTP Basic authorization is required for API access and administration. Here we need to create a user to access the application.

```sh
$ docker exec -it crawler-app npm run user:create
```

## Production setup

### Prerequisites

- Docker
- Postgres `>=14.6`
- Redis `>=7`

For production use, the following Redis settings must be made:

- Configuring persistence with `Append-only-file` strategy - https://redis.io/docs/management/persistence/#aof-advantages
- Set `Max memory policy` to `noeviction` - https://redis.io/docs/reference/eviction/#eviction-policies

### Installation

Firstly, you need to run the database migrations with the following command:

```sh
$ docker run \
    --network <NETWORK> \
    -e DB_URL=postgres://<USER>:<PASSWORD>@<HOSTNAME>:<PORT>/<DB_NAME> \
    --entrypoint '/bin/sh' \
    -it \
    --rm \
    68publishers/crawler:latest \
    -c 'npm run migrations:up'
```

Then download the `seccomp` file, which is required to run chrome:

```sh
$ curl -C - -O https://raw.githubusercontent.com/68publishers/crawler/main/.docker/chrome/chrome.json
```

And run the application:

```sh
$ docker run \
    --network <NETWORK> \
    -e APP_URL=<APPLICATION_URL> \
    -e DB_URL=postgres://<USER>:<PASSWORD>@<HOSTNAME>:<PORT>/<DB_NAME> \
    -e REDIS_HOST=<HOSTNAME> \
    -e REDIS_PORT=<PORT> \
    -e REDIS_AUTH=<PASSWORD> \
    -p 3000:3000 \
    --security-opt seccomp=$(pwd)/chrome.json \
    -d \
    --name 68publishers_crawler \
    68publishers/crawler:latest
```

### Creating a user

HTTP Basic authorization is required for API access and administration. Here we need to create a user to access the application.

```sh
$ docker exec -it 68publishers_crawler npm run user:create
```

## Environment variables

| Name                | Required | Default                     | Description                                                                                                             |
|---------------------|----------|-----------------------------|-------------------------------------------------------------------------------------------------------------------------|
| APP_URL             | yes      | -                           | Full origin of the application e.g. `https://www.example.com`. The variable is used to create links to screenshots etc. |
| APP_PORT            | no       | `3000`                      | Port to which the application listens                                                                                   |
| DB_URL              | yes      | -                           | Connection string to postgres database e.g. postgres://root:root@localhost:5432/crawler                                 |
| REDIS_HOST          | yes      | -                           | Redis hostname                                                                                                          |
| REDIS_PORT          | yes      | -                           | Redis port                                                                                                              |
| REDIS_AUTH          | no       | -                           | Optional redis password                                                                                                 |
| WORKER_PROCESSES    | no       | `5`                         | Number of workers that process the queue of running scenarios                                                           |
| CRAWLEE_STORAGE_DIR | no       | `./var/crawlee`             | Directory where crawler stores runtime data                                                                             |
| CHROME_PATH         | no       | `/usr/bin/chromium-browser` | Path to Chromium executable file                                                                                        |
| SENTRY_DSN          | no       | -                           | Logging into the Sentry is enabled if the variable is passed                                                            |
| SENTRY_SERVER_NAME  | no       | `crawler`                   | Server name that is passed into the Sentry logger                                                                       |

## Rest API and Queues board

The specification of the Rest API (Swagger UI) can be found at endpoint `/api-docs` (usually `http://localhost:3000/api-docs` in case of development setup). You can try to call all endpoints here.

Alternatively, the specification can be viewed online [here](https://petstore.swagger.io/?url=https://raw.githubusercontent.com/68publishers/crawler/main/public/openapi.json).

BullBoard is located at `/admin/queues`. Here you can see all the scenarios that are currently running or have already run.

## Working with scenarios

@todo

## Working with scenario schedulers

@todo

## Tutorial: Creating the first scenario

@todo

## Integrations

- [68publishers/crawler-client-php](https://github.com/68publishers/crawler-client-php) - PHP Client for Crawler's API

## License

The package is distributed under the MIT License. See [LICENSE](LICENSE.md) for more information.
