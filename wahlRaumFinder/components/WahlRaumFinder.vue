<script>
/**
 * MasterPortal 3.15.1 Migration Notes:
 * - ToolTemplate removed - MP 3.x tools don't use wrapper components
 * - getProxyUrl import updated to actual MP 3.15.1 location
 * - Tool window/sidebar rendering handled by menu system via config.json
 */
import {mapGetters, mapMutations, mapActions} from "vuex";
import getters from "../store/gettersWahlRaumFinder";
import mutations from "../store/mutationsWahlRaumFinder";
import {getProxyUrl} from "@appstore/js/getProxyUrl";
import {WFS} from "ol/format.js";
import Feature from "ol/Feature";
import {Point, LineString} from "ol/geom";
import Overlay from "ol/Overlay";
import styleList from "@masterportal/masterportalapi/src/vectorStyle/styleList";
import createStyle from "@masterportal/masterportalapi/src/vectorStyle/createStyle";
import mapCollection from "@core/maps/js/mapCollection";

export default {
    name: "WahlRaumFinder",
    data() {
        return {
            hoverOverlay: null,
            pointerMoveListener: null,
            unsubscribeAction: null
        };
    },
    computed: {
        ...mapGetters("Modules/WahlRaumFinder", Object.keys(getters)),
        // Check for mobile based on window width as fallback
        isMobile() {
            return this.$store.getters.mobile || this.$store.getters["isMobile"] || window.innerWidth < 768;
        },
        // Watch marker coordinates - trying different possible paths
        markerCoordinates() {
            // Try multiple possible paths where marker might be stored
            return this.$store.state.Modules?.Maps?.markerPoint?.coordinates ||
                   this.$store.state.Maps?.markerPoint?.coordinates ||
                   this.$store.state.Modules?.MapMarker?.coordinates ||
                   this.$store.state.MapMarker?.coordinates;
        },
        markerLabel() {
            return this.$store.state.Modules?.Maps?.markerPoint?.label ||
                   this.$store.state.Maps?.markerPoint?.label ||
                   this.$store.state.Modules?.MapMarker?.label ||
                   this.$store.state.MapMarker?.label;
        }
    },
    /**
     * Put initialize here if mounting occurs after config parsing
     * @returns {void}
     */
    created () {
        // Vue 3: $on removed - close handling now managed by menu system

        // Call the initialize action to handle auto-activation
        this.$store.dispatch("Modules/WahlRaumFinder/initialize");
    },
    mounted () {
        this.applyTranslationKey(this.name);

        console.log("WahlRaumFinder: Component mounted, active state:", this.active);

        // Initialize map-dependent operations - they will poll for map readiness
        this.$nextTick(() => {
            this.showPollingStationLayer();
            this.addMapClickListener();
            this.listenToSearchResults();
            this.initializeHoverTooltip();
        });
    },
    beforeUnmount() {
        // Clean up hover tooltip
        this.removeHoverTooltip();
        // Clean up map click listener
        this.removeMapClickListener();
        // Clean up SearchBar action subscription
        if (this.unsubscribeAction) {
            this.unsubscribeAction();
            this.unsubscribeAction = null;
        }
    },
    methods: {
        ...mapMutations("Modules/WahlRaumFinder", Object.keys(mutations)),
        ...mapActions("Maps", ["zoomToExtent"]),

        close (reset) {
            this.setActive(false);

            /**
             * MP 3.15.0: ModelList/Radio.request pattern replaced with Vuex
             * In MP 3.x, menu state should be handled through Vuex store
             * If this causes issues, check MP 3.15 docs for menu state management
             */
            // Legacy v2.x code removed - MP 3.x handles menu state automatically

            if (reset !== false) {
                this.reset();
            }
            this.$store.dispatch("Maps/removePointMarker");
            // Clean up map listener
            this.removeMapClickListener();
            // Clean up SearchBar action subscription
            if (this.unsubscribeAction) {
                this.unsubscribeAction();
                this.unsubscribeAction = null;
            }
        },
        /**
         * MP 3.15.0: Listen to SearchBar's setMarker action
         * This is called when user selects an address search result
         * Subscribes to Vuex actions to detect when SearchBar places a marker
         */
        listenToSearchResults () {
            console.log("WahlRaumFinder: Setting up SearchBar action listener");

            // Subscribe to Vuex actions to detect when SearchBar places a marker
            this.unsubscribeAction = this.$store.subscribeAction({
                after: (action, state) => {
                    // Listen for when SearchBar triggers the setMarker action
                    // which then dispatches Maps/placingPointMarker
                    if (action.type === "Maps/placingPointMarker") {
                        const coordinate = action.payload;

                        if (coordinate && Array.isArray(coordinate) && coordinate.length >= 2) {
                            console.log("WahlRaumFinder: SearchBar placed marker at:", coordinate);

                            // Get the search input value as the address name
                            const addressName = this.$store.state.Modules?.SearchBar?.currentSearchInputValue ||
                                               this.$store.state.SearchBar?.searchInput ||
                                               "Gesuchte Adresse";

                            const hit = {
                                name: addressName,
                                coordinate: coordinate
                            };

                            this.mainProcess(hit).catch(error => {
                                console.error("WahlRaumFinder: Error processing:", error);
                                this.showError();
                            });
                        }
                    }
                }
            });

            console.log("WahlRaumFinder: SearchBar action listener registered");
        },
        /**
         * Show the polling stations layer on the map
         * @returns {void}
         */
        showPollingStationLayer () {
            // Poll for layer to be ready
            const checkInterval = setInterval(() => {
                const layer = this.$store.getters["Maps/layerById"]?.(this.pollingStationLayerId);
                if (layer && layer.setVisible) {
                    clearInterval(checkInterval);
                    layer.setVisible(true);
                    console.log("WahlRaumFinder: Polling stations layer made visible");
                }
            }, 100);

            // Give up after 10 seconds
            setTimeout(() => clearInterval(checkInterval), 10000);
        },
        /**
         * Add map click listener to handle clicks on polling station features
         * @returns {void}
         */
        addMapClickListener () {
            // Poll for map to be ready
            const checkInterval = setInterval(() => {
                const map = mapCollection.getMap("2D");
                if (map) {
                    clearInterval(checkInterval);
                    console.log("WahlRaumFinder: Map found, adding click listener");

                    this.mapClickListener = map.on("singleclick", async (evt) => {
                        const features = map.getFeaturesAtPixel(evt.pixel, {
                            layerFilter: (layer) => {
                                return layer.get("id") === this.pollingStationLayerId;
                            }
                        });

                        if (features && features.length > 0) {
                            const feature = features[0];
                            await this.displayPollingStationInfo(feature);
                        }
                    });
                }
            }, 100);

            // Give up after 10 seconds
            setTimeout(() => clearInterval(checkInterval), 10000);
        },
        /**
         * Remove map click listener
         * @returns {void}
         */
        removeMapClickListener () {
            if (this.mapClickListener) {
                const map = mapCollection.getMap("2D");
                if (map) {
                    map.un("singleclick", this.mapClickListener);
                }
                this.mapClickListener = null;
            }
        },
        /**
         * Display polling station information when clicked
         * @param {Feature} feature - OpenLayers feature
         * @returns {Promise<void>}
         */
        async displayPollingStationInfo (feature) {
            const featureValues = {};

            // Extract feature attributes based on configured featureAttributes
            Object.keys(this.featureAttributes).forEach(key => {
                const value = feature.get(key);
                if (value !== undefined && value !== null) {
                    featureValues[this.featureAttributes[key]] = value;
                }
            });

            // Set state
            this.setAddressString("Direkt ausgewählter Wahlraum");
            this.setAddressPollingStationId(feature.get(this.pollingStationAttribute) || "-");
            this.setFeatureValues(featureValues);
            this.setDistanceString("-");

            // Zoom to feature
            const extent = feature.getGeometry().getExtent();
            if (extent) {
                await this.zoomToExtent({extent});
            }

            console.log("WahlRaumFinder: Displayed polling station info:", featureValues);
        },
        /**
         * Main processing function for search results.
         * Async to support non-blocking address feature fetching.
         * @param {Object} hit - Search result with name and coordinate
         * @returns {Promise<void>}
         */
        async mainProcess (hit) {
            const addressString = hit.name;
            const addressCoord = hit.coordinate;

            console.log("WahlRaumFinder: Processing address:", addressString, "at", addressCoord);

            // First, zoom the map to the address coordinate to ensure proper resolution for WMS query
            // Create a small extent around the address (50m buffer)
            const buffer = 50;
            const addressExtent = [
                addressCoord[0] - buffer,
                addressCoord[1] - buffer,
                addressCoord[0] + buffer,
                addressCoord[1] + buffer
            ];

            console.log("WahlRaumFinder: Zooming to address coordinate");
            await this.zoomToExtent({extent: addressExtent});

            // Wait a moment for the map to finish rendering at the new resolution
            await new Promise(resolve => setTimeout(resolve, 300));

            // Now query address layer for Wahlbezirk assignment at the correct resolution
            const gfiUrl = addressCoord ? this.getGfiUrl(addressCoord, this.addressLayerId) : undefined;

            if (!gfiUrl) {
                console.error("WahlRaumFinder: Could not create GFI URL for address layer");
                this.showError();
                return;
            }

            console.log("WahlRaumFinder: Querying address layer:", gfiUrl);
            const addressFeature = await this.getAddressFeature(gfiUrl);

            if (!addressFeature) {
                console.error("WahlRaumFinder: No address feature found in WMS response");
                this.showError();
                return;
            }

            const pollingStationId = addressFeature.get(this.addressLayerPollingStationAttribute);
            console.log("WahlRaumFinder: Address assigned to Wahlbezirk:", pollingStationId);

            if (!pollingStationId) {
                console.error("WahlRaumFinder: No Wahlbezirk attribute found in address feature");
                this.showError();
                return;
            }

            const pollingStationFeature = this.derivePollingStationFromWfs(pollingStationId);

            if (!pollingStationFeature) {
                console.error("WahlRaumFinder: No polling station found for Wahlbezirk:", pollingStationId);
                this.showError();
                return;
            }

            await this.processPollingStation(addressString, addressCoord, pollingStationFeature, pollingStationId);
        },
        /**
         * Process and display the polling station information
         * @param {string} addressString - Address name
         * @param {Array<number>} addressCoord - Address coordinates
         * @param {Feature} pollingStationFeature - Polling station feature
         * @param {string} pollingStationId - Wahlbezirk ID or "nearest"
         * @returns {Promise<void>}
         */
        async processPollingStation (addressString, addressCoord, pollingStationFeature, pollingStationId) {
            const featureCoord = pollingStationFeature.getGeometry().getCoordinates();
            const extent = this.createExtent(addressCoord, featureCoord, 100);
            const distanceString = this.calculateDistanceString(addressCoord, featureCoord);
            const featureValues = this.prepareFeature(pollingStationFeature);

            await this.addLayerOnMap(addressCoord, featureCoord, distanceString);
            await this.setExtentToMap(extent);

            this.setAddressString(addressString);
            this.setAddressPollingStationId(pollingStationId === "nearest" ? "(Nächstgelegener)" : pollingStationId);
            this.setFeatureValues(featureValues);
            this.setDistanceString(distanceString);
            this.setActive(true);

            console.log("WahlRaumFinder: Found polling station:", pollingStationId, "distance:", distanceString);
        },
        createExtent (addressCoord, featureCoord, offset) {
            let xMin = 0,
                yMin = 0,
                xMax = 0,
                yMax = 0,
                extent = [xMin, yMin, xMax, yMax];
            const isValidAddressCoord = this.isValidCoord(addressCoord),
                isValidFeatureCoord = this.isValidCoord(featureCoord),
                offsetForExtent = offset ? offset : 0;

            if (isValidAddressCoord && isValidFeatureCoord) {
                xMin = Math.min(addressCoord[0], featureCoord[0]) - offsetForExtent;
                yMin = Math.min(addressCoord[1], featureCoord[1]) - offsetForExtent;
                xMax = Math.max(addressCoord[0], featureCoord[0]) + offsetForExtent;
                yMax = Math.max(addressCoord[1], featureCoord[1]) + offsetForExtent;
                extent = [xMin, yMin, xMax, yMax];
            }
            return extent;
        },
        isValidCoord (coord) {
            const isArray = Array.isArray(coord),
                isLength = isArray && (coord.length === 2 || coord.length === 3) || false,
                isNumber = isArray ? coord.every(function (element) {
                    return typeof element === "number";
                }) : false;

            return isArray && isLength && isNumber;
        },
        /**
         * MP 3.15.0: Use Vuex action instead of Radio.trigger
         */
        async setExtentToMap (extent) {
            await this.zoomToExtent({extent});
        },
        calculateDistanceString (addressCoord, featureCoord) {
            const deltaX = addressCoord[0] - featureCoord[0],
                deltaY = addressCoord[1] - featureCoord[1];
            let distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));

            distance = "ca. " + Math.round(distance) + " Meter (Luftlinie)";
            return distance;
        },
        /**
         * MP 3.15.0: Replace Radio.request with Vuex dispatch
         *
         * MIGRATION NOTE: The action name may vary:
         * - Maps/createLayerIfNotExists
         * - Map/createLayer
         * - Maps/addLayer
         *
         * If this doesn't work, check MP 3.15.0 Maps module actions
         */
        async addLayerOnMap (addressCoord, featureCoord, distanceString) {
            const layer = await this.$store.dispatch("Maps/addNewLayerIfNotExists", {layerName: "pollingStationMarker", alwaysOnTop: true}, {root: true});
            const source = layer.getSource();
            const addressFeature = this.createPointFeatureAndSetStyle(addressCoord, "addressFeature", this.styleId_circle_address, "Adresse");
            const pollingStationFeature = this.createPointFeatureAndSetStyle(featureCoord, "pollingStationFeature", this.styleId_circle_wahlraum, "Wahlraum");
            const distanceFeature = this.createLineFeatureAndSetStyle(addressCoord, featureCoord, "distanceFeature", this.styleId_distance, distanceString);

            source.clear();
            source.addFeature(addressFeature);
            source.addFeature(pollingStationFeature);
            source.addFeature(distanceFeature);
        },
        createPointFeatureAndSetStyle (coord, id, styleId, text) {
            const feature = new Feature({
                    geometry: new Point(coord),
                    id: id,
                    text: text
                }),
                style = styleList.returnStyleObject(styleId);

            if (style) {
                feature.setStyle(createStyle.createStyle(style, feature, false, Config.wfsImgPath));
            }
            return feature;
        },

        createLineFeatureAndSetStyle (coord1, coord2, id, styleId, text) {
            const feature = new Feature({
                    geometry: new LineString([coord1, coord2]),
                    id: id,
                    text: text
                }),
                style = styleList.returnStyleObject(styleId);

            if (style) {
                feature.setStyle(createStyle.createStyle(style, feature, false, Config.wfsImgPath));
            }
            return feature;
        },
        /**
         * Find the nearest polling station to the given coordinate
         * MP 3.x: Direct approach without address layer query
         * @param {Array<number>} coordinate - [x, y] coordinate
         * @returns {Feature|null} The nearest polling station feature
         */
        findNearestPollingStation (coordinate) {
            const map = mapCollection.getMap("2D");
            if (!map) {
                console.error("WahlRaumFinder: Could not get map");
                return null;
            }

            // Get polling station layer
            const layer = map.getLayers().getArray().find(l => l.get("id") === this.pollingStationLayerId);
            if (!layer) {
                console.error("WahlRaumFinder: Could not find polling station layer");
                return null;
            }

            const source = layer.getSource();
            const features = source.getFeatures();

            if (!features || features.length === 0) {
                console.error("WahlRaumFinder: No polling station features found");
                return null;
            }

            // Find the nearest feature
            let nearestFeature = null;
            let minDistance = Infinity;

            features.forEach(feature => {
                const geom = feature.getGeometry();
                const featureCoord = geom.getCoordinates();

                // Calculate distance
                const dx = coordinate[0] - featureCoord[0];
                const dy = coordinate[1] - featureCoord[1];
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < minDistance) {
                    minDistance = distance;
                    nearestFeature = feature;
                }
            });

            console.log("WahlRaumFinder: Found nearest polling station at distance:", Math.round(minDistance), "m");
            return nearestFeature;
        },
        prepareFeature (feature) {
            let obj = {};

            feature.getKeys().forEach(key => {
                obj[key] = feature.get(key);
            });
            obj = this.mapFeatureAttributes(obj, this.featureAttributes);

            return obj;
        },

        mapFeatureAttributes (obj, featureAttributes) {
            const mappedObj = {};

            Object.keys(featureAttributes).forEach(attr => {
                mappedObj[featureAttributes[attr]] = obj[attr];
            });
            return mappedObj;
        },
        /**
         * MP 3.15.0: Replace Radio.request with Vuex getters
         *
         * MIGRATION NOTE: Possible getter paths:
         * - Layer: this.$store.getters["Maps/layerById"](addressLayerId)
         * - Resolution: this.$store.getters["Maps/resolution"] or this.$store.state.Maps.view.resolution
         * - Projection: this.$store.getters["Maps/projection"] or this.$store.state.Maps.view.projection
         *
         * If errors occur, check MP 3.15.0 Maps module structure
         */
        getGfiUrl (coord, addressLayerId) {
            const map = mapCollection.getMap("2D");
            if (!map) {
                console.error("WahlRaumFinder: Could not get map");
                return null;
            }

            // Get layer using mapCollection
            const allLayers = map.getLayers().getArray();
            const layerIds = allLayers.map(l => l.get("id") || l.get("name")).filter(id => id);

            const layer = allLayers.find(l => l.get("id") === addressLayerId);

            // Get resolution and projection from map view
            const view = map.getView();
            const resolution = view.getResolution();
            const projection = view.getProjection();

            if (!layer || !resolution || !projection) {
                console.error("WahlRaumFinder: Could not get layer, resolution, or projection", {layer: !!layer, resolution, projection, layerIds});
                return null;
            }

            // Get WMS source - in MP 3.x, use layer.getSource() directly
            const source = layer.getSource();
            if (!source || !source.getFeatureInfoUrl) {
                console.error("WahlRaumFinder: Layer source doesn't support GetFeatureInfo", {
                    hasSource: !!source,
                    hasMethod: source ? !!source.getFeatureInfoUrl : false
                });
                return null;
            }

            // Build GetFeatureInfo URL
            // Munich WMS requires text/xml format
            const gfiUrl = source.getFeatureInfoUrl(
                coord,
                resolution,
                projection,
                {
                    'INFO_FORMAT': 'text/xml',
                    'FEATURE_COUNT': 10  // Increased to get more results
                }
            );

            return gfiUrl;
        },
        /**
         * Fetches address feature from WFS service asynchronously.
         * Uses fetch API instead of synchronous XMLHttpRequest to prevent UI blocking.
         * This resolves the "bitte langsam tippen" (please type slowly) performance issue.
         * @param {String} url - The WFS GetFeatureInfo URL
         * @returns {Promise<Feature|null>} The address feature or null on error
         */
        async getAddressFeature (url) {
            const proxyUrl = getProxyUrl(url);
            try {
                const response = await fetch(proxyUrl);

                if (response.ok) {
                    const text = await response.text();
                    const wfsReader = new WFS();
                    const features = wfsReader.readFeatures(text);

                    if (features && features.length > 0) {
                        return features[0];
                    } else {
                        console.error("WahlRaumFinder: No features found in WFS response");
                        return null;
                    }
                }
                else {
                    console.error("WahlRaumFinder: Non-OK response status:", response.status);
                    this.showError();
                    return null;
                }
            }
            catch (error) {
                console.error("WahlRaumFinder: Error fetching address feature:", error);
                this.showError();
                return null;
            }
        },
        /**
         * MP 3.15.0: Works with both WFS and GeoJSON layers
         * Finds polling station feature by matching attribute value
         */
        derivePollingStationFromWfs (pollingStationId) {
            const map = mapCollection.getMap("2D");
            if (!map) {
                console.error("WahlRaumFinder: Could not get map");
                return null;
            }

            const layer = map.getLayers().getArray().find(l => l.get("id") === this.pollingStationLayerId);

            if (!layer) {
                console.error("WahlRaumFinder: Could not find polling station layer with ID:", this.pollingStationLayerId);
                return null;
            }

            // Get features from layer source (works for both WFS and GeoJSON)
            const source = layer.getSource();
            const features = source ? source.getFeatures() : [];

            if (!features || features.length === 0) {
                console.error("WahlRaumFinder: No features found in polling station layer");
                return null;
            }

            // Find matching feature
            const pollingStationFeature = features.find(feature => {
                const attribute = feature.get(this.pollingStationAttribute);

                if (!attribute) {
                    return false;
                }

                // Handle both string and array attributes
                if (typeof attribute === 'string') {
                    const attributeArray = attribute.split(this.pollingStationAttributeSeparator);
                    return attributeArray.includes(pollingStationId);
                }

                // If attribute is already an array
                if (Array.isArray(attribute)) {
                    return attribute.includes(pollingStationId);
                }

                // Direct match
                return attribute === pollingStationId;
            });

            if (!pollingStationFeature) {
                console.warn("WahlRaumFinder: No polling station found with ID:", pollingStationId);
                this.showError();
            }
            return pollingStationFeature;
        },
        /**
         * MP 3.15.0: Use Vuex dispatch for both alert and loader
         */
        async showError () {
            await this.$store.dispatch("Alerting/addSingleAlert", {
                content: "<b>Entschuldigung</b><br>" +
                    "Bei der Abfrage ist etwas schiefgelaufen.<br>" +
                    "Das Portal konnte den zur Adresse zugehörigen Wahlraum nicht ermitteln.<br>" +
                    "Versuchen Sie bitte die Website neu zu starten.<br>" +
                    "Falls der Fehler immer noch auftritt, wenden Sie sich bitte an:<br>" +
                    "<a href='mailto:" + this.mailTo + "'>" + this.mailTo + "</a>"
            }, {root: true});
            // MP 3.x: hideLoader action doesn't exist - loading handled by SearchBar module
        },
        /**
         * MP 3.15.0: Use Vuex dispatch to get layer
         */
        async reset () {
            const layer = await this.$store.dispatch("Maps/addNewLayerIfNotExists", {layerName: "pollingStationMarker", alwaysOnTop: true}, {root: true});
            const source = layer.getSource();

            source.clear();
        },
        closeMobileOverlay () {
            this.close(false);
        },
        /**
         * Initialize hover tooltip for polling station marker
         * @param {number} retryCount - Number of retries attempted
         * @returns {void}
         */
        initializeHoverTooltip(retryCount = 0) {
            const map = mapCollection.getMap("2D");
            if (!map) {
                if (retryCount < 10) {
                    // Retry after 200ms if map not ready
                    setTimeout(() => this.initializeHoverTooltip(retryCount + 1), 200);
                } else {
                    console.warn("WahlRaumFinder: Map not ready for hover tooltip after retries");
                }
                return;
            }

            // Create tooltip element
            const tooltipElement = document.getElementById("wahlraum-hover-tooltip");
            if (!tooltipElement) {
                if (retryCount < 10) {
                    // Retry after 200ms if element not in DOM yet
                    setTimeout(() => this.initializeHoverTooltip(retryCount + 1), 200);
                } else {
                    console.warn("WahlRaumFinder: Tooltip element not found after retries");
                }
                return;
            }

            // Don't reinitialize if already exists
            if (this.hoverOverlay) {
                console.log("WahlRaumFinder: Hover tooltip already initialized");
                return;
            }

            // Create OpenLayers overlay for the tooltip
            this.hoverOverlay = new Overlay({
                element: tooltipElement,
                offset: [10, 0],
                positioning: "center-left",
                stopEvent: false
            });
            map.addOverlay(this.hoverOverlay);

            // Add pointermove listener
            this.pointerMoveListener = map.on("pointermove", (evt) => {
                // Guard against overlay not being initialized yet
                if (!this.hoverOverlay) {
                    return;
                }

                const pixel = evt.pixel;
                let featureFound = false;

                map.forEachFeatureAtPixel(pixel, (feature, layer) => {
                    // Show tooltip for polling station features from the wahlraeume layer
                    // or for the custom polling station marker
                    const layerId = layer?.get("id");
                    const featureId = feature.get("id");

                    if (layerId === this.pollingStationLayerId || featureId === "pollingStationFeature") {
                        const coordinate = evt.coordinate;

                        // Get properties from the feature itself
                        const featureProps = feature.getProperties();

                        // Build tooltip HTML using configured feature attributes
                        let tooltipHTML = "<strong>Wahlraum</strong><br>";

                        if (this.featureAttributes && typeof this.featureAttributes === 'object') {
                            Object.entries(this.featureAttributes).forEach(([propKey, displayName]) => {
                                const value = featureProps[propKey];
                                if (value !== undefined && value !== null) {
                                    tooltipHTML += `<strong>${displayName}:</strong> ${value}<br>`;
                                }
                            });
                        }

                        tooltipElement.innerHTML = tooltipHTML;
                        this.hoverOverlay.setPosition(coordinate);
                        tooltipElement.style.display = "block";
                        featureFound = true;
                        return true; // Stop iteration
                    }
                });

                // Hide tooltip if no feature found
                if (!featureFound) {
                    tooltipElement.style.display = "none";
                }
            });

            console.log("WahlRaumFinder: Hover tooltip initialized");
        },
        /**
         * Remove hover tooltip and clean up listeners
         * @returns {void}
         */
        removeHoverTooltip() {
            const map = mapCollection.getMap("2D");

            if (this.pointerMoveListener && map) {
                map.un("pointermove", this.pointerMoveListener);
                this.pointerMoveListener = null;
            }

            if (this.hoverOverlay && map) {
                map.removeOverlay(this.hoverOverlay);
                this.hoverOverlay = null;
            }

            const tooltipElement = document.getElementById("wahlraum-hover-tooltip");
            if (tooltipElement) {
                tooltipElement.style.display = "none";
            }

            console.log("WahlRaumFinder: Hover tooltip removed");
        }
    }
};
</script>

