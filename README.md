<div align="center" style="text-align: center; margin-bottom: 50px">
<img src="public/images/logo.svg" alt="Crawler Logo" align="center" width="200">
<h1 align="center">Crawler</h1>
</div>

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

## Production setup

### Prerequisites

- Docker
- Postgres `>=14.6`
- Redis `>=7`

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
