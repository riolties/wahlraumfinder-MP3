# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.0.0-mp3] - 2026-02-01

Initial release of WahlRaumFinder for MasterPortal 3.x.

### Added
- **Hover Tooltips**: Displays polling station information when hovering over markers on the map
- **Distance Label on Map**: Shows "ca. X Meter (Luftlinie)" directly on the connecting line between address and polling station
- **Enhanced Search Integration**: Integrated with MasterPortal 3.x SearchBar using Vuex action subscription
- **Auto-Activation Support**: Tool can auto-activate based on `active: true` config setting (requires optional patch)
- **Mobile Responsiveness**: Improved layout for mobile devices (< 768px width)
- **Comprehensive Documentation**: Installation guide, configuration reference, and MasterPortal setup guide
- **Example Configuration Files**: Complete examples for config.json, services.json, and style_v3.json

### Changed
- **MasterPortal 3.x Migration**: Complete rewrite for MasterPortal 3.15.0+ compatibility
  - Migrated from Backbone/Radio to Vue 3 + Vuex patterns
  - Replaced `Radio.trigger()` with Vuex `dispatch()`
  - Replaced `Radio.request()` with Vuex `getters` and `state` access
  - Updated component lifecycle: `destroyed` → `beforeUnmount`
  - Adapted to MasterPortal 3.x Maps module API
- **SearchBar Integration**: Uses Vuex action subscription (`Maps/placingPointMarker`) instead of feature property checking
- **Distance Format**: Changed from "ca.XXm (Luftlinie)" to "ca. XX Meter (Luftlinie)" for better readability
- **Style Configuration**: StyleId mapping now handled in `initialize()` action for cleaner initialization
- **Console Logging**: Added structured console.log statements for better debugging

### Fixed
- **Random Map Click Detection**: Tool no longer triggers on random map clicks, only on actual address search results
- **SearchBar Marker Integration**: Fixed detection of SearchBar-placed markers using Vuex actions instead of feature properties
- **Component Cleanup**: Proper cleanup of event listeners and Vuex subscriptions in `beforeUnmount()`
- **Tooltip Positioning**: Hover tooltip now properly positioned and cleaned up on component unmount
- **Layer Visibility**: Polling station layer visibility properly managed

### Removed
- **MP 2.x Legacy Code**: Removed all Backbone.Radio dependencies
- **Deprecated APIs**: Removed usage of deprecated MasterPortal 2.x APIs
- **Legacy Event Handling**: Removed Backbone event system in favor of Vuex

### Technical Details

#### API Migrations
- `Radio.trigger("Map", "addLayer")` → `dispatch("Maps/addNewLayerIfNotExists")`
- `Radio.trigger("MapView", "setCenter")` → `dispatch("Maps/zoomToExtent")`
- `Radio.trigger("MapMarker", "removePointMarker")` → `dispatch("Maps/removePointMarker")`
- `Radio.request("MapView", "getProjection")` → Direct OpenLayers API access
- Feature event listener → Vuex action subscription

#### Component Lifecycle
- `destroyed()` → `beforeUnmount()`
- Manual event cleanup required in MP 3.x
- Vuex subscription cleanup added

#### Store Structure
- `state.WahlRaumFinder` → `state.Modules.WahlRaumFinder`
- Added `searchTrigger` state for component communication
- Added `initialize()` action for proper startup

## [Original] - Unknown Date

Original WahlRaumFinder addon for MasterPortal 2.x by Munich Geoportal team.

### Original Features
- Address search integration
- Polling station lookup by address
- Distance calculation (aerial distance)
- Map visualization with markers and connecting line
- Info panel with polling station details
- Support for German and English

### Original Repository
https://bitbucket.org/Digitaler_Zwilling_Muenchen/addons/src/wahlraumfinder/

---

## Migration Notes (MP 2.x → MP 3.x)

### Breaking Changes

Users migrating from the original MP 2.x version should note:

1. **Configuration Structure**: No breaking changes in config.json format
2. **API Dependencies**: Requires MasterPortal 3.15.0+ (not compatible with MP 2.x)
3. **SearchBar Integration**: Uses new MP 3.x SearchBar action system
4. **Map API**: Uses new Maps module actions instead of Radio

### Migration Steps

1. Upgrade to MasterPortal 3.15.0 or higher
2. Replace the old addon with this MP 3.x version
3. Update any custom patches (if applicable)
4. Test address search functionality
5. Verify all features work as expected

See [docs/MIGRATION.md](docs/MIGRATION.md) for detailed migration instructions.

---

## Versioning

This project uses **Semantic Versioning** with a MasterPortal version suffix:
- `1.0.0-mp3` = Version 1.0.0 for MasterPortal 3.x
- Future: `2.0.0-mp3` = Version 2.0.0 for MasterPortal 3.x

Major version changes indicate breaking changes in the addon API.

Minor version changes indicate new features (backward compatible).

Patch version changes indicate bug fixes (backward compatible).
