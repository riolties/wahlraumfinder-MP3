# Configuration Reference

Complete reference for all WahlRaumFinder configuration options.

## Tool Configuration

Add this to your `config.json` under `portalConfig.secondaryMenu.sections` (or `mainMenu.sections`):

```json
{
  "type": "wahlRaumFinder",
  "name": "WahlRaumFinder",
  "active": false,
  "addressLayerId": "adressen",
  "addressLayerPollingStationAttribute": "kommunalwahl",
  "pollingStationLayerId": "wahlraeume",
  "pollingStationAttribute": "wbz",
  "pollingStationAttributeSeparator": " | ",
  "mailTo": "geoportal@example.com",
  "featureAttributes": {
    "wahllokal_name": "Name",
    "stranam": "Straße",
    "plz": "PLZ",
    "ort": "Ort",
    "wbz": "Wahlbezirk",
    "stbz": "Stadtbezirk"
  },
  "styleId": [
    "wahlraeume_circle_address",
    "wahlraeume_circle_wahlraum",
    "wahlraeume_distance"
  ],
  "renderToWindow": false,
  "resizableWindow": true,
  "isVisibleInMenu": true,
  "deactivateGFI": true
}
```

## Required Parameters

### `type`
- **Type**: `string`
- **Required**: Yes
- **Value**: `"wahlRaumFinder"`
- **Description**: Identifies this as a WahlRaumFinder tool. Must match the addon name.

### `name`
- **Type**: `string`
- **Required**: Yes
- **Example**: `"WahlRaumFinder"` or `"translate#additional:modules.tools.wahlRaumFinder.title"`
- **Description**: Display name shown in the menu. Use `translate#` prefix for internationalized names.

### `addressLayerId`
- **Type**: `string`
- **Required**: Yes
- **Example**: `"adressen"`
- **Description**: Service ID of the layer containing address data. Must match an ID in `services.json`.

### `addressLayerPollingStationAttribute`
- **Type**: `string`
- **Required**: Yes
- **Example**: `"kommunalwahl"`
- **Description**: Attribute name in the address layer that contains the polling station ID assignment. This attribute links addresses to their polling stations.

### `pollingStationLayerId`
- **Type**: `string`
- **Required**: Yes
- **Example**: `"wahlraeume"`
- **Description**: Service ID of the layer containing polling station data. Must match an ID in `services.json`.

### `pollingStationAttribute`
- **Type**: `string`
- **Required**: Yes
- **Example**: `"wbz"`
- **Description**: Attribute name in the polling station layer that uniquely identifies each polling station. Must match the values in `addressLayerPollingStationAttribute`.

### `styleId`
- **Type**: `array` of 3 strings
- **Required**: Yes
- **Example**: `["wahlraeume_circle_address", "wahlraeume_circle_wahlraum", "wahlraeume_distance"]`
- **Description**: Array of exactly 3 style IDs:
  - Index 0: Style for address marker (red circle)
  - Index 1: Style for polling station marker (teal circle)
  - Index 2: Style for connecting line with distance label

## Optional Parameters

### `active`
- **Type**: `boolean`
- **Default**: `false`
- **Example**: `true`
- **Description**: If `true`, the tool will auto-activate on page load. Requires either the urlParams.js patch or using URL parameter `?isinitopen=wahlRaumFinder`.

### `pollingStationAttributeSeparator`
- **Type**: `string`
- **Default**: `" | "`
- **Example**: `" | "` or `", "` or `" / "`
- **Description**: Separator used if a polling station ID contains multiple values. Used when displaying the ID in the info panel.

### `mailTo`
- **Type**: `string`
- **Default**: `""`
- **Example**: `"geoportal@muenchen.de"`
- **Description**: Email address displayed in the info panel for reporting issues or questions.

### `featureAttributes`
- **Type**: `object`
- **Required**: Yes (but content is flexible)
- **Example**:
  ```json
  {
    "wahllokal_name": "Name",
    "stranam": "Straße",
    "plz": "PLZ",
    "ort": "Ort",
    "wbz": "Wahlbezirk",
    "stbz": "Stadtbezirk"
  }
  ```
