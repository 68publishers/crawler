# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased
### Added
- Added action `runScene`.
- Added action `runSceneConditionally` with first implemented condition - `isElementVisible`.
- Added scenario option `options.maxConcurrency`.
- Added scenario option `options.session.maxPoolSize`.
- Added scenario option `options.session.maxSessionUsageCount`.
- Added scenario option `options.session.transferredCookies` - cookies with names defined by this option will be transferred between all sessions in the pool.

### Changed
- Cookies obtained via action `collectCookies` are stored and compared using domain without leading dot.

## 0.3.0 - 2023-06-16
### Added
- Added npm scripts `dev:app`, `dev:worker`, `dev:scheduler`.
- Added separated services `worker` and `scheduler` in `docker-compose.yml`.
- Added service `migrations` in `docker-compose.yml` that is run before services `app`, `worker` and `scheduler` started.
- Added queue `scheduler_queue`. The scheduler is refreshed when the worker processes new job named `refresh`.

### Changed
- The application has been divided into 3 processes - `app`, `worker` and `scheduler`.
- Moved controllers, routes and the Application class into the new directory `src/application`.
- Updated pm2-runtime configuration file.

### Removed
- Removed npm script `dev`.

## 0.2.2 - 2023-06-15
### Added
- Added action `enqueueLinksByClicking`.
- Added previously deleted option `baseUrl` for the action `enqueueLinks`

### Changed
- Updated dependency `crawlee` to the version `^3.4.0`.

### Fixed
- Fixed cleanup after failed crawling process.
- Action `clickWithRedirect` changes `request.loadedUrl` to the current URL after a redirect.

## 0.2.1 - 2023-06-14
### Added
- Added Swagger UI on the endpoint `/api-docs`.

### Changed
- Changed `command` for service `redis` in `docker-compose.yml` - added option `--appendonly yes`
- Updated README.

## 0.2.0 - 2023-06-13
### Added
- Added new initial scenario status `waiting`. A Scenario is marked as `running` when it actually runs.
- Added support for logging into Sentry. Two ENV variables are processed - `SENTRY_DSN` (optional, enables logging) and `SENTRY_SERVER_NAME` (by default `crawler`).
- Added filters `createdBefore` and `createdAfter` for endpoint `GET /api/scenarios`.
- Added filters `createdBefore`, `createdAfter`, `updatedBefore` and `updatedAfter` for endpoint `GET /api/scenario-schedulers`.

### Changed
- Logger allows to call methods `warning()` and `error()` with Error objects.
- A scenario is marked as `failed` if no URL has benn successfully crawled.

## 0.1.4 - 2023-06-07
### Removed
- Removed the option `baseUrl` for the action `enqueueLinks` - browser automatically detects it.

### Fixed
- Fixed saving of fields `visitedUrls.[*].foundOnUrl` for failed requests.

## 0.1.3 - 2023-06-07
### Added
- Added database migration that fixes all previously created results in the group `data`.

### Changed
- Changed structure of collected data - collected values are now under the key `values`.
- Listing Apis now returns fields `next` and `previous` as objects with s shape `{"url": "next_page_url", "limit": int, "page": int}`.
- All errors responses have been unified.

### Fixed
- Fixed unhandled promises in controllers

## 0.1.2 - 2023-06-05
### Fixed
- Fixed image pushing into the DockerHub.

## 0.1.1 - 2023-06-05
### Changed
- Changed the name of the package to `@68publishers/crawler` in package*.json files.

## 0.1.0 - 2023-06-05
### Added
- The application :)
