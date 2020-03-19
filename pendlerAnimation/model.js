import {GeoJSON} from "ol/format.js";
/**
 * TODO
 * @returns {Object} The model.
 */
function initializePendlerAnimationModel () {
    const PendlerAnimationModel = Radio.request("ModelList", "getModelByAttributes", {id: "pendlerAnimation"}),
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
            sort: "desc"
        };

    Object.assign(PendlerAnimationModel, {
        attributes: Object.assign(defaults, PendlerAnimationModel.attributes),
        initialize: function () {
            const dataType = this.get("dataType"),
                url = Radio.request("Util", "getProxyURL", this.get("url"));

            this.listenTo(this, {
                "change:isActive": function (model, value) {
                    if (value) {
                        Radio.trigger("Attributions", "createAttribution", model.get("name"), this.get("attributionText"), "Pendler");
                    }
                    else {
                        Radio.trigger("Attributions", "removeAttribution", model.get("name"), this.get("attributionText"), "Pendler");
                    }
                }
            });
            this.superInitialize();
            this.prepareSelectedTopMost();
            this.loadData(dataType, url);
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
            this.setFilteredFeatures([]);
            this.setClasses(classes);
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
                levelsWithoutSelectedValues.forEach((level, idx) => {
                    if (idx > index) {
                        delete level.selectedValue;
                    }
                });
            }

            return levelsWithoutSelectedValues;
        },

        prepareAnimation: function (attr, level) {
            const selectedTopMost = this.get("selectedTopMost"),
                selection = this.get("filteredFeatures")[0],
                oppositeClassAttr = this.getOppositeClassAttr(attr, level);
            let filteredFeatures = this.filterFeaturesFromSelection(selection, attr);


            filteredFeatures = this.colorFeatures(filteredFeatures);
            filteredFeatures = this.sortFeaturesByAttr(filteredFeatures, this.get("attrCount"), this.get("sort"));
            filteredFeatures = this.filterFeaturesByTopMost(filteredFeatures, selectedTopMost);
            this.prepareLegend(filteredFeatures, oppositeClassAttr);
            this.centerToFocus(selection);
            console.log(filteredFeatures);
            this.render();
        },
        getOppositeClassAttr: function (attr, level) {
            const classes = this.get("classes"),
                selectedClass = this.get("selectedClass"),
                selectedClassName = selectedClass.name,
                oppositeClass = classes.filter(classObj => {
                    return classObj.name !== selectedClassName;
                })[0],
                oppositeClassAttr = oppositeClass.levels[level].attr;

            return oppositeClassAttr;
        },
        centerToFocus: function (selection) {
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

            Radio.trigger("MapView", "setCenter", coords);
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
                    color: this.rgbaArrayToString(feature.color),
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
            for (let i = 0; i < features.length; i++) {
                features[i].color = colors[i];
            }

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
        }
    });

    PendlerAnimationModel.initialize();
    return PendlerAnimationModel;
}
export default initializePendlerAnimationModel;
