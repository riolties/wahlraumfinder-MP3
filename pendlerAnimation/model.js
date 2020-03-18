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
            currentLevel: 0
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
            this.loadData(dataType, url);
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
            let selectedClass = this.get("classes").filter(classPart => {
                return classPart.name === className;
            })[0];

            selectedClass = this.prepareNextLevel(selectedClass, 0);
            selectedClass.levels = this.unsetSelectedValues(selectedClass.levels);
            this.setSelectedClass(selectedClass);
            this.setCurrentLevel(0);
            this.render();
        },

        selectLevel: function (level, selection) {
            let selectedClass = this.get("selectedClass");
            const maxLevel = selectedClass.levels.length,
                nextLevel = level + 1,
                hasNextLevel = nextLevel < maxLevel;

            selectedClass.levels[level].selectedValue = selection;
            if (hasNextLevel) {
                selectedClass = this.prepareNextLevel(selectedClass, nextLevel);
                this.setCurrentLevel(level);
            }
            else {
                console.log(this.get("filteredFeatures"));
            }
            this.setSelectedClass(selectedClass);
            this.render();
        },

        unsetSelectedValues: function (levels, index) {
            const levelsWithoutSelectedValues = levels;

            levelsWithoutSelectedValues.forEach((level, index2) => {
                if (index && index === index2) {
                    level.selectedValue = undefined;
                }
                else {
                    level.selectedValue = undefined;
                }
            });
            return levelsWithoutSelectedValues;
        },
        prepareNextLevel: function (selectedClass, level) {
            const features = this.get("features"),
                filteredFeatures = this.filterFeaturesByLevel(features, selectedClass, level);

            selectedClass.levels = this.unsetSelectedValues(selectedClass.levels, level);
            selectedClass.levels[level].values = this.getFeatureValuesByLevel(filteredFeatures, selectedClass.levels[level]);
            return selectedClass;
        },

        filterFeaturesByLevel: function (features, selectedClass, index) {
            let filteredFeatures = features;
            const levels = selectedClass.levels;

            levels.forEach((level, index2) => {
                if (index2 < index) {
                    filteredFeatures = filteredFeatures.filter(feature => {
                        return feature.get(level.attr) === level.selectedValue;
                    });
                }
            });
            this.setFilteredFeatures(filteredFeatures);
            return filteredFeatures;
        },

        getFeatureValuesByLevel: function (features, level) {
            let values = [];

            features.forEach(feature => {
                values.push(feature.get(level.attr));
            });

            values = [...new Set(values)];
            values = values.sort();
            return values;
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
        }
    });

    PendlerAnimationModel.initialize();
    return PendlerAnimationModel;
}
export default initializePendlerAnimationModel;
