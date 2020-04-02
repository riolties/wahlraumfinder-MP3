import {GeoJSON} from "ol/format.js";
import {Point, LineString} from "ol/geom.js";
import Feature from "ol/Feature.js";
import {Text, Circle, Fill, Stroke, Style} from "ol/style.js";
import VectorSource from "ol/source/Vector.js";
import VectorLayer from "ol/layer/Vector.js";
/**
 * TODO
 * @returns {Object} The model.
 */
function initializeAnimationModel () {
    const AnimationModel = Radio.request("ModelList", "getModelByAttributes", {id: "animationAddOn"}),
        defaults = {
            attributionText: "&copy; <a href='https://statistik.arbeitsagentur.de/' target='_blank'>Statistik der Bundesagentur für Arbeit</a>",
            dataType: "GeoJSON",
            url: "",
            classes: [],
            selectedClass: {},
            currentLevel: 0,
            colors: [],
            attrCount: "anzahl_pendler",
            legend: [],
            topMost: [3, 5, 10],
            selectedTopMost: undefined,
            sort: "desc",
            showPlayButton: false,
            animating: false,
            steps: 10,
            minPx: 5,
            maxPx: 20,
            showLineStringLayer: true,
            classesHelpText: "",
            topMostHelpText: ""
        };

    Object.assign(AnimationModel, /** @lends AnimationModel.prototype */ {
        attributes: Object.assign(defaults, AnimationModel.attributes),
        /**
         * @class AnimationModel
         * @extends Tool
         * @memberof Addons.Animation
         * @fires Core#RadioRequestUtilGetProxyURL
         * @fires Controls.Attributions#RadioTriggerAttributionsCreateAttribution
         * @fires Controls.Attributions#RadioTriggerAttributionsRemoveAttribution
         * @fires MapMarker#RadioTriggerMapMarkerHideMarker
         * @fires MapMarker#RadioTriggerMapMarkerShowMarker
         * @fires Core#RadioRequestMapCreateLayerIfNotExists
         * @fires Core#RadioTriggerMapRegisterListener
         * @fires Core#RadioTriggerMapUnregisterListener
         * @fires Core#RadioTriggerMapRender
         * @fires Core#RadioTriggerMapZoomToExtent
         * @fires Addons.Animation#render
         * @listens Addons.Animation#changeIsActive
         * @contructs
         */
        initialize: function () {
            const dataType = this.get("dataType"),
                url = Radio.request("Util", "getProxyURL", this.get("url")),
                layer = new VectorLayer({
                    source: new VectorSource(),
                    alwaysOnTop: true,
                    style: null
                });

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
            this.superInitialize();
            this.listenTo(Radio.channel("i18next"), {
                "languageChanged": this.changeLang
            });
            this.prepareSelectedTopMost();
            if (url) {
                this.loadData(dataType, url);
            }
            this.setLayer(layer);
            this.changeLang(i18next.language);
        },

        /**
         * Changes the language.
         * @returns {void}
         */
        changeLang: function () {
            this.set({
                name: i18next.t("additional:addOns.animationAddOn.name"),
                classesText: i18next.t("additional:addOns.animationAddOn.classesText"),
                classesHelpText: i18next.t("additional:addOns.animationAddOn.classesHelpText"),
                classesDefaultOptionText: i18next.t("additional:addOns.animationAddOn.classesDefaultOptionText"),
                topMostText: i18next.t("additional:addOns.animationAddOn.topMostText"),
                topMostHelpText: i18next.t("additional:addOns.animationAddOn.topMostHelpText"),
                legendUnit: i18next.t("additional:addOns.animationAddOn.legendUnit")
            });

            this.changeLangForClasses();
            this.changeLangForTopMostOptionPrefix();
            this.render();
        },

        /**
         * Changes the language for the classes attributes.
         * @returns {void}
         */
        changeLangForClasses: function () {
            const classes = this.get("classes");

            classes.forEach((classObj, classIndex) => {
                classObj.name = i18next.t("additional:addOns.animationAddOn.classes." + classIndex + ".name");
                classObj.levels.forEach((level, levelIndex) => {
                    level.title = i18next.t("additional:addOns.animationAddOn.classes." + classIndex + ".levels." + levelIndex + ".title");
                    level.levelHelpText = i18next.t("additional:addOns.animationAddOn.classes." + classIndex + ".levels." + levelIndex + ".levelHelpText");
                });
            });

            this.setClasses(classes);
        },

        /**
         * Changes the topMostOptionPrefix based on the sort attribute and the language.
         * @returns {void}
         */
        changeLangForTopMostOptionPrefix: function () {
            const sort = this.get("sort");

            if (sort === "asc") {
                this.set({
                    topMostOptionPrefix: i18next.t("additional:addOns.animationAddOn.topMostAscOptionPrefix")
                });
            }
            else if (sort === "desc") {
                this.set({
                    topMostOptionPrefix: i18next.t("additional:addOns.animationAddOn.topMostDescOptionPrefix")
                });
            }
        },

        /**
         * Selects the first topMost.
         * @returns {void}
         */
        prepareSelectedTopMost: function () {
            const topMost = this.get("topMost");
            let selectedTopMost = this.get("selectedTopMost");

            if (Array.isArray(topMost) && topMost.length > 0 && !selectedTopMost) {
                selectedTopMost = topMost[0];
            }

            this.setSelectedTopMost(selectedTopMost);
        },

        /**
         * Loads data and saves the features.
         * @param {String} dataType Datatype.
         * @param {String} url url.
         * @returns {void}
         */
        loadData: function (dataType, url) {
            let features = [];

            if (dataType === "GeoJSON") {
                features = this.loadDataFromGeoJson(url);
            }
            this.setFeatures(features);
        },

        /**
         * Loads the Data from GeoJSON datasource.
         * @param {*} url Url.
         * @returns {ol/feature[]} - ol features.
         */
        loadDataFromGeoJson: function (url) {
            const xhr = new XMLHttpRequest(),
                format = new GeoJSON();
            let features = [];

            xhr.open("GET", url, false);
            xhr.onreadystatechange = function (evt) {
                const responseText = evt.currentTarget.responseText;

                features = format.readFeatures(JSON.parse(responseText));
            };
            xhr.send();
            return features;
        },

        /**
         * Function that is triggered when a class is selected.
         * @param {String} className Class name.
         * @fires MapMarker#RadioTriggerMapMarkerHideMarker
         * @returns {void}
         */
        selectClass: function (className) {
            const currentLevel = 0,
                classes = this.get("classes");
            let selectedClass;

            this.stopAnimation();
            classes.forEach(classObj => {
                classObj.levels = this.unsetSelectedValues(classObj.levels);
            });
            this.setClasses(classes);
            Radio.trigger("MapMarker", "hideMarker");

            selectedClass = classes.filter(classPart => {
                return classPart.name === className;
            })[0];
            selectedClass = this.prepareLevel(selectedClass, currentLevel);
            this.resetLegend();
            this.setSelectedClass(selectedClass);
            this.setCurrentLevel(currentLevel);
            this.render();
        },

        /**
         * Function that is triggered when a level is selected.
         * @param {String} level Level.
         * @param {String} selection Selection.
         * @returns {void}
         */
        selectLevel: function (level, selection) {
            let selectedClass = this.get("selectedClass"),
                filteredFeatures = [];
            const maxLevel = selectedClass.levels.length,
                nextLevel = level + 1,
                hasNextLevel = nextLevel < maxLevel;

            this.stopAnimation();
            selectedClass.levels = this.unsetSelectedValues(selectedClass.levels, level);
            selectedClass.levels[level].selectedValue = selection;
            filteredFeatures = this.filterFeatures(selectedClass);
            this.setFilteredFeatures(filteredFeatures);

            if (hasNextLevel) {
                selectedClass = this.prepareLevel(selectedClass, nextLevel);
                this.setCurrentLevel(level);
                this.resetLegend();
            }
            else {
                this.prepareAnimation(level);
            }
            this.setSelectedClass(selectedClass);
            this.render();
        },

        /**
         * Unsets the selected Values.
         * @param {Object[]} levels Levels.
         * @param {Number} index Index.
         * @returns {Object[]} - Levels without selected values.
         */
        unsetSelectedValues: function (levels, index) {
            const levelsWithoutSelectedValues = levels;

            if (index) {
                delete levelsWithoutSelectedValues[index].selectedValue;
            }
            else {
                levelsWithoutSelectedValues.forEach(level => {
                    delete level.selectedValue;
                });
            }

            return levelsWithoutSelectedValues;
        },

        /**
         * Prepares the animation.
         * @param {*} level Level.
         * @returns {void}
         */
        prepareAnimation: function (level) {
            const selectedClass = this.get("selectedClass"),
                selectedTopMost = this.get("selectedTopMost"),
                selection = this.get("filteredFeatures")[0],
                oppositeClassAttr = this.getOppositeClassAttr(level),
                attrCount = this.get("attrCount");
            let filteredFeatures = this.filterFeaturesFromSelection(selectedClass);

            filteredFeatures = this.colorFeatures(filteredFeatures);
            filteredFeatures = this.sortFeaturesByAttr(filteredFeatures, attrCount, this.get("sort"));
            filteredFeatures = this.filterFeaturesByTopMost(filteredFeatures, selectedTopMost);
            this.prepareLegend(filteredFeatures, oppositeClassAttr);
            this.showMarkerOnFocus(selection);
            this.zoomToExtent(filteredFeatures);
            this.setFilteredFeatures(filteredFeatures);
            this.setMinVal(_.last(filteredFeatures).get(attrCount));
            this.setMaxVal(_.first(filteredFeatures).get(attrCount));
            this.prepareLineStringLayer(filteredFeatures, attrCount, oppositeClassAttr);
            if (this.get("showLineStringLayer")) {
                this.addLineStringLayerToMap();
            }
            this.setShowPlayButton(true);
            this.render();
        },

        /**
         * Prepares the line string layer.
         * @param {ol/Feature[]} relevantFeatures Features.
         * @param {String} attrCount Attribute for count.
         * @param {String} oppositeClassAttr Attribute for oppositeClass.
         * @returns {void}
         */
        prepareLineStringLayer: function (relevantFeatures, attrCount, oppositeClassAttr) {
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

            relevantFeatures.forEach(feature => {
                startPoint = feature.getGeometry().getFirstCoordinate();
                endPoint = feature.getGeometry().getLastCoordinate();
                steps = this.get("steps");
                directionX = (endPoint[0] - startPoint[0]) / steps;
                directionY = (endPoint[1] - startPoint[1]) / steps;
                lineCoords = [];
                count = feature.get(attrCount);
                name = feature.get(oppositeClassAttr);
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
         * Adds the line string layer to the map.
         * @fires Core#RadioRequestMapCreateLayerIfNotExists
         * @returns {void}
         */
        addLineStringLayerToMap: function () {
            const layer = Radio.request("Map", "createLayerIfNotExists", "animation_layer"),
                features = this.get("layer").getSource().getFeatures();

            layer.getSource().addFeatures(features);
        },

        /**
         * Stops the animation.
         * @param {ol/feature[]} features Features.
         * @fires Core#RadioRequestMapCreateLayerIfNotExists
         * @fires Core#RadioTriggerMapUnregisterListener
         * @returns {void}
         */
        stopAnimation: function (features) {
            const layer = Radio.request("Map", "createLayerIfNotExists", "animation_layer");

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
         * Gets the attribute of the oppisite class. Used for displaying purposes.
         * @param {Number} level Level.
         * @returns {String} - OppositeClassAttr.
         */
        getOppositeClassAttr: function (level) {
            const classes = this.get("classes"),
                selectedClass = this.get("selectedClass"),
                selectedClassName = selectedClass.name,
                oppositeClass = classes.filter(classObj => {
                    return classObj.name !== selectedClassName;
                })[0],
                oppositeClassAttr = oppositeClass.levels[level].attr;

            return oppositeClassAttr;
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
            var extent = [9999999, 9999999, 0, 0];

            features.forEach(feature => {
                var featureExtent = feature.getGeometry().getExtent();

                extent[0] = featureExtent[0] < extent[0] ? featureExtent[0] : extent[0];
                extent[1] = featureExtent[1] < extent[1] ? featureExtent[1] : extent[1];
                extent[2] = featureExtent[2] > extent[2] ? featureExtent[2] : extent[2];
                extent[3] = featureExtent[3] > extent[3] ? featureExtent[3] : extent[3];
            });
            return extent;
        },

        /**
         * Shows the Map marker.
         * @param {ol/feature} selection Selected Feature of interest.
         * @fires MapMarker#RadioTriggerMapMarkerShowMarker
         * @returns {void}
         */
        showMarkerOnFocus: function (selection) {
            let coords = [];
            const classes = this.get("classes"),
                selectedClass = this.get("selectedClass"),
                indexOfSelectedClass = classes.indexOf(selectedClass);

            if (indexOfSelectedClass === 0) {
                coords = selection.getGeometry().getFirstCoordinate();
            }
            else {
                coords = selection.getGeometry().getLastCoordinate();
            }

            Radio.trigger("MapMarker", "showMarker", coords);
        },

        /**
         * Prepares the legend
         * @param {ol/feature[]} filteredFeatures Features.
         * @param {String} attr Attribute name.
         * @returns {void}
         */
        prepareLegend: function (filteredFeatures, attr) {
            const legend = this.createLegend(filteredFeatures, attr);

            this.setLegend(legend);
        },

        /**
         * Creates the legend
         * @param {ol/feature[]} features Features.
         * @param {String} attr Attribute name.
         * @returns {Object[]} - Legend
         */
        createLegend: function (features, attr) {
            const legend = [];

            features.forEach(feature => {
                legend.push({
                    count: feature.get(this.get("attrCount")),
                    color: this.rgbaArrayToString(feature.get("color")),
                    name: feature.get(attr)
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
                features[index].set("color", colors[index]);
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
         * Filters the features from the selection.
         * @param {Object} selectedClass SelectedClass.
         * @param {String} attr Attribute
         * @returns {ol/feature[]} - filtered features.
         */
        filterFeaturesFromSelection: function (selectedClass) {
            const features = this.get("features");
            let filteredFeatures = features;

            selectedClass.levels.forEach(level => {
                const attr = level.attr,
                    value = level.selectedValue;

                filteredFeatures = filteredFeatures.filter(feature => {
                    return feature.get(attr) === value;
                });
            });
            return filteredFeatures;
        },

        /**
         * Sorts the feature by the given attribute name and mode.
         * @param {ol/feature[]} features Features to be sorted.
         * @param {String} attr Attr to be sorted by.
         * @param {String} mode Sort mode. "asc" or "desc".
         * @returns {ol/feature[]} - sorted features.
         */
        sortFeaturesByAttr: function (features, attr, mode) {
            if (mode === "desc") {
                features.sort(function (a, b) {
                    return b.get(attr) - a.get(attr);
                });
            }
            else if (mode === "asc") {
                features.sort(function (a, b) {
                    return a.get(attr) - b.get(attr);
                });
            }
            else {
                console.error("Sort mode '" + mode + "' not implemented yet, sorting desc");
                features.sort(function (a, b) {
                    return a.get(attr) - b.get(attr);
                });
            }

            return features;
        },

        /**
         * Filters the features by the selected top most.
         * @param {ol/feature[]} features Features to be filtered.
         * @param {Number} selectedTopMost Value top slice the array.
         * @returns {ol/feature[]} - top most selected features.
         */
        filterFeaturesByTopMost: function (features, selectedTopMost) {
            return features.slice(0, selectedTopMost);
        },

        /**
         * Prepares the level.
         * @param {Object} selectedClass Selected class.
         * @param {Number} level Level.
         * @returns {Object} - selected class with prepared level.
         */
        prepareLevel: function (selectedClass, level) {
            selectedClass.levels[level].values = this.getFeatureValuesByLevel(selectedClass, level);

            return selectedClass;
        },

        /**
         * Gets the feature values for the given level.
         * @param {Object} selectedClass Selected class.
         * @param {Number} level Level.
         * @returns {String[]} - The values for the level.
         */
        getFeatureValuesByLevel: function (selectedClass, level) {
            const levels = selectedClass.levels,
                filteredFeatures = this.filterFeatures(selectedClass);
            let values = [];

            levels.forEach((lvl, idx) => {
                if (idx <= level) {
                    filteredFeatures.forEach(feature => {
                        values.push(feature.get(lvl.attr));
                    });
                }
            });

            values = [...new Set(values)];
            values = values.sort();
            return values;
        },

        /**
         * Filteres the features of the selected class.
         * @param {Object} selectedClass Selected class.
         * @returns {ol/feature[]} - Selected features.
         */
        filterFeatures: function (selectedClass) {
            const levels = selectedClass.levels;
            let filteredFeatures = this.get("features");

            levels.forEach(level => {
                if (level.hasOwnProperty("selectedValue")) {
                    filteredFeatures = filteredFeatures.filter(feature => {
                        return feature.get(level.attr) === level.selectedValue;
                    });
                }
            });
            return filteredFeatures;
        },

        /**
         * Selects the top most features.
         * @param {Number} value Number of features to select.
         * @returns {void}
         */
        selectTopMost: function (value) {
            const selectedClass = this.get("selectedClass"),
                level = selectedClass.levels.length - 1;

            this.setSelectedTopMost(value);
            this.stopAnimation();
            this.prepareAnimation(level);
        },

        /**
         * Resets the legen.
         * @returns {void}
         */
        resetLegend: function () {
            this.setLegend([]);
        },

        /**
         * Triggers the view to render itself.
         * @fires Addons.Animation#render
         * @returns {void}
         */
        render: function () {
            this.trigger("render", this, true);
        },

        /**
         * Setter for attribute "features"
         * @param {*} value Value.
         * @returns {void}
         */
        setFeatures: function (value) {
            this.set("features", value);
        },

        /**
         * Setter for attribute "selectedClass"
         * @param {*} value Value.
         * @returns {void}
         */
        setSelectedClass: function (value) {
            this.set("selectedClass", value);
        },

        /**
         * Setter for attribute "currentLevel"
         * @param {*} value Value.
         * @returns {void}
         */
        setCurrentLevel: function (value) {
            this.set("currentLevel", value);
        },

        /**
         * Setter for attribute "filteredFeatures"
         * @param {*} value Value.
         * @returns {void}
         */
        setFilteredFeatures: function (value) {
            this.set("filteredFeatures", value);
        },

        /**
         * Setter for attribute "legend"
         * @param {*} value Value.
         * @returns {void}
         */
        setLegend: function (value) {
            this.set("legend", value);
        },

        /**
         * Setter for attribute "selectedTopMost"
         * @param {*} value Value.
         * @returns {void}
         */
        setSelectedTopMost: function (value) {
            this.set("selectedTopMost", value);
        },

        /**
         * Setter for attribute "classes"
         * @param {*} value Value.
         * @returns {void}
         */
        setClasses: function (value) {
            this.set("classes", value);
        },

        /**
         * Setter for attribute "layer"
         * @param {*} value Value.
         * @returns {void}
         */
        setLayer: function (value) {
            this.set("layer", value);
        },

        /**
         * Setter for attribute "showPlayButton"
         * @param {*} value Value.
         * @returns {void}
         */
        setShowPlayButton: function (value) {
            this.set("showPlayButton", value);
        },

        /**
         * Setter for attribute "postcomposeListener"
         * @param {*} value Value.
         * @returns {void}
         */
        setPostcomposeListener: function (value) {
            this.set("postcomposeListener", value);
        },

        /**
         * Setter for attribute "animationLayer"
         * @param {*} value Value.
         * @returns {void}
         */
        setAnimationLayer: function (value) {
            this.set("animationLayer", value);
        },

        /**
         * Setter for attribute "animating"
         * @param {*} value Value.
         * @returns {void}
         */
        setAnimating: function (value) {
            this.set("animating", value);
        },

        /**
         * Setter for attribute "now"
         * @param {*} value Value.
         * @returns {void}
         */
        setNow: function (value) {
            this.set("now", value);
        },

        /**
         * Setter for attribute "minVal"
         * @param {*} value Value.
         * @returns {void}
         */
        setMinVal: function (value) {
            this.set("minVal", value);
        },

        /**
         * Setter for attribute "maxVal"
         * @param {*} value Value.
         * @returns {void}
         */
        setMaxVal: function (value) {
            this.set("maxVal", value);
        }
    });

    AnimationModel.initialize();
    return AnimationModel;
}
export default initializeAnimationModel;
