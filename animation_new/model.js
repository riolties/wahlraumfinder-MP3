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
    const AnimationModel = Radio.request("ModelList", "getModelByAttributes", {id: "animationAddOn_new"}),
        defaults = {
            name: "Animation_new",
            glyphicon: "glyphicon-play-circle",
            url: "../muc_config/Pendler",
            filters: [
                {
                    title: "Zeige mir alle Pendler an mit",
                    defaultOptionText: "Bitte Option wählen",
                    attr: "name",
                    options: [
                        {
                            name: "Wohnort",
                            url: "/wohnort/kreise.json"
                        },
                        {
                            name: "Arbeitsort",
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
                    title: "in Kreis",
                    defaultOptionText: "Bitte Kreis wählen",
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
                    title: "in Gemeinde",
                    defaultOptionText: "Bitte Gemeinde wählen",
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
                title: "aber nur die",
                defaultOptionText: "Bitte einschränken",
                options: [3, 5, 10],
                selectedOption: undefined, // wird systemisch gesetzt
                optionPrefix: "Größten",
                isActive: false // wird systemisch gesetzt
            },
            colors: [],
            attrCount: "anzahl_pendler",
            attrLegend: "name",
            legend: [], // wird systemisch gesetzt
            legendUnit: "Personen"
        };

    Object.assign(AnimationModel, /** @lends AnimationModel.prototype */ {
        attributes: Object.assign(defaults, AnimationModel.attributes),
        initialize: function () {
            const layer = new VectorLayer({
                source: new VectorSource(),
                alwaysOnTop: true,
                style: null
            });

            this.superInitialize();
            this.setLayer(layer);
        },
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
            if (!isLastDropDown) {
                filters = this.clearFilterOptionsWithHigherIndex(filters, index);
                nextDropDown = filters[index + 1];
                nextDropDown.options = this.fetchOptions(dropDown.selectedOption, dropDown.query);
                this.setFilters(filters);
                this.toggleTopMost(false);
                this.resetLegend();
            }
            else {
                features = this.fetchOptions(dropDown.selectedOption, dropDown.query);
                this.setFeatures(features);
                this.toggleTopMost(true);
                this.prepareAnimation(features);
            }
            this.render();
        },
        selectTopMost: function (value) {
            const topMost = this.get("topMost"),
                features = this.get("features");

            topMost.selectedOption = value;
            this.setTopMost(topMost);
            this.prepareAnimation(features);
        },
        toggleTopMost: function (isActive) {
            const topMost = this.get("topMost");

            topMost.isActive = isActive;
            this.setTopMost(topMost);
        },
        prepareAnimation: function (features) {
            const topMost = this.get("topMost"),
                attrCount = this.get("attrCount"),
                attrLegend = this.get("attrLegend");
            let filteredFeatures = this.filterFeaturesByTopMost(features, topMost.selectedOption);

            filteredFeatures = this.sortFeaturesByAttr(filteredFeatures, attrCount);
            filteredFeatures = this.colorFeatures(filteredFeatures);
            this.setLegend(this.createLegend(filteredFeatures, attrCount, attrLegend));
            console.log(filteredFeatures);
            this.render();
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

        filterFeaturesByTopMost: function (features, selectedTopMost) {
            return features.slice(0, selectedTopMost);
        },
        findOptionByAttr: function (options, key, value) {
            let foundOption;

            options.forEach(option => {
                if (option[key] === value) {
                    foundOption = option;
                }
            });
            return foundOption;
        },
        clearFilterOptionsWithHigherIndex: function (filters, index) {
            filters.forEach((filter, filterIndex) => {
                if (filterIndex > index) {
                    filter.options = [];
                }
            });
            return filters;
        },
        fetchOptions: function (selectedOption, query) {
            let options;
            const value = selectedOption[query.attr];

            options = this.getResponseByQueryType(value, query.type);
            options = this.formatResponseByDataType(options, query.dataType);
            return options;
        },
        getResponseByQueryType: function (value, queryType) {
            const url = this.get("url");
            let response = "";

            if (queryType === "URL") {
                response = this.sendRequest(url + value);
            }
            // possible other queryTypes
            return response;
        },

        formatResponseByDataType: function (response, dataType) {
            const geoJsonFormat = new GeoJSON();
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
        resetLegend: function () {
            this.setLegend([]);
        },
        render: function () {
            this.trigger("render", this);
        },

        setLegend: function (value) {
            this.set("legend", value);
        },
        setLayer: function (value) {
            this.set("layer", value);
        },
        setFilters: function (value) {
            this.set("filters", value);
        },
        setFeatures: function (value) {
            this.set("features", value);
        },
        setTopMost: function (value) {
            this.set("topMost", value);
        }
    });

    AnimationModel.initialize();
    return AnimationModel;
}
export default initializeAnimationModel;
