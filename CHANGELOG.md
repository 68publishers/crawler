# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

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
