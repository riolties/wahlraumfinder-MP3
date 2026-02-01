# MasterPortal Setup Guide

This guide covers MasterPortal-specific configuration and optional enhancements for the WahlRaumFinder addon.

## Required MasterPortal Files

You need to modify these files in your MasterPortal installation:

```
masterportal/
├── addons/
│   └── wahlRaumFinder/          # The addon (copy here)
├── portal/
│   └── [your-portal]/
│       ├── config.json           # Tool and layer configuration
│       ├── addonsConf.json       # Register addon
│       └── resources/
│           ├── services.json     # Service definitions
│           └── style_v3.json     # Style definitions
```

## 1. Register the Addon

Create or edit `portal/[your-portal]/addonsConf.json`:

```json
{
  "wahlRaumFinder": "../../addons/wahlRaumFinder"
}
```

The path is relative to the portal directory. Adjust if your addon is in a different location.

## 2. SearchBar Configuration

The WahlRaumFinder integrates with MasterPortal's SearchBar. Ensure your SearchBar is properly configured:

```json
{
  "portalConfig": {
    "mainMenu": {
      "searchBar": {
        "searchInterfaces": [
          {
            "type": "elasticSearch",
            "serviceId": "elastic_search",
            "requestType": "GET",
            "responseEntryPath": "hits.hits",
            "hitMap": {
              "name": "_source.properties.name",
              "coordinate": "_source.geometry.coordinates"
            },
            "resultEvents": {
              "onClick": ["setMarker", "zoomToResult"],
              "onHover": [],
              "buttons": ["setMarker", "zoomToResult"]
            }
          }
        ]
      }
    }
  }
}
```

**Important**: The `resultEvents.onClick` must include `"setMarker"` for the WahlRaumFinder to detect address searches.

## 3. Tool Activation Options

### Option A: URL Parameter (Recommended)

**Advantages**: No core modification required, works out of the box

**Usage**:
```
https://your-portal.com/?isinitopen=wahlRaumFinder
```

**When to use**: Production environments, no core patches desired

### Option B: Manual Click

**Advantages**: Simplest, no configuration needed

**Usage**: User clicks the WahlRaumFinder tool in the menu

**When to use**: When users should consciously activate the tool

### Option C: Auto-Activation (Optional)

**Advantages**: Tool opens automatically on page load

**Requirements**:
- Set `"active": true` in tool configuration
- Apply the optional urlParams.js patch (see below)

**When to use**: Dedicated polling station finder portals

## Optional: Auto-Activation Patch

If you want the tool to auto-activate without URL parameters, you can apply an optional patch to MasterPortal core.

**⚠️ Warning**: This modifies MasterPortal core files. Consider the trade-offs:

**Pros**:
- Cleaner URLs (no query parameters needed)
- Better UX for dedicated portals
- Works across browser refreshes

**Cons**:
- Requires patching core MasterPortal code
- May conflict with future MasterPortal updates
- Must be reapplied after MP upgrades

### Applying the Patch

1. **Review the patch**:
   ```bash
   cat patches/auto-activation-urlparams.patch
   ```

2. **Apply the patch**:
   ```bash
   cd /path/to/masterportal
   git apply /path/to/wahlraumfinder-mp3/patches/auto-activation-urlparams.patch
   ```

3. **Verify it applied**:
   ```bash
   git diff src/core/urlParams/js/urlParams.js
   ```

4. **Rebuild MasterPortal**:
   ```bash
   npm run build
   ```

### What the Patch Does

The patch adds a new function `autoActivateConfiguredTools()` that:
- Runs after URL parameters are processed
- Searches through menu sections for tools with `active: true`
- Activates the first found tool automatically
- Respects URL parameters (they take precedence)

### Alternative: Portal-Specific Implementation

Instead of patching core, you can add this to your portal's initialization:

**portal/[your-portal]/index.js**:
```javascript
// After MasterPortal initialization
window.addEventListener('load', () => {
  const store = require('masterportal/src/app-store').default;

  // Wait for store to be ready
  setTimeout(() => {
    store.dispatch('Menu/changeCurrentComponent', {
      type: 'wahlRaumFinder',
      side: 'secondaryMenu',
      props: { name: 'WahlRaumFinder' }
    });
  }, 1000);
});
```

**Pros**: No core modification
**Cons**: Timing issues, less elegant, may conflict with other initializations

## 4. Layer Loading Order

Ensure layers load in the correct order:

```json
{
  "layerConfig": {
    "baselayer": {
      "elements": [
        {
          "id": "base_map",
          "visibility": true
        }
      ]
    },
    "subjectlayer": {
      "elements": [
        {
          "id": "adressen",
          "visibility": true,
          "showInLayerTree": false
        },
        {
          "id": "wahlraeume",
          "visibility": true,
          "showInLayerTree": true
        },
        {
          "id": "wahlkreise",
          "visibility": true,
          "showInLayerTree": true
        }
      ]
    }
  }
}
```