- **Description**: Maps feature attribute names to display labels. Keys are the attribute names from your GeoJSON data, values are the human-readable labels shown in the info panel.

### `renderToWindow`
- **Type**: `boolean`
- **Default**: `false`
- **Example**: `true`
- **Description**: If `true`, renders the tool in a floating window instead of the sidebar.

### `resizableWindow`
- **Type**: `boolean`
- **Default**: `true`
- **Example**: `false`
- **Description**: If `renderToWindow` is `true`, controls whether the window can be resized.

### `isVisibleInMenu`
- **Type**: `boolean`
- **Default**: `true`
- **Example**: `false`
- **Description**: Controls whether the tool appears in the menu. Set to `false` to hide it.

### `deactivateGFI`
- **Type**: `boolean`
- **Default**: `true`
- **Example**: `false`
- **Description**: If `true`, deactivates GetFeatureInfo when this tool is active to avoid conflicts.

## Layer Configuration

Add these layers to your `config.json` under `layerConfig.subjectlayer.elements`:

```json
{
  "layerConfig": {
    "subjectlayer": {
      "elements": [
        {
          "id": "adressen",
          "name": "Addresses",
          "visibility": true,
          "showInLayerTree": false
        },
        {
          "id": "wahlraeume",
          "name": "Wahlräume",
          "visibility": true,
          "showInLayerTree": true,
          "styleId": "wahlraeume_default"
        },
        {
          "id": "wahlkreise",
          "name": "Wahlkreise",
          "visibility": true,
          "showInLayerTree": true,
          "typ": "GeoJSON",
          "url": "https://example.com/wahlkreise.json"
        }
      ]
    }
  }
}
```

### Address Layer
- **id**: Must match `addressLayerId` in tool config
- **visibility**: Set to `true` to load on startup
- **showInLayerTree**: Usually `false` since addresses are searched, not browsed

### Polling Station Layer
- **id**: Must match `pollingStationLayerId` in tool config
- **visibility**: Set to `true` to show polling stations on map
- **showInLayerTree**: Usually `true` so users can toggle visibility
- **styleId**: Use `"wahlraeume_default"` for the default blue markers

### Electoral District Layer (Optional)
- **id**: Any unique ID
- **typ**: `"GeoJSON"`
- **url**: Direct URL to GeoJSON file
- **visibility**: Set to `true` to show by default
- **showInLayerTree**: Usually `true`

## Service Configuration

Add these to your `services.json`:

```json
[
  {
    "id": "adressen",
    "name": "Addresses",
    "typ": "GeoJSON",
    "url": "https://example.com/addresses.json",
    "gfiAttributes": "showAll",
    "gfiTheme": "default",
    "layerAttribution": "Your Data Source",
    "datasets": []
  },
  {
    "id": "wahlraeume",
    "name": "Wahlräume",
    "typ": "GeoJSON",
    "url": "https://example.com/polling-stations.json",
    "gfiAttributes": {
      "wahllokal_name": "Name",
      "stranam": "Straße",
      "plz": "PLZ",
      "ort": "Ort",
      "wbz": "Wahlbezirk",
      "stbz": "Stadtbezirk"
    },
    "gfiTheme": "default",
    "layerAttribution": "Your Data Source",
    "datasets": []
  },
  {
    "id": "wahlkreise",
    "name": "Wahlkreise",
    "typ": "GeoJSON",
    "url": "https://example.com/electoral-districts.json",
    "gfiAttributes": {
      "bezeichnung": "Wahlkreis"
    },
    "gfiTheme": "default",
    "layerAttribution": "Your Data Source",
    "datasets": []
  }
]
```

**Important**: Service IDs must match the layer IDs in your `config.json`.

## Style Configuration

Add these to your `style_v3.json`:

