import {WFS} from "ol/format.js";
import {equalTo} from "ol/format/filter";
import Feature from "ol/Feature";
import {Point, LineString} from "ol/geom";
import {Circle, Fill, Stroke, Text, Style} from "ol/style.js";
import getProxyUrl from "../../src/utils/getProxyUrl";

/**
 * @returns {void}
 */
function initializeWahllokalFinderModel () {
    const WahllokalFinderModel = Radio.request("ModelList", "getModelByAttributes", {id: "wahllokalFinder"}),
        defaults = {
            name: "Wahllokalfinder",
            glyphicon: "glyphicon-list",
            mergeByCoordinates: false,
            attributesToMap: {},
            isMobile: false,
            addressLayerId: "",
            addressLayerPollingStationAttribute: "",
            pollingStationLayerId: "",
            featureAttributes: {},
            addressString: "",
            featureValues: {},
            distanceString: "",
            isVisibleInMenu: false,
            mailTo: ""
        };

    Object.assign(WahllokalFinderModel, /** @lends WahllokalFinderModel.prototype*/ {
        attributes: Object.assign(defaults, WahllokalFinderModel.attributes),
        /**
         * @class WahllokalFinderModel
         * @description This module reacts to a click on the recommendedList of the searchbar (address).
         * The hits coordinate is used to generate a getFeatureInfo-Request on a configurable layer.
         * From the gfi result feature the configured attribute is derived.
         * This derived attribute is taken to get the feature of the pollingStationLayerId.
         * In the end the Map zooms to the extent of the address's coordinate and the coordinate of the election booth.
         * @extends Tool
         * @memberof AddOns.WahllokalFinder
         * @constructs
         * @property {String} name="Wahllokalfinder" Name of tool.
         * @property {String} glyphicon="glyphicon-list" Glyphicon of tool.
         * @property {Boolean} mergeByCoordinates=false Flag if Features should be merged by coordinates.
         * @property {String} addressLayerId="" Id of address layer (WMS) to get feature.
         * @property {String} addressLayerPollingStationAttribute="" Attribute name of addressLayerFeature to derive from simulated GFI on addressLayer.
         * @property {String} pollingStationLayerId="" Id of pollingStation layer (WFS) to get corresponding election booth to address.
         * @property {Object} featureAttributes={} Object to map the features attributes.
         * @property {Boolean} isVisibleInMenu=false Flag if Tool is visible in menu.
         * @listens Searchbar#RadioTriggerSearchbarHit
         * @fires Alerting#RadioTriggerAlertAlert
         * @fires Core#RadioTriggerMapZoomToExtent
         * @fires MapMarker#RadioTriggerMapMarkerShowMarker
         * @fires Core.ModelList#RadioRequestModelListGetModelByAttributes
         * @fires Core#RadioRequestMapViewGetOptions
         * @fires Core#RadioRequestMapViewGetProjection
         * @fires Core#RadioRequestUtilGetProxyURL
         * @fires AddOns.WahllokalFinder#show
         * @fires AddOns.WahllokalFinder#hide
         */
        initialize: function () {
            this.checkForNeccessaryAttributes();

            if (this.get("mergeByCoordinates")) {
                this.listenTo(Radio.channel("VectorLayer"), {
                    "featuresLoaded": this.featuresLoaded
                }, this);
            }
            this.listenTo(Radio.channel("Searchbar"), {
                "hit": this.mainProcess
            }, this);

            this.setIsMobile(Radio.request("Util", "isViewMobile"));
        },

        /**
         * Checks for the given attributes and triggers an message.
         * @fires Alerting#RadioTriggerAlertAlert
         * @returns {void}
         */
        checkForNeccessaryAttributes: function () {
            const errorText = "<strong>Fehler in der Konfiguration des Wahllokalfinders</strong><br>",
                neccessaryAttributes = ["addressLayerId", "pollingStationLayerId", "addressLayerPollingStationAttribute"];
            let tempArray = [];

            neccessaryAttributes.forEach(attr => {
                if (this.get(attr) === "") {
                    tempArray.push(attr);
                }
            });

            if (tempArray.length === 0) {
                Radio.trigger("Alert", "alert", {
                    text: "<b>Willkommen beim Wahllokalfinder!</b><br>" +
                    "Bitte geben Sie in der Suchfunktion eine Adresse an um Ihr zuständiges Wahllokal zu finden.<br><br>",
                    confirmable: true
                });
            }
            else {
                tempArray = tempArray.toString().replace(/,/g, ", ");
                Radio.trigger("Alert", "alert", errorText + "Folgende Attribute sind fehlerhaft konfiguriert:<br>" + tempArray);
            }
        },

        featuresLoaded: function (layerId) {
            let layer,
                source,
                features;
            const attributesToMap = this.get("attributesToMap");

            if (layerId === this.get("pollingStationLayerId")) {
                layer = Radio.request("ModelList", "getModelByAttributes", {id: layerId});
                source = layer ? layer.get("layerSource") : undefined;
                features = source ? source.getFeatures() : [];
                if (attributesToMap && typeof attributesToMap === "object") {
                    features = this.mapAttributes(features, attributesToMap);
                }
                features = this.mergeFeaturesByCoordinates(features);
                source.clear();
                source.addFeatures(features);
            }
        },

        mergeFeaturesByCoordinates: function (features) {
            let mergedFeatures = [],
                things,
                xy,
                xy2;
            const indices = [];

            features.forEach((feature, index) => {
                if (!indices.includes(index)) {
                    things = [];
                    xy = feature.getGeometry().getCoordinates();
                    features.forEach((feature2, index2) => {
                        xy2 = feature2.getGeometry().getCoordinates();
                        if (this.isEqual(xy, xy2)) {
                            things.push(feature2);
                            indices.push(index2);
                        }
                    }, this);
                    mergedFeatures.push(things);
                }
            }, this);
            mergedFeatures = this.mergeAttributesOfMergedFeatures(mergedFeatures);
            mergedFeatures = this.flattenArray(mergedFeatures);
            return mergedFeatures;
        },
        flattenArray: function (array) {
            return Array.isArray(array) ? array.reduce((acc, val) => acc.concat(val), []) : array;
        },
        isEqual: function (arr1, arr2) {
            let isEqual = false;

            if (JSON.stringify(arr1) === JSON.stringify(arr2)) {
                isEqual = true;
            }
            return isEqual;
        },

        mergeAttributesOfMergedFeatures: function (mergedFeatures) {
            const mergedFeaturesWithMergedAttributes = [];

            mergedFeatures.forEach(features => {
                let keys = [],
                    mergedFeature = features;

                keys = this.getAllDistinctKeys(mergedFeature);
                mergedFeature = this.aggregateProperties(mergedFeature, keys);
                mergedFeaturesWithMergedAttributes.push(mergedFeature);
            });
            return mergedFeaturesWithMergedAttributes;
        },
        getAllDistinctKeys: function (features) {
            let keys = [];

            features.forEach(feature => {
                keys.push(feature.getKeys());
            });
            keys = this.flattenArray(keys);
            keys = [...new Set(keys)];
            keys = keys.filter(key => key !== "shape");
            return keys;
        },

        aggregateProperties: function (featureArray, keys) {
            const aggregatedProperties = {},
                newFeature = featureArray[0];

            keys.forEach(key => {
                let valuesArray = featureArray.map(feature => feature.get(key));

                valuesArray = [...new Set(valuesArray)];
                aggregatedProperties[key] = valuesArray.join(" | ");
            });
            newFeature.setProperties(aggregatedProperties);
            return [newFeature];
        },

        mapAttributes: function (features, map) {
            features.forEach(feature => {
                Object.keys(map).forEach(key => {
                    this.mapAttribute(feature, key, map[key]);
                });
            });
            return features;
        },
        mapAttribute: function (feature, key, valuesArray) {
            const featureValue = feature.get(key);

            valuesArray.forEach(mapValue => {
                let value = mapValue.value,
                    valueAsInt;
                const mappedValue = mapValue.mappedValue;

                if (value === "undefined") {
                    value = undefined;
                }
                if (Array.isArray(value)) {
                    value.forEach(val => {
                        let valueFromArray = val;

                        if (valueFromArray === "undefined") {
                            valueFromArray = undefined;
                        }
                        if (valueFromArray === "parseInt") {
                            valueAsInt = !isNaN(parseInt(feature.get(key), 10)) ? parseInt(feature.get(key), 10) : feature.get(key);
                            feature.set(key, valueAsInt);
                        }
                        if (featureValue === valueFromArray) {
                            feature.set(key, mappedValue);
                        }
                    });
                }
                if (value === "parseInt") {
                    valueAsInt = !isNaN(parseInt(feature.get(key), 10)) ? parseInt(feature.get(key), 10) : feature.get(key);
                    feature.set(key, valueAsInt);
                }
                else if (featureValue === value) {
                    feature.set(key, mappedValue);
                }
            });
        },

        /**
         * Starts the main process.
         * @param {Object} hit Hit triggered via searchbar.
         * @fires AddOns.WahllokalFinder#show
         * @fires AddOns.WahllokalFinder#hide
         * @returns {void}
         */
        mainProcess: function (hit) {
            const addressString = hit.name,
                addressCoord = hit.coordinate,
                gfiUrl = addressCoord ? this.getGfiUrl(addressCoord, this.get("addressLayerId")) : undefined,
                pollingStationId = gfiUrl ? this.derivePollingStationFromAddress(gfiUrl) : undefined,
                pollingStationFeature = pollingStationId ? this.derivePollingStationFromWfs(pollingStationId) : undefined;
            let featureCoord = [],
                extent = [],
                featureValues,
                distanceString;

            if (pollingStationFeature) {
                this.placeMarker(addressCoord);
                featureCoord = pollingStationFeature.getGeometry().getCoordinates();
                extent = this.createExtent(addressCoord, featureCoord, 100);
                distanceString = this.calculateDistanceString(addressCoord, featureCoord);
                this.addLayerOnMap(addressCoord, featureCoord, distanceString);
                this.setExtentToMap(extent);
                featureValues = this.prepareFeature(pollingStationFeature);
                this.setAddressString(addressString);
                this.setFeatureValues(featureValues);
                this.setDistanceString(distanceString);
                this.deactivateFilter();
                this.trigger("show");
            }
            else {
                this.trigger("hide");
            }
        },
        deactivateFilter: function () {
            const filter = Radio.request("ModelList", "getModelByAttributes", {id: "filter"}),
                isActive = filter.get("isActive");

            if (isActive) {
                filter.setIsActive(false);
            }
        },

        /**
         * Prepares the feature's attributes.
         * @param {ol/Feature} feature Feature.
         * @returns {Object} - features mapped attributes.
         */
        prepareFeature: function (feature) {
            let obj = {};

            feature.getKeys().forEach(key => {
                obj[key] = feature.get(key);
            });
            obj = this.mapFeatureAttributes(obj, this.get("featureAttributes"));

            return obj;
        },

        /**
         * Maps feature Attributes
         * @param {Object} obj Attributes of Feature.
         * @param {Object} featureAttributes Attributes to map.
         * @returns {Object} - mapped feature Attributes.
         */
        mapFeatureAttributes: function (obj, featureAttributes) {
            const mappedObj = {};

            Object.keys(featureAttributes).forEach(attr => {
                if (obj[attr] === "1") {
                    mappedObj[featureAttributes[attr]] = "Nein";
                }
                else if (obj[attr] === undefined) {
                    mappedObj[featureAttributes[attr]] = "Ja";
                }
                else {
                    mappedObj[featureAttributes[attr]] = isNaN(parseInt(obj[attr], 10)) === false ? parseInt(obj[attr], 10) : obj[attr];
                }
            });

            return mappedObj;
        },

        /**
         * Creates a layer and adds it to the map. The layer gets 2 circle Features for the coordinates.
         * @param {Number[]} addressCoord Coordinate of adress.
         * @param {Number[]} featureCoord Coordinate of polling station feature.
         * @param {String} distanceString Distance
         * @returns {void}
         */
        addLayerOnMap: function (addressCoord, featureCoord, distanceString) {
            const layer = Radio.request("Map", "createLayerIfNotExists", "pollingStationMarker"),
                source = layer.getSource(),
                addressFeature = this.createPointFeatureAndSetStyle(addressCoord, "addressFeature", 50, "#ff0000", "Adresse"),
                pollingStationFeature = this.createPointFeatureAndSetStyle(featureCoord, "pollingStationFeature", 50, "#0000ff", "Wahllokal"),
                distanceFeature = this.createLineFeatureAndSetStyle(addressCoord, featureCoord, "distanceFeature", "#000000", distanceString);

            source.clear();
            source.addFeature(addressFeature);
            source.addFeature(pollingStationFeature);
            source.addFeature(distanceFeature);
        },

        /**
         * Calculates the direct distance between the given coordinates.
         * @param {Number[]} addressCoord Coordinate of address.
         * @param {Number[]} featureCoord Coordinate of polling station.
         * @returns {Number} - Distance betweeen the adress and the polling station.
         */
        calculateDistanceString: function (addressCoord, featureCoord) {
            const deltaX = addressCoord[0] - featureCoord[0],
                deltaY = addressCoord[1] - featureCoord[1];
            let distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));

            distance = "ca." + Math.round(distance) + "m (Luftlinie)";
            return distance;
        },

        /**
         * Creates an ol point feature from the given params including styling.
         * @param {Number[]} coord Coordinates.
         * @param {String} id Id of feature.
         * @param {Number} radius Radius of style.
         * @param {String} color Color of style.
         * @param {String} text Text to be shown.
         * @returns {Feature} - The created Feature with defined style
         */
        createPointFeatureAndSetStyle: function (coord, id, radius, color, text) {
            const feature = new Feature({
                    geometry: new Point(coord),
                    id: id
                }),
                textStyle = new Text({
                    text: text,
                    scale: 2,
                    offsetY: -(radius + 10),
                    fill: new Fill({
                        color: color
                    }),
                    stroke: new Stroke({
                        color: "#ffffff",
                        width: 2
                    })
                }),
                style = new Style({
                    image: new Circle({
                        radius: radius,
                        stroke: new Stroke({
                            color: color,
                            width: 5
                        })
                    }),
                    text: textStyle
                });

            feature.setStyle(style);
            return feature;
        },

        /**
         * Creates an ol line feature from the given params including styling.
         * @param {Number[]} coord1 Coordinates from address.
         * @param {Number[]} coord2 Coordinates from polling station.
         * @param {String} id Id of feature.
         * @param {String} color Color of style.
         * @param {Number} distanceString Distance to be shown in text.
         * @returns {Feature} - The created Feature with defined style
         */
        createLineFeatureAndSetStyle: function (coord1, coord2, id, color, distanceString) {
            const feature = new Feature({
                    geometry: new LineString([coord1, coord2]),
                    id: id
                }),
                textStyle = new Text({
                    text: distanceString,
                    scale: 2,
                    textAlign: "left",
                    offsetX: 10,
                    fill: new Fill({
                        color: color
                    }),
                    stroke: new Stroke({
                        color: "#ffffff",
                        width: 2
                    })
                }),
                style = new Style({
                    stroke: new Stroke({
                        color: color,
                        width: 5,
                        lineDash: [5, 10]
                    }),
                    text: textStyle
                });

            feature.setStyle(style);
            return feature;
        },

        /**
         * Generates the extent
         * @param {Number[]} addressCoord Coordinate of adress.
         * @param {Number[]} featureCoord Coordinate of pollingStation.
         * @param {Number} offset Offset, so that the features are not at the edge of the extent.
         * @returns {Number[]} - Extent of both coordinates.
         */
        createExtent: function (addressCoord, featureCoord, offset) {
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

        /**
         * Checks if coord is valid.
         * @param {Number[]} coord Coordinate to be checked.
         * @returns {Boolean} - Flag if given coord was valid.
         */
        isValidCoord: function (coord) {
            const isArray = Array.isArray(coord),
                isLength = isArray && (coord.length === 2 || coord.length === 3) || false,
                isNumber = isArray ? coord.every(function (element) {
                    return typeof element === "number";
                }) : false;

            return isArray && isLength && isNumber;
        },

        /**
         * Sets the maps extent.
         * @param {Number[]} extent Extent.
         * @fires Core#RadioTriggerMapZoomToExtent
         * @returns {void}
         */
        setExtentToMap: function (extent) {
            Radio.trigger("Map", "zoomToExtent", extent);
        },

        /**
         * Places marker on coord.
         * @param {Number[]} coord Coordinate.
         * @fires MapMarker#RadioTriggerMapMarkerShowMarker
         * @returns {void}
         */
        placeMarker: function (coord) {
            Radio.trigger("MapMarker", "showMarker", coord);
        },

        /**
         * generates the getGfi url.
         * @param {Number[]} coord Coordinate.
         * @param {String} addressLayerId Id of address Layer.
         * @fires Core.ModelList#RadioRequestModelListGetModelByAttributes
         * @fires Core#RadioRequestMapViewGetOptions
         * @fires Core#RadioRequestMapViewGetProjection
         * @returns {String} - gfiUrl.
         */
        getGfiUrl: function (coord, addressLayerId) {
            const layer = Radio.request("ModelList", "getModelByAttributes", {id: addressLayerId}),
                resolution = Radio.request("MapView", "getOptions").resolution,
                projection = Radio.request("MapView", "getProjection"),
                // gfiUrl = layer.get("layerSource").getGetFeatureInfoUrl(coord, resolution, projection, {INFO_FORMAT: layer.get("infoFormat"), FEATURE_COUNT: layer.get("featureCount")});
                gfiUrl = layer.get("layerSource").getFeatureInfoUrl(coord, resolution, projection, {INFO_FORMAT: layer.get("infoFormat"), FEATURE_COUNT: layer.get("featureCount")});

            return gfiUrl;
        },

        /**
         * derives the pollingStation id from gfiUrl.
         * @param {String} url GfiUrl to be sent.
         * @returns {String} - polling station id.
         */
        derivePollingStationFromAddress: function (url) {
            const proxyUrl = getProxyUrl(url),
                xhr = new XMLHttpRequest(),
                that = this;
            let pollingStationId;

            xhr.open("GET", proxyUrl, false);
            xhr.onload = function (event) {
                pollingStationId = that.parseAddressResponse(event);
            };
            xhr.onerror = function () {
                Radio.trigger("Alert", "alert", {
                    text: "<b>Entschuldigung</b><br>" +
                    "Bei der Abfrage ist etwas schiefgelaufen.<br>" +
                    "Das Portal konnte das zur Adresse zugehörige Wahllokal nicht ermitteln.<br>" +
                    "Versuchen Sie bitte die Website neu zu starten.<br>" +
                    "Falls der Fehler immer noch auftritt, wenden Sie sich bitte an:<br>" +
                    "<a href='mailto:" + this.get("mailTo") + "'>" + this.get("mailTo") + "</a>",
                    confirmable: true
                });
            };
            xhr.send();
            return pollingStationId;
        },

        /**
         * Parses the polling station id from the response.
         * @param {Event} event Response event.
         * @returns {String} - pollingStation id.
         */
        parseAddressResponse: function (event) {
            const currentTarget = event.currentTarget,
                status = currentTarget.status,
                response = currentTarget.response,
                wfsReader = new WFS(),
                addressLayerPollingStationAttribute = this.get("addressLayerPollingStationAttribute");
            let feature,
                pollingStationId;

            if (status === 200) {
                feature = wfsReader.readFeature(response);
                pollingStationId = feature.get(addressLayerPollingStationAttribute);
            }
            else {
                Radio.trigger("Alert", "alert", {
                    text: "<b>Entschuldigung</b><br>" +
                    "Bei der Abfrage ist etwas schiefgelaufen.<br>" +
                    "Das Portal konnte das zur Adresse zugehörige Wahllokal nicht ermitteln.<br>" +
                    "Versuchen Sie bitte die Website neu zu starten.<br>" +
                    "Falls der Fehler immer noch auftritt, wenden Sie sich bitte an:<br>" +
                    "<a href='mailto:" + this.get("mailTo") + "'>" + this.get("mailTo") + "</a>",
                    confirmable: true
                });
            }
            return pollingStationId;
        },

        /**
         * Derives the polling Station from WFS by sending getFeature request.
         * @param {String} pollingStationId Id of polling station.
         * @returns {void}
         */
        derivePollingStationFromWfs: function (pollingStationId) {
            const layer = Radio.request("ModelList", "getModelByAttributes", {id: this.get("pollingStationLayerId")}),
                srsName = "EPSG:25832",
                WfsGetFeature = new WFS().writeGetFeature({
                    featureNS: layer.get("featureNS"),
                    featureTypes: [layer.get("featureType")],
                    srsName: srsName,
                    filter: equalTo("wbz", pollingStationId)
                }),
                that = this,
                xhr = new XMLHttpRequest(),
                url = getProxyUrl(layer.get("url"));
            let wahllokalFeature;

            xhr.open("POST", url, false);
            xhr.onload = function (event) {
                wahllokalFeature = that.parseWfsResponse(event);
            };
            xhr.onerror = function () {
                Radio.trigger("Alert", "alert", {
                    text: "<b>Entschuldigung</b><br>" +
                    "Bei der Abfrage ist etwas schiefgelaufen.<br>" +
                    "Das Portal konnte das zur Adresse zugehörige Wahllokal nicht ermitteln.<br>" +
                    "Versuchen Sie bitte die Website neu zu starten.<br>" +
                    "Falls der Fehler immer noch auftritt, wenden Sie sich bitte an:<br>" +
                    "<a href='mailto:" + this.get("mailTo") + "'>" + this.get("mailTo") + "</a>",
                    confirmable: true
                });
            };
            xhr.send(new XMLSerializer().serializeToString(WfsGetFeature));

            return wahllokalFeature;
        },

        /**
         * Parses the WFS response to a feature.
         * @param {Event} event Event of get feature request.
         * @returns {ol/Feature} - The response Feature.
         */
        parseWfsResponse: function (event) {
            const currentTarget = event.currentTarget,
                status = currentTarget.status,
                response = currentTarget.response,
                wfsReader = new WFS();
            let wahllokalFeature;

            if (status === 200) {
                wahllokalFeature = wfsReader.readFeature(response);
            }
            else {
                Radio.trigger("Alert", "alert", {
                    text: "<strong>Entschuldigung!</strong>" +
                    "<br> Der Dienst um das Wahllokal zur eingegebenen Adresse zu finden, reagiert leider nicht.<br>" +
                    "Bitte versuchen Sie es erneut!<br>" +
                    "<small>Status: " + status + "</small><br>" +
                    "<small>Response: " + response + "</small><br>"
                });
            }
            return wahllokalFeature;
        },

        /**
         * Setter for attribute "featureValues".
         * @param {Object} value FeatureValues.
         * @returns {void}
         */

        setFeatureValues: function (value) {
            this.set("featureValues", value);
        },

        /**
         * Setter for attribute "addressString".
         * @param {String} value addressString.
         * @returns {void}
         */

        setAddressString: function (value) {
            this.set("addressString", value);
        },

        /**
         * Setter for attribute "distanceString".
         * @param {String} value distanceString.
         * @returns {void}
         */
        setDistanceString: function (value) {
            this.set("distanceString", value);
        },

        /**
         * Setter for attribute "isMobile".
         * @param {Boolean} value isMobile.
         * @returns {void}
         */
        setIsMobile: function (value) {
            this.set("isMobile", value);
        }
    });
    WahllokalFinderModel.initialize();
    return WahllokalFinderModel;
}
export default initializeWahllokalFinderModel;
