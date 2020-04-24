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
                    query: {}
                }
            ],
            filterFeatures: [] // wird systemisch gesetzt
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
                nextDropDown;
            const dropDown = filters[index],
                options = dropDown.options,
                name = dropDown.attr,
                selectedOption = this.findOptionByAttr(options, name, value),
                isLastDropDown = index + 1 === filters.length;

            dropDown.selectedOption = selectedOption;
            if (!isLastDropDown) {
                filters = this.clearFilterOptionsWithHigherIndex(filters, index);
                nextDropDown = filters[index + 1];
                nextDropDown.options = this.fetchOptionsForNextFilter(dropDown.selectedOption, dropDown.query);
                this.setFilters(filters);
            }
            else {
                console.log("fetch features");
            }
            this.render();
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
        fetchOptionsForNextFilter: function (selectedOption, query) {
            let options;
            const value = selectedOption[query.attr];

            options = this.getResponseByQueryType(value, query.type);
            options = this.formatResponseByDataType(options, query.dataType);
            console.log(selectedOption);
            console.log(query);
            return options;
        },
        getResponseByQueryType: function (value, queryType) {
            const url = this.get("url");
            let response = "";

            if (queryType === "URL") {
                response = this.sendRequest(url + value);
            }
            //possible other queryTypes
            return response;
        },

        formatResponseByDataType: function (response, dataType) {
            let formattedResponse = [];

            if (dataType === "JSON") {
                formattedResponse = JSON.parse(response);
            }
            //possible other dataTypes
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
        render: function () {
            this.trigger("render", this);
        },
        setLayer: function (value) {
            this.set("layer", value);
        },
        setFilters: function (value) {
            this.set("filters", value);
        }
    });

    AnimationModel.initialize();
    return AnimationModel;
}
export default initializeAnimationModel;
