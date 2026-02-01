# Attribution Notice

## Original Work

This addon is derived from the **WahlRaumFinder** addon originally developed for the Munich Geoportal (Digitaler Zwilling München).

- **Original Repository**: [https://bitbucket.org/Digitaler_Zwilling_Muenchen/addons/src/wahlraumfinder/wahlRaumFinder/](https://bitbucket.org/Digitaler_Zwilling_Muenchen/addons/src/wahlraumfinder/wahlRaumFinder/)
- **Original Authors**: Munich Geoportal Team / Digitaler Zwilling München
- **Original License**: Not explicitly stated in the source repository

## License Clarification

The original work was publicly available on Bitbucket but did not include an explicit license file. This derivative work is published in good faith as an adaptation for MasterPortal 3.x, with full attribution to the original authors.

**If you are a copyright holder of the original work** and have concerns about this derivative work, please contact us immediately via GitHub Issues, and we will work with you to address any licensing concerns.

We are committed to:
- Full attribution to original authors
- Removing or modifying this work if requested
- Working with original authors to establish appropriate licensing

## Changes in This Version

This version has been adapted for **MasterPortal 3.x** (3.15.0+) with significant modifications:

### Migration Changes (MP 2.x → MP 3.x)
- Migrated from Backbone/Radio to Vue 3 + Vuex patterns
- Replaced `Radio.trigger/request` with Vuex `dispatch/commit`
- Updated component lifecycle methods (destroyed → beforeUnmount)
- Adapted to new MasterPortal 3.x Maps module API
- Updated SearchBar integration for MP 3.x architecture


### Bug Fixes
- Improved faster search
- Improved mobile responsiveness
- Enhanced cleanup on component unmount

### Configuration Improvements
- StyleId mapping now handled in initialize() action
- Better error handling and console logging

## This Derivative Work

This MasterPortal 3.x adaptation is released under the **MIT License** (see LICENSE file).

```
MIT License

Copyright (c) 2025
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Acknowledgments

We acknowledge and thank the original developers at the Munich Geoportal for creating this valuable tool and making it publicly available, which made this adaptation possible.

## Contact

- **For this MasterPortal 3.x version**: Use GitHub Issues in this repository
- **For the original version**: Please refer to the original Bitbucket repository
- **For licensing concerns**: Please open a GitHub Issue and we will respond promptly
