# Migration Guide: MasterPortal 2.x to 3.x

This guide helps you migrate from the original WahlRaumFinder addon (MasterPortal 2.x) to this MasterPortal 3.x compatible version.

## Prerequisites

Before starting the migration:

1. **MasterPortal 3.15.0+**: Ensure you have upgraded to MasterPortal 3.15.0 or higher
2. **Backup**: Create a backup of your current portal configuration
3. **Test Environment**: Test the migration in a non-production environment first

## Breaking Changes

### API Changes

The main breaking change is the **MasterPortal version requirement**. This addon is only compatible with MasterPortal 3.x and will not work with MasterPortal 2.x.

### Configuration Compatibility

**Good news**: Your existing `config.json` configuration is fully compatible! No changes needed to:
- Tool configuration structure
- Layer configuration
- Service definitions
- Style definitions

## Migration Steps

### Step 1: Upgrade MasterPortal

If you haven't already, upgrade your MasterPortal installation to version 3.15.0 or higher.

```bash
# In your MasterPortal directory
git fetch --tags
git checkout v3.15.0  # or latest version

npm install
npm run build
```

See [MasterPortal documentation](https://bitbucket.org/geowerkstatt-hamburg/masterportal/) for detailed upgrade instructions.

### Step 2: Replace the Addon

Remove the old addon and install the new one:

```bash
# Remove old version
rm -rf addons/wahlRaumFinder

# Copy new version
cp -r /path/to/wahlraumfinder-mp3/wahlRaumFinder ./addons/
```

### Step 3: Verify Configuration

Your existing configuration should work as-is, but verify these files:

**config.json** - No changes needed, but verify the tool is configured:
```json
{
  "secondaryMenu": {
    "sections": [
      [
        {
          "type": "wahlRaumFinder",
          "name": "WahlRaumFinder",
          "addressLayerId": "adressen",
          "pollingStationLayerId": "wahlraeume",
          ...
        }
      ]
    ]
  }
}
```

**services.json** - No changes needed
**style_v3.json** - No changes needed (but see optional enhancements below)

### Step 4: Optional: Add Distance Label on Map

If you want the new distance label feature (shows distance directly on the connecting line), update your distance line style:

**In style_v3.json**, update the `wahlraeume_distance` style:

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

The key additions are:
- `"labelField": "text"` - Tells OpenLayers to use the "text" property
- Text styling properties - Configure how the distance label looks

### Step 5: Rebuild and Test

```bash
# Rebuild MasterPortal with the new addon
npm run build

# Start development server
npm start
```

### Step 6: Verify Functionality

Test these key features:

1. **Address Search**: Search for an address using the SearchBar
2. **Polling Station Display**: Verify the polling station marker appears
3. **Distance Calculation**: Check the distance is shown in the info panel
4. **Distance Label** (if enabled): Check the distance appears on the map line
5. **Hover Tooltip**: Hover over polling station markers to see tooltip
6. **Mobile View**: Test on mobile device or with browser dev tools

## What Changed Under the Hood

Understanding what changed can help with troubleshooting.

### Architecture Changes

**MasterPortal 2.x**:
- Backbone.js framework
- Radio/Mediator pattern for communication
- Backbone.Model for state management
- Backbone.View for rendering

**MasterPortal 3.x**:
- Vue 3 framework
- Vuex for state management
- Vue components for rendering
- Direct action dispatching

### Code Changes

#### State Management

**Before (MP 2.x)**:
```javascript
Radio.trigger("ModelList", "getModelByAttributes", {...});
Radio.request("Map", "getMap");
```

**After (MP 3.x)**:
```javascript
this.$store.dispatch("Maps/addNewLayerIfNotExists", {...});
this.$store.state.Modules.WahlRaumFinder.someValue;
```

#### Component Lifecycle

**Before (MP 2.x)**:
```javascript
destroyed() {
  // cleanup
}
```

**After (MP 3.x)**:
```javascript
beforeUnmount() {
  // cleanup
  if (this.unsubscribeAction) {
    this.unsubscribeAction();
  }
}
```

#### SearchBar Integration

**Before (MP 2.x)**:
```javascript
// Listened to marker layer features
layer.getSource().on('addfeature', (event) => {
  const feature = event.feature;
  if (feature.get('name')) {
    // process
  }
});
```

**After (MP 3.x)**:
```javascript
// Subscribe to Vuex actions
this.unsubscribeAction = this.$store.subscribeAction({
  after: (action, state) => {
    if (action.type === "Maps/placingPointMarker") {
      const coordinate = action.payload;
      // process
    }
  }
});
```

## New Features in 3.x Version

These features are automatically available after migration:

### 1. Hover Tooltips
Hover over any polling station marker to see basic information without clicking.

### 2. Distance Label on Map
The distance between address and polling station now appears directly on the connecting line (requires style update).

### 3. Improved SearchBar Integration
Better integration with MasterPortal 3.x SearchBar, no false triggers from random map clicks.

### 4. Mobile Responsiveness
Improved layout for mobile devices with automatic detection.

### 5. Enhanced Error Handling
Better error messages and console logging for debugging.

## Troubleshooting Migration Issues

### Issue: Tool doesn't appear in menu

**Possible causes**:
- MasterPortal version < 3.15.0
- Incorrect addon path in `addonsConf.json`
- Build errors

**Solutions**:
```bash
# Check MasterPortal version
npm list masterportal

# Verify addonsConf.json
cat portal/[your-portal]/addonsConf.json

# Check build logs
npm run build 2>&1 | grep -i error
```

### Issue: SearchBar doesn't trigger tool

**Possible causes**:
- SearchBar configuration missing `setMarker` action
- Vuex action not registered

**Solutions**:

1. Verify SearchBar config includes:
```json
"resultEvents": {
  "onClick": ["setMarker", "zoomToResult"]
}
```

2. Check browser console for:
```
WahlRaumFinder: SearchBar action listener registered
```

### Issue: Distance label not showing

**Possible causes**:
- Style not updated with text properties
- Text too small to see at current zoom level

**Solutions**:

1. Verify style includes `"labelField": "text"`
2. Increase font size: `"textFont": "bold 16px Arial"`
3. Zoom in closer to the connecting line

### Issue: Hover tooltip not working

**Possible causes**:
- Polling station layer not loaded
- Map interaction issues

**Solutions**:

1. Check browser console for errors
2. Verify polling stations layer is visible
3. Check that layer ID matches configuration

### Issue: "Module not found" errors during build

**Possible causes**:
- Dependencies not installed
- Addon path incorrect

**Solutions**:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Verify addon is in correct location
ls -la addons/wahlRaumFinder/
```

## Performance Considerations

The MP 3.x version has similar performance characteristics to the 2.x version, but note:

- **Vue 3 Reactivity**: Slightly better performance with large datasets
- **Vuex State**: More efficient state updates
- **Modern JavaScript**: Better browser optimization

## Rollback Plan

If you encounter issues and need to rollback:

1. **Keep backups**: Before migration, backup your addon and configuration
2. **Version control**: Use git tags to mark stable versions
3. **Restore process**:
   ```bash
   # Restore old addon
   git checkout [old-commit] -- addons/wahlRaumFinder

   # Rebuild
   npm run build
   ```

## Getting Help

If you encounter issues during migration:

1. Check the browser console for error messages
2. Review [INSTALL.md](INSTALL.md) and [CONFIG.md](CONFIG.md)
3. Open an issue on GitHub with:
   - MasterPortal version
   - Browser and OS
   - Error messages
   - Steps to reproduce

## Testing After Migration

Recommended test cases:

- [ ] Tool appears in secondary menu
- [ ] Address search triggers polling station lookup
- [ ] Correct polling station is found
- [ ] Distance is calculated correctly
- [ ] Map markers appear (address and polling station)
- [ ] Connecting line with distance label shows
- [ ] Hover tooltips work on polling stations
- [ ] Info panel displays all attributes
- [ ] Layer tree shows/hides layers correctly
- [ ] Mobile view works (if applicable)
- [ ] Multiple address searches work in sequence

## Summary

Migration from MP 2.x to MP 3.x is straightforward:

✅ **Configuration**: No changes needed
✅ **Installation**: Simple copy/replace
✅ **New Features**: Automatically enabled
✅ **Compatibility**: Fully backward compatible

The main requirement is MasterPortal 3.15.0+. Once your portal is upgraded, the addon will work with your existing configuration.

## Next Steps

After successful migration:

1. Read [CONFIG.md](CONFIG.md) for new configuration options
2. Enable optional features (distance label, auto-activation)
3. Review [MASTERPORTAL_SETUP.md](MASTERPORTAL_SETUP.md) for advanced configuration
4. Consider contributing improvements back to the project