<template lang="html">
    <div
        v-if="active"
        id="wahllokalfinder"
    >
                <!-- {{ $t("additional:modules.tools.WahlRaumFinder.content") }} -->
                <div class="block">
                    <table class="table text">
                        <tr>
                            <td class="bold">
                                Adresse:
                            </td>
                            <td>{{ addressString }}</td>
                        </tr>
                        <tr>
                            <td class="bold">
                                Wahlbezirk:
                            </td>
                            <td>{{ addressPollingStationId }}</td>
                        </tr>
                    </table>
                </div>

                <div class="block">
                    <span class="title bold">Informationen zum Wahlraum:</span>
                    <table class="table text">
                        <tr
                            v-for="(value, key) in featureValues"
                            :key="key"
                        >
                            <td class="bold">
                                {{ key }}
                            </td>
                            <td>{{ value }}</td>
                        </tr>
                        <tr>
                            <td class="bold">
                                Distanz
                            </td>
                            <td>{{ distanceString }}</td>
                        </tr>
                    </table>
                </div>
                <button
                    v-if="isMobile"
                    class="btn btn-primary block mobile-btn-map"
                    @click="closeMobileOverlay"
                >
                    Zurück zur Karte
                </button>
    </div>
    <!-- Hover tooltip for polling station - positioned by OpenLayers Overlay -->
    <div
        id="wahlraum-hover-tooltip"
        class="wahlraum-tooltip"
    />
</template>

<style lang="scss" scoped>
    #wahllokalfinder {
        .block {
            padding: 10px;
        }
        .mobile-btn-map {
            position: absolute;
            width: 80%;
            left: 10%;
            bottom: 20px;
            background-color: #00aa9b;
            border-color: #00aa9b;
        }
    }
</style>

<style lang="scss">
    /* Tooltip styles - unscoped because OpenLayers needs to position it */
    .wahlraum-tooltip {
        position: absolute;
        background-color: white;
        border: 2px solid #00aa9b;
        border-radius: 4px;
        padding: 8px 12px;
        font-size: 12px;
        line-height: 1.4;
        pointer-events: none;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        display: none;

        strong {
            color: #00aa9b;
        }
    }
</style>