The address layer should typically be hidden (`showInLayerTree: false`) since addresses are searched, not browsed.

## 5. Map Configuration

Ensure your map is configured with appropriate settings:

```json
{
  "portalConfig": {
    "map": {
      "mapView": {
        "epsg": "EPSG:25832",
        "startCenter": [565874, 5934140],
        "startZoomLevel": 3,
        "extent": [510000, 5850000, 625000, 6000000]
      }
    }
  }
}
```

**Important**: Use the same EPSG code that your GeoJSON data uses (or configure coordinate transformation).

## 6. CORS Configuration

If your GeoJSON data is hosted on a different domain, ensure CORS headers are set:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET
```

Or configure a proxy in your MasterPortal setup.

## 7. Performance Optimization

### Large Address Datasets

If you have many addresses (>10,000):

1. **Use indexed search**:
   ```json
   {
     "searchBar": {
       "searchInterfaces": [
         {
           "type": "elasticSearch",
           "serviceId": "address_search"
         }
       ]
     }
   }
   ```

2. **Don't load all addresses on map**:
   ```json
   {
     "id": "adressen",
     "visibility": false,
     "showInLayerTree": false
   }
   ```

### Large Polling Station Dataset

If you have many polling stations (>1,000):

1. **Use clustering** (optional):
   ```json
   {
     "id": "wahlraeume",
     "clusterDistance": 50
   }
   ```

2. **Adjust style for better performance**:
   - Use simple circle markers (already done)
   - Avoid image markers if possible

## 8. Mobile Optimization

The addon is mobile-responsive, but ensure your portal configuration supports mobile:

```json
{
  "portalConfig": {
    "tree": {
      "isMobile": true
    },
    "mainMenu": {
      "isMobile": true
    },
    "secondaryMenu": {
      "isMobile": true
    }
  }
}
```

## 9. Internationalization

The addon includes German and English translations. To add more languages:

1. **Create new locale file**:
   ```
   addons/wahlRaumFinder/locales/[language-code]/additional.json
   ```

2. **Add translations**:
   ```json
   {
     "modules": {
       "tools": {
         "wahlRaumFinder": {
           "title": "Your Translation",
           "address": "Your Translation",
           ...
         }
       }
     }
   }
   ```

3. **Reference in config**:
   ```json
   {
     "name": "translate#additional:modules.tools.wahlRaumFinder.title"
   }
   ```

## 10. Development Setup

For development:

```bash
# Install dependencies
npm install

# Start dev server with hot reload
npm start

# Build for production
npm run build

# Run linter
npm run lint
```

## 11. Production Deployment

Before deploying to production:

1. **Build optimized version**:
   ```bash
   npm run build
   ```

2. **Test in production-like environment**:
   - Test with real data volumes
   - Test on mobile devices
   - Test with slow network (throttling)

3. **Configure caching**:
   ```
   # In your web server config
   Cache-Control: public, max-age=3600
   ```

4. **Enable compression**:
   ```
   # In your web server config
   gzip on;
   gzip_types application/json;
   ```

## 12. Monitoring

Add logging to track usage:

```javascript
// In your portal's analytics
window.addEventListener('wahlraumfinder:search', (e) => {
  analytics.track('PollingStationSearch', {
    address: e.detail.address,
    distance: e.detail.distance
  });
});
```

## Troubleshooting

### Tool doesn't auto-activate with `active: true`

**Possible causes**:
- urlParams.js patch not applied
- Tool configuration in wrong menu section
- Store dispatch timing issue

**Solutions**:
- Use URL parameter instead: `?isinitopen=wahlRaumFinder`
- Apply the urlParams.js patch
- Check browser console for errors

### SearchBar doesn't trigger tool

**Possible causes**:
- SearchBar not configured with `setMarker` action
- Vuex action subscription not registered
- Address layer not loaded

**Solutions**:
- Add `"setMarker"` to `resultEvents.onClick`
- Check browser console for "WahlRaumFinder: SearchBar action listener registered"
- Verify address layer loads successfully

### Layers load slowly

**Possible causes**:
- Large GeoJSON files
- Network latency
- No server-side caching

**Solutions**:
- Optimize GeoJSON (remove unnecessary properties)
- Enable server-side gzip compression
- Use CDN for static GeoJSON files
- Consider using vector tiles for very large datasets

## See Also

- [INSTALL.md](INSTALL.md) - Installation instructions
- [CONFIG.md](CONFIG.md) - Configuration reference
- [../patches/](../patches/) - Optional core patches
- [MasterPortal Documentation](https://bitbucket.org/geowerkstatt-hamburg/masterportal/)
