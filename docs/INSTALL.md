# Installation Guide

This guide will walk you through installing the WahlRaumFinder addon in your MasterPortal 3.x installation.

## Prerequisites

- MasterPortal 3.15.0 or higher installed and working
- Node.js 14+ and npm
- Access to your portal's configuration files
- GeoJSON data for addresses and polling stations

## Installation Steps

### 1. Copy the Addon

Copy the `wahlRaumFinder` directory to your MasterPortal addons folder:

```bash
# Navigate to your MasterPortal installation
cd /path/to/masterportal

# Copy the addon
cp -r /path/to/wahlraumfinder-mp3/wahlRaumFinder ./addons/
```

Your directory structure should look like:
```
masterportal/
├── addons/
│   └── wahlRaumFinder/
│       ├── components/
│       ├── store/
│       ├── locales/
│       └── index.js
├── src/
├── portal/
└── package.json
```

### 2. Register the Addon

Edit your portal's `addonsConf.json` file (typically in `portal/[your-portal]/`):

```json
{
  "wahlRaumFinder": "path/to/addons/wahlRaumFinder"
}
```

### 3. Configure Styles

Add the custom styles to your `portal/[your-portal]/resources/style_v3.json`:

```json
[
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
  },
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
  },
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
  },
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
]
```

See [examples/style_v3.json.example](../examples/style_v3.json.example) for the complete snippet.

### 4. Configure Services

Add your data services to `portal/[your-portal]/resources/services.json`:

```json
[
  {
    "id": "adressen",
    "name": "Addresses",
    "typ": "GeoJSON",
    "url": "YOUR_ADDRESS_DATA_URL",
    "gfiAttributes": "showAll",
    "gfiTheme": "default"
  },
  {
    "id": "wahlraeume",
    "name": "Wahlräume",
    "typ": "GeoJSON",
    "url": "YOUR_POLLING_STATION_DATA_URL",
    "gfiAttributes": {
      "wahllokal_name": "Name",
      "stranam": "Straße",
      "plz": "PLZ",
      "ort": "Ort",
      "wbz": "Wahlbezirk",
      "stbz": "Stadtbezirk"
    },
    "gfiTheme": "default"
  },
  {
    "id": "wahlkreise",
    "name": "Wahlkreise",
    "typ": "GeoJSON",
    "url": "YOUR_ELECTORAL_DISTRICT_DATA_URL",
    "gfiAttributes": {
      "bezeichnung": "Wahlkreis"
    },
    "gfiTheme": "default"
  }
]
```

**Important**: Replace the URLs with your actual data endpoints.

See [examples/services.json.example](../examples/services.json.example) for details.

### 5. Configure the Tool

Add the tool configuration to your `portal/[your-portal]/config.json`:

```json
{
  "portalConfig": {
    "secondaryMenu": {
      "sections": [
        [
          {
            "type": "wahlRaumFinder",
            "name": "WahlRaumFinder",
            "addressLayerId": "adressen",
            "addressLayerPollingStationAttribute": "kommunalwahl",
            "pollingStationLayerId": "wahlraeume",
            "pollingStationAttribute": "wbz",
            "pollingStationAttributeSeparator": " | ",
            "mailTo": "your-email@example.com",
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
            ]
          }
        ]
      ]
    },
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
            "url": "YOUR_ELECTORAL_DISTRICT_DATA_URL"
          }
        ]
      }
    }
  }
}
```

See [CONFIG.md](CONFIG.md) for detailed explanation of all configuration options.

### 6. Build and Start

```bash
# Install dependencies (if not already done)
npm install

# Start development server
npm start
```

Your portal should now be accessible at `http://localhost:9001` (or your configured port).

### 7. Activate the Tool

You have three options to activate the tool:

**Option A: URL Parameter (Recommended)**
```
http://localhost:9001/?isinitopen=wahlRaumFinder
```

**Option B: Manual Click**
- Open your portal
- Click on the WahlRaumFinder tool in the secondary menu

**Option C: Auto-Activation (Advanced)**
- Set `"active": true` in your tool configuration
- Apply the optional urlParams.js patch (see [patches/](../patches/))

## Verification

1. **Check the tool appears**: The WahlRaumFinder should appear in the secondary menu
2. **Search for an address**: Use the SearchBar to search for an address
3. **Verify the result**: You should see:
   - Red marker at the address
   - Teal marker at the polling station
   - Dashed connecting line with distance
   - Info panel on the right with details

## Troubleshooting

### Tool doesn't appear in menu
- Check `addonsConf.json` has the correct path
- Verify the addon directory structure is correct
- Check browser console for errors

### Address search doesn't trigger the tool
- Verify `addressLayerId` matches your address layer service ID
- Check that SearchBar is configured correctly
- Check browser console for errors about missing actions

### Styles not applied
- Verify `style_v3.json` includes all four styleId definitions
- Check styleId names match exactly in config.json
- Clear browser cache and rebuild

### Data not loading
- Check service URLs are accessible
- Verify GeoJSON format is valid
- Check browser Network tab for failed requests
- Verify CORS headers if loading from external domain

### Distance not showing on map
- Verify the `wahlraeume_distance` style includes `labelField: "text"`
- Check that all text styling properties are present
- Try zooming in if text is very small

## Next Steps

- Read [CONFIG.md](CONFIG.md) for all configuration options
- Check [MASTERPORTAL_SETUP.md](MASTERPORTAL_SETUP.md) for advanced configuration
- See [examples/](../examples/) for complete configuration examples

## Getting Help

- Check [GitHub Issues](https://github.com/riolties/wahlraumfinder-mp3/issues)
- Review MasterPortal documentation
- Ask in MasterPortal community forums