### Address Marker Style
```json
{
  "styleId": "wahlraeume_circle_address",
  "rules": [
    {
      "style": {
        "type": "circle",
        "circleFillColor": [255, 0, 0, 0.3],
        "circleStrokeColor": [255, 0, 0, 1],
        "circleStrokeWidth": 2,
        "circleRadius": 8
      }
    }
  ]
}
```

### Polling Station Marker Style
```json
{
  "styleId": "wahlraeume_circle_wahlraum",
  "rules": [
    {
      "style": {
        "type": "circle",
        "circleFillColor": [0, 170, 155, 0.3],
        "circleStrokeColor": [0, 170, 155, 1],
        "circleStrokeWidth": 2,
        "circleRadius": 10
      }
    }
  ]
}
```

### Distance Line Style
```json
{
  "styleId": "wahlraeume_distance",
  "rules": [
    {
      "style": {
        "type": "line",
        "lineStrokeColor": [0, 170, 155, 1],
        "lineStrokeWidth": 2,
        "lineStrokeDash": [5, 5],
        "labelField": "text",
        "textFillColor": [0, 0, 0, 1],
        "textStrokeColor": [255, 255, 255, 1],
        "textStrokeWidth": 3,
        "textFont": "bold 14px Arial",
        "textOffsetY": -10
      }
    }
  ]
}
```

**Important**: The `labelField: "text"` in the distance line style is required for displaying the distance on the map.

### Default Polling Station Style
```json
{
  "styleId": "wahlraeume_default",
  "rules": [
    {
      "style": {
        "type": "circle",
        "circleFillColor": [0, 115, 207, 0.5],
        "circleStrokeColor": [0, 115, 207, 1],
        "circleStrokeWidth": 2,
        "circleRadius": 6
      }
    }
  ]
}
```

## Data Structure Requirements

### Address Layer GeoJSON
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "address": "Example Street 123",
        "kommunalwahl": "001-01"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [11.5754, 48.1371]
      }
    }
  ]
}
```

**Required properties**:
- Attribute matching `addressLayerPollingStationAttribute` (e.g., `"kommunalwahl"`)
- This value must match a polling station's ID

### Polling Station Layer GeoJSON
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "wbz": "001-01",
        "wahllokal_name": "School Gymnasium",
        "stranam": "School Street 1",
        "plz": "80331",
        "ort": "Munich",
        "stbz": "District 1"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [11.5754, 48.1371]
      }
    }
  ]
}
```

**Required properties**:
- Attribute matching `pollingStationAttribute` (e.g., `"wbz"`)
- Additional properties as defined in `featureAttributes`

## Example Configurations

### Minimal Configuration
```json
{
  "type": "wahlRaumFinder",
  "name": "Polling Station Finder",
  "addressLayerId": "addresses",
  "addressLayerPollingStationAttribute": "station_id",
  "pollingStationLayerId": "stations",
  "pollingStationAttribute": "id",
  "featureAttributes": {
    "name": "Name",
    "street": "Street"
  },
  "styleId": ["address_style", "station_style", "line_style"]
}
```

### Full Configuration
See [examples/config.json.example](../examples/config.json.example) for a complete example with all options.

## Troubleshooting Configuration

### "No polling station found" error
- Verify `addressLayerPollingStationAttribute` values match `pollingStationAttribute` values exactly
- Check for trailing spaces or case sensitivity issues
- Verify both layers are loading successfully (check Network tab)

### Markers don't appear
- Check that styleId array contains exactly 3 style IDs
- Verify all style IDs exist in `style_v3.json`
- Check browser console for style-related errors

### Distance label not showing
- Verify `wahlraeume_distance` style includes `labelField: "text"`
- Check that text styling properties are present
- Try increasing `textFont` size if too small to see

### SearchBar integration not working
- Verify SearchBar is configured in your `config.json`
- Check that address layer is searchable
- Review browser console for action-related errors

## See Also

- [INSTALL.md](INSTALL.md) - Installation instructions
- [MASTERPORTAL_SETUP.md](MASTERPORTAL_SETUP.md) - MasterPortal-specific configuration
- [examples/](../examples/) - Complete example files
