# Changelog

All notable changes to the WahlRaumFinder addon will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- MIT License for compliance with Landeshauptstadt München open source requirements
- JSDoc comments for better code documentation
- Error handling and logging in async operations
- CHANGELOG.md to track version history

### Changed
- **BREAKING**: Updated for MasterPortal 3.15.0 LTS compatibility (Phase 1)
- Converted synchronous XMLHttpRequest to async fetch API in `getAddressFeature()`
- Made `mainProcess()` async to support non-blocking operations
- Updated `listenToSearchResults()` with proper async error handling

### Fixed
- **Critical**: Resolved UI blocking issue that caused slow keyboard input ("bitte langsam tippen" warning)
- Performance: Address feature fetching no longer blocks the browser main thread
- Improved error handling with try-catch blocks and console logging

### Technical Details
- Replaced `xhr.open("GET", url, false)` with `await fetch(url)`
- All HTTP requests now execute asynchronously
- Proper promise handling throughout the search workflow

## [1.0.0] - Previous Version
- Initial implementation for MasterPortal 2.x
- Basic polling station lookup functionality
- Map visualization with distance calculation
- German and English localization
