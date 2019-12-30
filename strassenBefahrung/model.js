import Tool from "../../modules/core/modelList/tool/model";
import {Pointer} from "ol/interaction.js";

const StrassenBefahrungModel = Tool.extend({
    defaults: Object.assign({}, Tool.prototype.defaults, {
        id: "strassenBefahrung",
        name: "Straßen-Befahrung",
        glyphicon: "glyphicon-pencil",
        renderToWindow: false,
        interaction: null
    }),
    initialize: function () {
        this.superInitialize();
    },
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
    stopMarkerInMap: function () {
        Radio.trigger("MapMarker", "hideMarker");
        this.removeInteraction();
    },
    showMarker: function (coord) {
        Radio.trigger("MapMarker", "showMarker", coord);
    },
    setMarker: function (coord) {
        this.showMarker(coord);
        Radio.trigger("MapView", "setCenter", coord);
        this.removeInteraction();
        this.trigger("initInfra3d", coord);
    },
    removeInteraction: function () {
        Radio.trigger("Map", "removeInteraction", this.get("interaction"));
        this.setInteraction(null);
    },
    setInteraction: function (value) {
        this.set("interaction", value);
    }
});

export default StrassenBefahrungModel;
