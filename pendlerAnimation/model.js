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
            const features = this.get("features"),
                selectedClass = this.get("classes").filter(classPart => {
                    return classPart.name === className;
                })[0];

            selectedClass.levels[0].values = this.getFeatureValuesByLevel(features, selectedClass.levels[0]);
            this.setSelectedClass(selectedClass);
            this.setCurrentLevel(0);
            this.render();
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
        selectLevel: function (level, selection) {
            console.log(level);
            console.log(selection);
            const features = this.get("features"),
                selectedClass = this.get("selectedClass");

            selectedClass.levels[level].values = this.getFeatureValuesByLevel(features, selectedClass.levels[level]);
            this.setSelectedClass(selectedClass);
            this.setCurrentLevel(level);
            this.render();
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
        }
    });

    PendlerAnimationModel.initialize();
    return PendlerAnimationModel;
}
export default initializePendlerAnimationModel;
