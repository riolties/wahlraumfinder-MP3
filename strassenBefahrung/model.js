import Tool from "../../modules/core/modelList/tool/model";
import {Pointer} from "ol/interaction.js";

const StrassenBefahrungModel = Tool.extend(/** @lends StrassenBefahrungModel.prototype */{
    defaults: Object.assign(Tool.prototype.defaults, {
        id: "strassenBefahrung",
        name: "Straßen-Befahrung",
        glyphicon: "glyphicon-pencil",
        renderToWindow: false,
        interaction: null
    }),
    /**
     * @class StrassenBefahrungModel
     * @extends Tool
     * @memberof AddOns.StrassenBefahrung
     * @fires Core#RadioTriggerMapAddInteraction
     * @fires MapMarker#RadioTriggerMapMarkerHideMarker
     * @fires MapMarker#RadioTriggerMapMarkerShowMarker
     * @fires Core#RadioTriggerMapViewSetCenter
     * @fires AddOns.StrassenBefahrung#InitInfra3d
     * @fires Core#RadioTriggerMapRemoveInteraction
     * @contructs
     */
    initialize: function () {
        this.setDefaults();
        this.superInitialize();
    },

    setDefaults: function () {
        const model = Radio.request("ModelList", "getModelByAttributes", {id: "strassenBefahrung"}),
            attributes = model.attributes;

        Object.keys(attributes).forEach(key => {
            this.set(key, attributes[key]);
        });
    },
    /**
     * Creates an interaction to place a marker on the map.
     * @fires Core#RadioTriggerMapAddInteraction
     * @returns {void}
     */
    placeMarkerInMap: function () {
        const interaction = new Pointer({
            handleMoveEvent: function (evt) {
                this.showMarker(evt.coordinate);
            }.bind(this),
            handleDownEvent: function (evt) {
                this.setMarker(evt.coordinate);
            }.bind(this)
        }, this);

        this.setInteraction(interaction);

        Radio.trigger("Map", "addInteraction", this.get("interaction"));
    },

    /**
     * Hides the Marker in the map and removes the Interaction.
     * @fires MapMarker#RadioTriggerMapMarkerHideMarker
     * @returns {void}
     */
    stopMarkerInMap: function () {
        Radio.trigger("MapMarker", "hideMarker");
        this.removeInteraction();
    },

    /**
     * Shows the Marker in the map based on the Coordinate.
     * @param {Number[]} coord Coordinate.
     * @fires MapMarker#RadioTriggerMapMarkerShowMarker
     * @returns {void}
     */
    showMarker: function (coord) {
        Radio.trigger("MapMarker", "showMarker", coord);
    },

    /**
     * Sets the marker and triggers the initialisation of int infra3d api.
     * @param {Number[]} coord Coordinate.
     * @fires Core#RadioTriggerMapViewSetCenter
     * @fires AddOns.StrassenBefahrung#InitInfra3d
     * @returns {void}
     */
    setMarker: function (coord) {
        this.showMarker(coord);
        Radio.trigger("MapView", "setCenter", coord);
        this.removeInteraction();
        this.trigger("initInfra3d", coord);
    },

    /**
     * Removes the interaction from the map.
     * @fires Core#RadioTriggerMapRemoveInteraction
     * @returns {void}
     */
    removeInteraction: function () {
        Radio.trigger("Map", "removeInteraction", this.get("interaction"));
        this.setInteraction(null);
    },

    /**
     * Setter for attribute "interaction".
     * @param {ol/Interaction} value The interaction.
     * @returns {void}
     */
    setInteraction: function (value) {
        this.set("interaction", value);
    }
});

export default StrassenBefahrungModel;
