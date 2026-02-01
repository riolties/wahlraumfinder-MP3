# WahlRaumFinder for MasterPortal 3.x

![MasterPortal](https://img.shields.io/badge/MasterPortal-3.15%2B-blue)
![License](https://img.shields.io/badge/license-MIT-green)

A MasterPortal 3.x addon for finding and displaying polling stations (Wahlräume) on an interactive map, with automatic distance calculation and address search integration.

## About

This addon helps citizens find their assigned polling station by searching for their address. The tool displays:
- The searched address marked on the map
- The assigned polling station (Wahlraum)
- A connecting line showing the direct distance
- Detailed information about the polling station

This is a MasterPortal 3.x compatible version of the WahlRaumFinder addon originally developed for the Munich Geoportal. See [NOTICE.md](NOTICE.md) for attribution.

## Features

- **Address Search Integration**: Works with MasterPortal's SearchBar for seamless address lookup
- **Automatic Polling Station Assignment**: Finds the assigned polling station based on address data
- **Distance Calculation**: Shows aerial distance between address and polling station
- **Interactive Map Visualization**:
  - Red marker for searched address
  - Teal marker for polling station
  - Dashed line with distance label
- **Hover Tooltips**: Hover over polling station markers to see basic information
- **Mobile Responsive**: Optimized layout for mobile devices
- **Multilingual Support**: German and English translations included

## Requirements

- **MasterPortal**: Version 3.15.0 or higher
- **Node.js**: Version 14+ (for development)
- **Data Layers**:
  - Address layer (GeoJSON) with polling station assignments
  - Polling station layer (GeoJSON) with station details
  - Optional: Electoral district layer (GeoJSON)

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/riolties/wahlraumfinder-MP3.git
   ```

2. **Copy the addon to your MasterPortal installation**
   ```bash
   cp -r wahlRaumFinder /path/to/masterportal/addons/
   ```

3. **Configure your portal**
   - See [docs/INSTALL.md](docs/INSTALL.md) for detailed installation instructions
   - See [examples/](examples/) for configuration snippets

4. **Start your MasterPortal development server**
   ```bash
   cd /path/to/masterportal
   npm start
   ```

## Documentation

- [Installation Guide](docs/INSTALL.md) - Step-by-step setup instructions
- [Configuration Reference](docs/CONFIG.md) - All configuration options explained
- [MasterPortal Setup](docs/MASTERPORTAL_SETUP.md) - Required MasterPortal configuration changes
- [Migration Guide](docs/MIGRATION.md) - Migrating from MasterPortal 2.x version

## Configuration Example

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
          "pollingStationAttribute": "wbz"
        }
      ]
    ]
  }
}
```

See [examples/config.json.example](examples/config.json.example) for complete configuration.

## Activation Options

The addon can be activated in three ways:

1. **URL Parameter** (Recommended)
   ```
   https://your-portal.com/?isinitopen=wahlRaumFinder
   ```

2. **Manual Activation**
   - User clicks the tool in the menu

3. **Auto-Activation** (Optional)
   - Requires core patch (see [patches/](patches/))
   - Set `"active": true` in config.json

## Data Structure

Your data layers must follow this structure:

**Address Layer:**
```json
{
  "type": "Feature",
  "properties": {
    "address": "Example Street 123",
    "kommunalwahl": "001-01"
  },
  "geometry": { ... }
}
```

**Polling Station Layer:**
```json
{
  "type": "Feature",
  "properties": {
    "wbz": "001-01",
    "wahllokal_name": "School Gym",
    "stranam": "School Street 1",
    "plz": "80331",
    "ort": "Munich"
  },
  "geometry": { ... }
}
```

## Development

```bash
# Install dependencies (in your MasterPortal root)
npm install

# Start development server
npm start

# Build for production
npm run build
```

## Browser Support

- Chrome/Edge (Chromium) - Latest 2 versions
- Firefox - Latest 2 versions
- Safari - Latest 2 versions
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Attribution

This addon is based on the [WahlRaumFinder](https://bitbucket.org/Digitaler_Zwilling_Muenchen/addons/src/wahlraumfinder/) addon originally developed for the Munich Geoportal. See [NOTICE.md](NOTICE.md) for full attribution.

## Support

- **Issues**: [GitHub Issues](https://github.com/riolties/wahlraumfinder-MP3/issues)
- **Discussions**: [GitHub Discussions](https://github.com/riolties/wahlraumfinder-MP3/discussions)
- **MasterPortal Documentation**: https://bitbucket.org/geowerkstatt-hamburg/masterportal/

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and changes.

## Acknowledgments

- Original WahlRaumFinder developers at Munich Geoportal
- MasterPortal team at Geowerkstatt Hamburg
- OpenLayers and Vue.js communities
