import Tool from "../../modules/core/modelList/tool/model";
import {GeoJSON} from "ol/format.js";
import {Point, LineString} from "ol/geom.js";
import Feature from "ol/Feature.js";
import {Text, Circle, Fill, Stroke, Style} from "ol/style.js";
import VectorSource from "ol/source/Vector.js";
import VectorLayer from "ol/layer/Vector.js";
import {getMapProjection} from "masterportalAPI/src/crs";

const AnimationModel = Tool.extend(/** @lends AnimationModel.prototype */{
    defaults: Object.assign({}, Tool.prototype.defaults, {
        type: "tool",
        parentId: "tools",
        id: "animationAddOn",
        name: "AddOn:PendlerAnimation", // wird systemisch gesetzt aus Übersetzung
        nameTranslationKey: "additional:addOns.animationAddOn.name",
        glyphicon: "glyphicon-play-circle",
        attributionText: "&copy; <a href='https://statistik.arbeitsagentur.de/' target='_blank'>Statistik der Bundesagentur für Arbeit</a><br>&copy; GeoBasis-DE / BKG, Statistisches Bundesamt (Destatis) (2018)",
        url: "../muc_config/Pendler",
        filters: [
            {
                title: "Zeige mir alle Pendler an mit", // wird systemisch gesetzt aus Übersetzung
                defaultOptionText: "Bitte Ziel wählen", // wird systemisch gesetzt aus Übersetzung
                helpText: "Wähle hier das Ziel der Pendler", // wird systemisch gesetzt aus Übersetzung
                attr: "name",
                options: [
                    {
                        name: "Wohnort", // wird systemisch gesetzt aus Übersetzung
                        url: "/wohnort/kreise.json"
                    },
                    {
                        name: "Arbeitsort", // wird systemisch gesetzt aus Übersetzung
                        url: "/arbeitsort/kreise.json"
                    }
                ],
                selectedOption: undefined, // wird systemisch gesetzt
                query: {
                    type: "URL",
                    attr: "url",
                    dataType: "JSON"
                }
            },
            {
                title: "in Kreis", // wird systemisch gesetzt aus Übersetzung
                defaultOptionText: "Bitte Kreis wählen", // wird systemisch gesetzt aus Übersetzung
                helpText: "Wähle hier den Kreis", // wird systemisch gesetzt aus Übersetzung
                attr: "name",
                options: [], // wird systemisch gesetzt
                selectedOption: undefined, // wird systemisch gesetzt
                query: {
                    type: "URL",
                    attr: "url",
                    dataType: "JSON"
                }
            },
            {
                title: "in Gemeinde", // wird systemisch gesetzt aus Übersetzung
                defaultOptionText: "Bitte Gemeinde wählen", // wird systemisch gesetzt aus Übersetzung
                helpText: "Wähle hier die Gemeinde", // wird systemisch gesetzt aus Übersetzung
                attr: "name",
                options: [], // wird systemisch gesetzt
                selectedOption: undefined, // wird systemisch gesetzt
                query: {
                    type: "URL",
                    attr: "url",
                    dataType: "GeoJSON"
                }
            }
        ],
        features: [], // wird systemisch gesetzt
        topMost: {
            title: "", // wird systemisch gesetzt aus Übersetzung
            defaultOptionText: "", // wird systemisch gesetzt aus Übersetzung
            helpText: "", // wird systemisch gesetzt aus Übersetzung
            options: [3, 5, 10],
            selectedOption: undefined, // wird systemisch gesetzt
            optionPrefix: "", // wird systemisch gesetzt
            isActive: false // wird systemisch gesetzt
        },
        colors: [],
        attrCount: "anzahl_pendler",
        attrLegend: "name",
        legend: [], // wird systemisch gesetzt
        legendUnit: "Personen", // wird systemisch gesetzt aus Übersetzung
        steps: 10,
        minPx: 5,
        maxPx: 20,
        showLineStringLayer: true,
        showPlayButton: false, // wird systemisch gesetzt
        animating: false, // wird systemisch gesetzt
        now: undefined // wird systemisch gesetzt
    }),

    /**
     * @class AnimationModel
     * @extends Tool
     * @memberof Addons.Animation
     * @listens Addons.Animation#changeIsActive
     * @listens i18next#RadioTriggerLanguageChanged
     * @fires Controls.Attributions#RadioTriggerAttributionsCreateAttribution
     * @fires Controls.Attributions#RadioTriggerAttributionsRemoveAttribution
     * @fires MapMarker#RadioTriggerMapMarkerHideMarker
     * @fires Core#RadioRequestMapCreateLayerIfNotExists
     * @fires Addons.Animation#render
     * @contructs
     */
    initialize: function () {
        const layer = new VectorLayer({
            source: new VectorSource(),
            alwaysOnTop: true,
            style: null
        });

        this.changeLang();
        this.superInitialize();
        this.listenTo(this, {
            "change:isActive": function (model, value) {
                if (value) {
                    Radio.trigger("Attributions", "createAttribution", model.get("name"), this.get("attributionText"), "Pendler");
                }
                else {
                    Radio.trigger("Attributions", "removeAttribution", model.get("name"), this.get("attributionText"), "Pendler");
                    Radio.trigger("MapMarker", "hideMarker");
                    this.stopAnimation();
                }
            }
        });
        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.changeLang
        });
        this.setLayer(layer);
        this.setAnimationLayer(Radio.request("Map", "createLayerIfNotExists", "animation_layer"));
    },

    /**
     * Sets the properties that have to be translated.
     * @returns {void}
     */
    changeLang: function () {
        this.set({
            name: i18next.t("additional:addOns.animationAddOn.name"),
            legendUnit: i18next.t("additional:addOns.animationAddOn.legendUnit")
        });
        this.changeLangForFilters();
        this.changeLangForTopMost();
        this.updateNameForMenuEntry();
        this.render();
    },

    /**
     * Dirty hack to overwrite name in menu. Is for initial loading.
     * @returns {void}
     */
    updateNameForMenuEntry: function () {
        const menuModel = Radio.request("ModelList", "getModelByAttributes", {id: this.get("id")});

        menuModel.set("name", this.get("name"));
    },

    /**
     * Sets the properties for filters, that have to be translated.
     * @returns {void}
     */
    changeLangForFilters: function () {
        const filters = this.get("filters");

        filters.forEach((filter, filterIndex) => {
            filter.title = i18next.t("additional:addOns.animationAddOn.filters." + filterIndex + ".title");
            filter.defaultOptionText = i18next.t("additional:addOns.animationAddOn.filters." + filterIndex + ".defaultOptionText");
            filter.helpText = i18next.t("additional:addOns.animationAddOn.filters." + filterIndex + ".helpText");
            if (filterIndex === 0) {
                filter.options.forEach((option, optionIndex) => {
                    option.name = i18next.t("additional:addOns.animationAddOn.filters." + filterIndex + ".options." + optionIndex + ".name");
                });
            }
        });
        this.setFilters(filters);
    },

    /**
     * Sets the properties for topMost, that have to be translated.
     * @returns {void}
     */
    changeLangForTopMost: function () {
        const topMost = this.get("topMost");

        topMost.title = i18next.t("additional:addOns.animationAddOn.topMost.title");
        topMost.defaultOptionText = i18next.t("additional:addOns.animationAddOn.topMost.defaultOptionText");
        topMost.helpText = i18next.t("additional:addOns.animationAddOn.topMost.helpText");
        topMost.optionPrefix = i18next.t("additional:addOns.animationAddOn.topMost.optionPrefix");
        this.setTopMost(topMost);
    },

    /**
     * Selects a dropdown option based on index of filters and value
     * @param {Number} index Index
     * @param {*} value Value of selection.
     * @returns {void}
     */
    selectDropDownAtIndex: function (index, value) {
        let filters = this.get("filters"),
            nextDropDown,
            features;
        const dropDown = filters[index],
            options = dropDown.options,
            name = dropDown.attr,
            selectedOption = this.findOptionByAttr(options, name, value),
            isLastDropDown = index + 1 === filters.length;

        dropDown.selectedOption = selectedOption;
        this.resetAll();
        if (!isLastDropDown) {
            filters = this.clearFilterOptionsWithHigherIndex(filters, index);
            nextDropDown = filters[index + 1];
            nextDropDown.options = this.fetchOptions(dropDown.selectedOption, dropDown.query);
            this.setFilters(filters);
        }
        else {
            features = this.fetchOptions(dropDown.selectedOption, dropDown.query);
            this.setFeatures(features);
            this.toggleTopMost(true);
            this.prepareAnimation(features);
        }
        this.render();
    },

    /**
     * Resets all Settings
     * @fires MapMarker#RadioTriggerMapMarkerHideMarker
     * @returns {void}
     */
    resetAll: function () {
        this.toggleTopMost(false);
        this.resetLegend();
        this.resetAnimationLayer();
        this.setAnimating(false);
        this.setShowPlayButton(false);
        Radio.trigger("MapMarker", "hideMarker");
    },

    /**
     * Selects the dropdown and prepares the animation
     * @param {*} value Value of selected option
     * @returns {void}
     */
    selectTopMost: function (value) {
        const topMost = this.get("topMost"),
            features = this.get("features");

        topMost.selectedOption = value;
        this.setTopMost(topMost);
        this.resetAnimationLayer();
        this.prepareAnimation(features);
    },

    /**
     * Toggles topMost if it is active.
     * @param {Boolean} isActive Flag if topMost is active or not.
     * @returns {void}
     */
    toggleTopMost: function (isActive) {
        const topMost = this.get("topMost");

        topMost.isActive = isActive;
        this.setTopMost(topMost);
    },

    /**
     * Prepares the animation
     * @param {ol/feature[]} features Features.
     * @returns {void}
     */
    prepareAnimation: function (features) {
        const topMost = this.get("topMost"),
            attrCount = this.get("attrCount"),
            attrLegend = this.get("attrLegend");
        let filteredFeatures = this.sortFeaturesByAttr(features, attrCount);

        filteredFeatures = this.filterFeaturesByTopMost(filteredFeatures, topMost.selectedOption);

        filteredFeatures = this.colorFeatures(filteredFeatures);
        this.setLegend(this.createLegend(filteredFeatures, attrCount, attrLegend));
        this.showMarkerOnFocus(filteredFeatures[0]);
        this.zoomToExtent(filteredFeatures);
        this.setMinVal(_.last(filteredFeatures).get(attrCount));
        this.setMaxVal(_.first(filteredFeatures).get(attrCount));
        this.prepareLineStringLayer(filteredFeatures, attrCount, attrLegend);
        if (this.get("showLineStringLayer")) {
            this.addLineStringLayerToMap();
        }
        this.setShowPlayButton(true);
        this.render();
    },

    /**
     * Shows the Map marker.
     * @param {ol/feature} feature Feature.
     * @fires MapMarker#RadioTriggerMapMarkerShowMarker
     * @returns {void}
     */
    showMarkerOnFocus: function (feature) {
        const coords = this.deriveCoordinates(feature);

        Radio.trigger("MapMarker", "showMarker", coords);
    },

    /**
     * Resets the animation layer
     * @returns {void}
     */
    resetAnimationLayer: function () {
        const animationLayer = this.get("animationLayer");

        animationLayer.getSource().clear();
    },

    /**
     * Derives the Coordinates from the given feature
     * @param {ol/feature} feature Feature of interest
     * @returns {Number[]} - Coordinates of the features.
     */
    deriveCoordinates: function (feature) {
        const firstFilter = this.get("filters")[0],
            selectedOption = firstFilter.selectedOption,
            index = firstFilter.options.indexOf(selectedOption);
        let coords = [];

        if (index === 0) {
            coords = feature.getGeometry().getFirstCoordinate();
        }
        else {
            coords = feature.getGeometry().getLastCoordinate();
        }
        return coords;
    },

    /**
     * Zooms to the extent of the given features.
     * @param {ol/feature[]} features Features.
     * @fires Core#RadioTriggerMapZoomToExtent
     * @returns {void}
     */
    zoomToExtent: function (features) {
        const extent = this.calculateExtent(features);

        Radio.trigger("Map", "zoomToExtent", extent);
    },

    /**
     * Calculates teh extent based on the given features.
     * @param {ol/feature[]} features Features.
     * @returns {Number[]} - Extent of the features.
     */
    calculateExtent: function (features) {
        const extent = [9999999, 9999999, 0, 0];

        features.forEach(feature => {
            const featureExtent = feature.getGeometry().getExtent();

            extent[0] = featureExtent[0] < extent[0] ? featureExtent[0] : extent[0];
            extent[1] = featureExtent[1] < extent[1] ? featureExtent[1] : extent[1];
            extent[2] = featureExtent[2] > extent[2] ? featureExtent[2] : extent[2];
            extent[3] = featureExtent[3] > extent[3] ? featureExtent[3] : extent[3];
        });
        return extent;
    },

    /**
     * Prepares the line string layer.
     * @param {ol/Feature[]} features Features.
     * @param {String} attrCount Attribute for count.
     * @param {String} attrLegend Attribute for oppositeClass.
     * @returns {void}
     */
    prepareLineStringLayer: function (features, attrCount, attrLegend) {
        const layer = this.get("layer");
        let startPoint,
            endPoint,
            steps,
            directionX,
            directionY,
            lineCoords,
            line,
            newEndPt,
            i,
            count,
            name,
            color;

        layer.getSource().clear();

        features.forEach(feature => {
            startPoint = feature.getGeometry().getFirstCoordinate();
            endPoint = feature.getGeometry().getLastCoordinate();
            steps = this.get("steps");
            directionX = (endPoint[0] - startPoint[0]) / steps;
            directionY = (endPoint[1] - startPoint[1]) / steps;
            lineCoords = [];
            count = feature.get(attrCount);
            name = feature.get(attrLegend);
            color = feature.get("color");

            for (i = 0; i <= steps; i++) {
                newEndPt = new Point([startPoint[0] + (i * directionX), startPoint[1] + (i * directionY), 0]);

                lineCoords.push(newEndPt.getCoordinates());
            }

            line = new Feature({
                geometry: new LineString(lineCoords),
                color: color
            });
            line.set(this.get("attrCount"), count);
            line.set("name", name);
            line.setStyle(this.createLineStringStyle(color));
            layer.getSource().addFeature(line);
        });
    },

    /**
     * Creates line string style.
     * @param {String} color Color.
     * @returns {ol/Style} - style.
     */
    createLineStringStyle: function (color) {
        const style = new Style({
            stroke: new Stroke({
                color: color,
                width: 2
            })
        });

        return style;
    },

    /**
     * Adds the line string layer to the map.
     * @fires Core#RadioRequestMapCreateLayerIfNotExists
     * @returns {void}
     */
    addLineStringLayerToMap: function () {
        const layer = this.get("animationLayer"),
            features = this.get("layer").getSource().getFeatures();

        layer.getSource().addFeatures(features);
    },
    /**
     * Creates the legend
     * @param {ol/feature[]} features Features.
     * @param {String} attrCount Attribute for number.
     * @param {String} attrLegend Attribute for legend.
     * @returns {Object[]} - Legend
     */
    createLegend: function (features, attrCount, attrLegend) {
        const legend = [];

        features.forEach(feature => {
            legend.push({
                count: feature.get(attrCount),
                color: this.rgbaArrayToString(feature.get("color")),
                name: feature.get(attrLegend)
            });
        }, this);

        return legend;
    },

    /**
     * Converts an rgb array into and rgb string.
     * @param {Number[]} rgbArray Array.
     * @returns {String} - rgb string.
     */
    rgbaArrayToString: function (rgbArray) {
        let rgbString = "";

        if (rgbArray.length === 3) {
            rgbString = "rgb(";
        }
        else if (rgbArray.length === 4) {
            rgbString = "rgba(";
        }
        rgbString += rgbArray.toString();
        rgbString += ")";

        return rgbString;
    },

    /**
     * Starts the animation.
     * @returns {void}
     */
    startAnimation: function () {
        this.stopAnimation();
        this.setPostcomposeListener(Radio.request("Map", "registerListener", "postcompose", this.moveFeature.bind(this)));
        this.setAnimating(true);
        this.setNow(new Date().getTime());
        if (this.get("showLineStringLayer")) {
            this.addLineStringLayerToMap();
        }
        Radio.trigger("Map", "render");
        this.render();
    },

    /**
     * Stops the animation.
     * @param {ol/feature[]} features Features.
     * @fires Core#RadioRequestMapCreateLayerIfNotExists
     * @fires Core#RadioTriggerMapUnregisterListener
     * @returns {void}
     */
    stopAnimation: function (features) {
        const layer = this.get("animationLayer");

        layer.getSource().clear();
        Radio.trigger("Map", "unregisterListener", this.get("postcomposeListener"));
        this.setAnimating(false);
        this.render();
        if (features) {
            if (this.get("showLineStringLayer")) {
                this.addLineStringLayerToMap();
            }
            layer.getSource().addFeatures(features);
        }
    },

    /**
     * Pauses the animation.
     * @returns {void}
     */
    pauseAnimation: function () {
        const currentTime = new Date().getTime(),
            index = this.calculateIndexByElapsedTime(currentTime);
        let features = this.get("layer").getSource().getFeatures();

        features = this.draw(undefined, features, index);
        this.stopAnimation(features);
    },
    /**
     * Moves the feature.
     * @param {event} event Event.
     * @fires Core#RadioTriggerMapRender
     * @returns {void}
     */
    moveFeature: function (event) {
        const vectorContext = event.vectorContext,
            frameState = event.frameState,
            features = this.get("layer").getSource().getFeatures(),
            index = this.calculateIndexByElapsedTime(frameState.time);
        let pointFeatures = [];


        if (this.get("animating") && index <= this.get("steps")) {
            this.draw(vectorContext, features, index);
            Radio.trigger("Map", "render");
        }
        else if (index > this.get("steps")) {
            pointFeatures = this.draw(undefined, features, index - 1);
            this.stopAnimation(pointFeatures);
        }
        else {
            this.stopAnimation();
        }
    },

    /**
     * Calculates the Index by the elapsed Time.
     * @param {Number} time Time.
     * @returns {Number} - Index.
     */
    calculateIndexByElapsedTime: function (time) {
        const now = this.get("now"),
            elapsedTime = time - now,
            index = Math.round(elapsedTime / 100);

        return index;
    },

    /**
     * Draws the features.
     * @param {*} vectorContext context.
     * @param {ol/feature[]} features Features.
     * @param {Number} index Index.
     * @returns {ol/feature[]} - generated PointFeatures.
     */
    draw: function (vectorContext, features, index) {
        let currentPoint,
            newFeature,
            coordinates,
            style;
        const attrCount = this.get("attrCount"),
            pointFeatures = [];

        features.forEach(feature => {
            coordinates = feature.getGeometry().getCoordinates();
            style = this.preparePointStyle(feature.get(attrCount), feature.get("color"), feature.get("name"));

            currentPoint = new Point(coordinates[index]);
            newFeature = new Feature(currentPoint);
            newFeature.setStyle(style);
            pointFeatures.push(newFeature);
            if (vectorContext) {
                vectorContext.drawFeature(newFeature, style);
            }
        }, this);
        return pointFeatures;
    },

    /**
     * Creates a point style.
     * @param {String} value Value to be shown.
     * @param {String} color Color of circle.
     * @param {String} name Name to be shown.
     * @returns {ol/Style} - Point style.
     */
    preparePointStyle: function (value, color, name) {
        const radius = this.calculateRadius(value),
            style = new Style({
                image: new Circle({
                    radius: radius,
                    fill: new Fill({color: color})
                }),
                text: new Text({
                    text: name + ": " + value,
                    offsetX: radius,
                    fill: new Fill({
                        color: "#000"
                    }),
                    stroke: new Stroke({
                        color: "#fff",
                        width: 2
                    }),
                    textAlign: "left"
                })
            });

        return style;
    },

    /**
     * Calculates the radius based on the value, and mins and maxs of px and values.
     * @param {Number} value Value.
     * @returns {Number} - radius.
     */
    calculateRadius: function (value) {
        const minVal = this.get("minVal"),
            maxVal = this.get("maxVal"),
            deltaMinMaxVal = maxVal - minVal === 0 ? 1 : maxVal - minVal,
            minPx = this.get("minPx"),
            maxPx = this.get("maxPx"),
            deltaMinMaxPx = maxPx - minPx,
            deltaVal = value - minVal === 0 ? 1 : value - minVal,
            percentage = (deltaVal / deltaMinMaxVal) * 100,
            radius = Math.round(minPx + (percentage * (deltaMinMaxPx / 100)));

        return radius;
    },

    /**
     * Sorts the feature by the given attribute name descending.
     * @param {ol/feature[]} features Features to be sorted.
     * @param {String} attr Attr to be sorted by.
     * @returns {ol/feature[]} - sorted features.
     */
    sortFeaturesByAttr: function (features, attr) {
        features.sort(function (a, b) {
            return b.get(attr) - a.get(attr);
        });

        return features;
    },
    /**
     * Colors the features. Sets for each feature an attribute "color".
     * @param {ol/feature[]} features Features.
     * @returns {ol/feature[]} - Features with color attribute.
     */
    colorFeatures: function (features) {
        let colors = this.get("colors");

        // Wenn zu wenig Farben konfiguriert wurden wird ein alternatives Farbschema berechnet und angewendet (als Fallback)
        if (colors.length < features.length) {
            console.warn("Die Anzahl an konfigurierten Farben reicht zur Darstellung der Ergebnisse nicht aus. Generiere ein alternatives Farbschema.");
            colors = this.generateColors(features.length);
        }

        // Füge eine Farbe zur Darstellung hinzu
        features.forEach((feature, index) => {
            feature.set("color", colors[index]);
        });

        return features;
    },

    /**
     * Generates colors. As many colors are generated as the amout says.
     * @param {Number} amount Number of colors to create.
     * @returns {Number[]} - generated colors.
     */
    generateColors: function (amount) {
        const colors = [],
            max = 255,
            min = 0,
            range = max - min;
        let i = 0,
            red,
            green,
            blue,
            alpha;

        // generate random rgba-color-arrays
        for (i = 0; i < amount; i++) {
            red = Math.floor(Math.random() * range) + min;
            green = Math.floor(Math.random() * range) + min;
            blue = Math.floor(Math.random() * range) + min;
            alpha = 0.75;
            colors.push([red, green, blue, alpha]);
        }
        return colors;
    },

    /**
     * Filters the features by the selected topMost value
     * @param {ol/feature[]} features Features to be filtered
     * @param {Number} selectedTopMost The value of the topMost selection
     * @returns {ol/feature[]} - The filtered features.
     */
    filterFeaturesByTopMost: function (features, selectedTopMost) {
        return features.slice(0, selectedTopMost);
    },

    /**
     * Finds the option by given attribute.
     * @param {Object[]} options Options.
     * @param {String} key Key.
     * @param {*} value Value.
     * @returns {Object} - The found option.
     */
    findOptionByAttr: function (options, key, value) {
        let foundOption;

        options.forEach(option => {
            if (option[key] === value) {
                foundOption = option;
            }
        });
        return foundOption;
    },

    /**
     * Clears the filter options with a higher index than the given index.
     * @param {Object[]} filters Filters.
     * @param {Number} index Index.
     * @returns {Object[]}- Filters with cleared options.
     */
    clearFilterOptionsWithHigherIndex: function (filters, index) {
        filters.forEach((filter, filterIndex) => {
            if (filterIndex > index) {
                filter.options = [];
                filter.selectedOption = undefined;
            }
        });
        return filters;
    },

    /**
     * Fetches the options by the selected Option and queryType.
     * @param {Object} selectedOption The selected option.
     * @param {Object} query The query object to request and parse the data.
     * @returns {*} - fetched options.
     */
    fetchOptions: function (selectedOption, query) {
        let options;
        const value = selectedOption[query.attr];

        options = this.getResponseByQueryType(value, query.type);
        options = this.formatResponseByDataType(options, query.dataType);
        return options;
    },

    /**
     * Gets the response based on the query type.
     * @param {String} value Value from selection.
     * @param {String} queryType Type of query.
     * @returns {*} - unparsed response of url.
     */
    getResponseByQueryType: function (value, queryType) {
        const url = this.get("url");
        let response = "";

        if (queryType === "URL") {
            response = this.sendRequest(url + value);
        }
        // possible other queryTypes
        return response;
    },

    /**
     * Formats the response based on the dataType.
     * @param {String} response Plain response.
     * @param {String} dataType Data type to parse the data.
     * @returns {Object[]} - formatted data.
     */
    formatResponseByDataType: function (response, dataType) {
        const map = Radio.request("Map", "getMap"),
            proj = getMapProjection(map),
            geoJsonFormat = new GeoJSON({
                // dataProjection: "EPSG:4326", // default projection
                featureProjection: proj
            });
        let formattedResponse = [];

        if (dataType === "JSON") {
            formattedResponse = JSON.parse(response);
        }
        else if (dataType === "GeoJSON") {
            formattedResponse = geoJsonFormat.readFeatures(JSON.parse(response));
        }
        // possible other dataTypes
        return formattedResponse;
    },

    /**
     * Sends the get request.
     * @param {*} url Url.
     * @returns {String} - response data string.
     */
    sendRequest: function (url) {
        const xhr = new XMLHttpRequest(),
            proxiedUrl = Radio.request("Util", "getProxyURL", url);
        let response;

        xhr.open("GET", proxiedUrl, false);
        xhr.onreadystatechange = function (evt) {
            const responseText = evt.currentTarget.responseText;

            response = responseText;
        };
        xhr.send();
        return response;
    },

    /**
     * Resets legend
     * @returns {void}
     */
    resetLegend: function () {
        this.setLegend([]);
    },

    /**
     * Renders the tool
     * @fires Addons.Animation#render
     * @returns {void}
     */
    render: function () {
        this.trigger("render", this);
    },

    /**
     * Setter for attribute "legend".
     * @param {*} value Value.
     * @returns {void}
     */
    setLegend: function (value) {
        this.set("legend", value);
    },

    /**
     * Setter for attribute "layer".
     * @param {*} value Value.
     * @returns {void}
     */
    setLayer: function (value) {
        this.set("layer", value);
    },

    /**
     * Setter for attribute "animationLayer".
     * @param {*} value Value.
     * @returns {void}
     */
    setAnimationLayer: function (value) {
        this.set("animationLayer", value);
    },

    /**
     * Setter for attribute "filters".
     * @param {*} value Value.
     * @returns {void}
     */
    setFilters: function (value) {
        this.set("filters", value);
    },

    /**
     * Setter for attribute "features".
     * @param {*} value Value.
     * @returns {void}
     */
    setFeatures: function (value) {
        this.set("features", value);
    },

    /**
     * Setter for attribute "topMost".
     * @param {*} value Value.
     * @returns {void}
     */
    setTopMost: function (value) {
        this.set("topMost", value);
    },

    /**
     * Setter for attribute "minVal".
     * @param {*} value Value.
     * @returns {void}
     */
    setMinVal: function (value) {
        this.set("minVal", value);
    },

    /**
     * Setter for attribute "maxVal".
     * @param {*} value Value.
     * @returns {void}
     */
    setMaxVal: function (value) {
        this.set("maxVal", value);
    },

    /**
     * Setter for attribute "showPlayButton".
     * @param {*} value Value.
     * @returns {void}
     */
    setShowPlayButton: function (value) {
        this.set("showPlayButton", value);
    },

    /**
     * Setter for attribute "postcomposeListener".
     * @param {*} value Value.
     * @returns {void}
     */
    setPostcomposeListener: function (value) {
        this.set("postcomposeListener", value);
    },
    /**
     * Setter for attribute "animating".
     * @param {*} value Value.
     * @returns {void}
     */
    setAnimating: function (value) {
        this.set("animating", value);
    },

    /**
     * Setter for attribute "now".
     * @param {*} value Value.
     * @returns {void}
     */
    setNow: function (value) {
        this.set("now", value);
    }
});

export default AnimationModel;
