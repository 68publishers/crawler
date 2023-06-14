# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

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
