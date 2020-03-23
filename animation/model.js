import {GeoJSON} from "ol/format.js";
import {Point, LineString} from "ol/geom.js";
import Feature from "ol/Feature.js";
import {Text, Circle, Fill, Style} from "ol/style.js";
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
            attrCount: "anzahl",
            legend: [],
            topMost: [],
            selectedTopMost: undefined,
            sort: "desc",
            showPlayButton: false,
            animating: false,
            steps: 10,
            minPx: 5,
            maxPx: 20
        };

    Object.assign(AnimationModel, {
        attributes: Object.assign(defaults, AnimationModel.attributes),
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
                    }
                }
            });
            this.superInitialize();
            this.prepareSelectedTopMost();
            this.loadData(dataType, url);
            this.setLayer(layer);
        },
        prepareSelectedTopMost: function () {
            const topMost = this.get("topMost");
            let selectedTopMost = this.get("selectedTopMost");

            if (Array.isArray(topMost) && topMost.length > 0 && !selectedTopMost) {
                selectedTopMost = topMost[0];
            }

            this.setSelectedTopMost(selectedTopMost);
        },

        loadData: function (dataType, url) {
            let features = [];

            if (dataType === "GeoJSON") {
                features = this.loadDataFromGeoJson(url);
            }
            this.setFeatures(features);
        },

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
        selectClass: function (className) {
            const currentLevel = 0,
                classes = this.get("classes");
            let selectedClass;

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

        selectLevel: function (level, selection) {
            let selectedClass = this.get("selectedClass"),
                filteredFeatures = [];
            const maxLevel = selectedClass.levels.length,
                nextLevel = level + 1,
                hasNextLevel = nextLevel < maxLevel;

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
                this.prepareAnimation(selectedClass.levels[level].attr, level);
            }
            this.setSelectedClass(selectedClass);
            this.render();
        },

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

        prepareAnimation: function (attr, level) {
            const selectedTopMost = this.get("selectedTopMost"),
                selection = this.get("filteredFeatures")[0],
                oppositeClassAttr = this.getOppositeClassAttr(level),
                attrCount = this.get("attrCount");
            let filteredFeatures = this.filterFeaturesFromSelection(selection, attr);

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
            this.setShowPlayButton(true);
            this.render();
        },

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
                name;

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

                for (i = 0; i <= steps; i++) {
                    newEndPt = new Point([startPoint[0] + (i * directionX), startPoint[1] + (i * directionY), 0]);

                    lineCoords.push(newEndPt.getCoordinates());
                }

                line = new Feature({
                    geometry: new LineString(lineCoords),
                    color: feature.get("color")
                });
                line.set(this.get("attrCount"), count);
                line.set("name", name);
                layer.getSource().addFeature(line);
            });

        },

        startAnimation: function () {
            this.stopAnimation();
            this.setPostcomposeListener(Radio.request("Map", "registerListener", "postcompose", this.moveFeature.bind(this)));
            this.setAnimating(true);
            this.setNow(new Date().getTime());
            Radio.trigger("Map", "render");
            this.render();
        },

        stopAnimation: function (features) {
            const layer = Radio.request("Map", "createLayerIfNotExists", "animation_layer");

            layer.getSource().clear();
            Radio.trigger("Map", "unregisterListener", this.get("postcomposeListener"));
            this.setAnimating(false);
            this.render();
            if (features) {
                layer.getSource().addFeatures(features);
            }
        },

        moveFeature: function (event) {
            const vectorContext = event.vectorContext,
                frameState = event.frameState,
                features = this.get("layer").getSource().getFeatures(),
                elapsedTime = frameState.time - this.get("now"),
                index = Math.round(elapsedTime / 100);
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
                        textAlign: "left"
                    })
                });

            return style;
        },
        calculateRadius: function (value) {
            const minVal = this.get("minVal"),
                maxVal = this.get("maxVal"),
                deltaMinMaxVal = maxVal - minVal,
                minPx = this.get("minPx"),
                maxPx = this.get("maxPx"),
                deltaMinMaxPx = maxPx - minPx,
                deltaVal = value - minVal,
                percentage = (deltaVal / deltaMinMaxVal) * 100,
                radius = Math.round(minPx + (percentage * (deltaMinMaxPx / 100)));

            return radius;
        },

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
        zoomToExtent: function (features) {
            const extent = this.calculateExtent(features);

            Radio.trigger("Map", "zoomToExtent", extent);
        },
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
        prepareLegend: function (filteredFeatures, attr) {
            const legend = this.createLegend(filteredFeatures, attr);

            this.setLegend(legend);
        },
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

        filterFeaturesFromSelection: function (selection, attr) {
            const features = this.get("features"),
                value = selection.get(attr);
            let filteredFeatures = [];

            filteredFeatures = features.filter(feature => {
                return feature.get(attr) === value;
            });
            return filteredFeatures;
        },
        sortFeaturesByAttr: function (features, attr, mode) {
            if (mode === "desc") {
                features.sort(function (a, b) {
                    return b.get(attr) - a.get(attr);
                });
            }
            else {
                features.sort(function (a, b) {
                    return a.get(attr) - b.get(attr);
                });
            }

            return features;
        },
        filterFeaturesByTopMost: function (features, selectedTopMost) {
            return features.slice(0, selectedTopMost);
        },

        prepareLevel: function (selectedClass, level) {
            selectedClass.levels[level].values = this.getFeatureValuesByLevel(selectedClass, level);

            return selectedClass;
        },

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

        selectTopMost: function (value) {
            const selectedClass = this.get("selectedClass"),
                level = selectedClass.levels.length - 1;

            this.setSelectedTopMost(value);
            this.prepareAnimation(selectedClass.levels[level].attr, level);
        },

        resetLegend: function () {
            this.setLegend([]);
        },

        render: function () {
            this.trigger("render", this, true);
        },

        setFeatures: function (value) {
            this.set("features", value);
        },
        setSelectedClass: function (value) {
            this.set("selectedClass", value);
        },
        setCurrentLevel: function (value) {
            this.set("currentLevel", value);
        },
        setFilteredFeatures: function (value) {
            this.set("filteredFeatures", value);
        },
        setLegend: function (value) {
            this.set("legend", value);
        },
        setSelectedTopMost: function (value) {
            this.set("selectedTopMost", value);
        },
        setClasses: function (value) {
            this.set("classes", value);
        },
        setLayer: function (value) {
            this.set("layer", value);
        },
        setShowPlayButton: function (value) {
            this.set("showPlayButton", value);
        },
        setPostcomposeListener: function (value) {
            this.set("postcomposeListener", value);
        },
        setAnimationLayer: function (value) {
            this.set("animationLayer", value);
        },
        setAnimating: function (value) {
            this.set("animating", value);
        },
        setNow: function (value) {
            this.set("now", value);
        },
        setMinVal: function (value) {
            this.set("minVal", value);
        },
        setMaxVal: function (value) {
            this.set("maxVal", value);
        }
    });

    AnimationModel.initialize();
    return AnimationModel;
}
export default initializeAnimationModel;
