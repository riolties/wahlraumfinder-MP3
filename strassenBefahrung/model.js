import {Pointer} from "ol/interaction.js";
import Feature from "ol/Feature.js";
import Point from "ol/geom/Point.js";
import {GeoJSON} from "ol/format.js";

/**
 * TODO
 * @returns {Object} The model.
 */
function initializeStrassenBefahrungModel () {
    const StrassenBefahrungModel = Radio.request("ModelList", "getModelByAttributes", {id: "strassenBefahrung"}),
        defaults = {
            id: "strassenBefahrung",
            name: "Straßen-Befahrung",
            glyphicon: "glyphicon-pencil",
            interaction: null,
            layer: undefined,
            styleId: "strassenBefahrung",
            coords: [691604, 5334760] // Mariensäule
        };

    Object.assign(StrassenBefahrungModel, {
        attributes: Object.assign(defaults, StrassenBefahrungModel.attributes),

        /**
         * @class StrassenBefahrungModel
         * @extends Tool
         * @memberof AddOns.StrassenBefahrung
         * @fires Core.ModelList#RadioRequestModelListGetModelByAttributes
         * @fires Core#RadioRequestMapViewGetProjection
         * @fires Core#RadioRequestMapCreateLayerIfNotExists
         * @fires VectorStyle#RadioRequestStyleListReturnModelById
         * @fires Core#RadioTriggerMapAddInteraction
         * @fires Core#RadioTriggerMapViewSetCenter
         * @fires Core#RadioTriggerMapRemoveInteraction
         * @fires AddOns.StrassenBefahrung#deactivateButton
         * @contructs
         */
        initialize: function () {
            this.superInitialize();
            this.setEpsg(this.getEpsgFromMap());
            this.createEnnLayer();
            this.createLayer();
        },

        /**
         * Gets the EPSG code from Map projection.
         * @fires Core#RadioRequestMapViewGetProjection
         * @returns {Number} - EPSG code
         */
        getEpsgFromMap: function () {
            const epsgCodeString = Radio.request("MapView", "getProjection").getCode(),
                epsgCodeNumber = parseInt(epsgCodeString.split(":")[1], 10);

            return epsgCodeNumber;
        },

        /**
         * Creates an Layer for the edge-node-network.
         * @fires Core#RadioRequestMapCreateLayerIfNotExists
         * @returns {void}
         */
        createEnnLayer: function () {
            const ennLayer = Radio.request("Map", "createLayerIfNotExists", "strassenBefahrung_enn");

            this.setEnnLayer(ennLayer);
        },

        /**
         * Creates an Layer for the marker.
         * Sets the style on the feature.
         * @fires Core#RadioRequestMapCreateLayerIfNotExists
         * @fires VectorStyle#RadioRequestStyleListReturnModelById
         * @returns {void}
         */
        createLayer: function () {
            const layer = Radio.request("Map", "createLayerIfNotExists", "strassenBefahrung"),
                feature = new Feature({
                    geometry: new Point([])
                }),
                styleModel = Radio.request("StyleList", "returnModelById", this.get("styleId"));

            feature.setStyle(styleModel.createStyle(feature, false));
            layer.getSource().addFeature(feature);
            this.setLayer(layer);
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
                    this.startInfra3dAtCoord(evt.coordinate);
                    this.setMarker(evt.coordinate);
                }.bind(this)
            }, this);

            this.setInteraction(interaction);
            Radio.trigger("Map", "addInteraction", this.get("interaction"));
        },

        /**
         * Loads infra3d at given position.
         * @param {Number[]} coord Coordinate.
         * @returns {void}
         */
        startInfra3dAtCoord: function (coord) {
            window.infra3d.loadAtPosition(coord[0], coord[1]);
        },

        /**
         * Hides the Marker in the map and removes the Interaction.
         * @returns {void}
         */
        stopMarkerInMap: function () {
            this.hideMarker();
            this.removeInteraction();
        },

        /**
         * Shows the Marker in the map based on the Coordinate.
         * @param {Number[]} coord Coordinate.
         * @param {Number} orientation orientation.
         * @returns {void}
         */
        showMarker: function (coord, orientation) {
            const layer = this.get("layer"),
                feature = layer.getSource().getFeatures()[0],
                style = feature.getStyle(),
                image = style.getImage();
            let rotationInRad;

            layer.setVisible(true);
            feature.getGeometry().setCoordinates(coord);
            if (orientation && image) {
                rotationInRad = orientation * Math.PI / 180;
                image.setRotation(rotationInRad);
            }
            this.setCoords(coord);
        },

        /**
         * Hides the marker.
         * @returns {void}
         */
        hideMarker: function () {
            this.get("layer").setVisible(false);
        },

        /**
         * Clears the edge-node-network layer.
         * @returns {void}
         */
        clearEnnLayer: function () {
            this.get("ennLayer").getSource().clear();
        },

        /**
         * Sets the marker and triggers the initialisation of int infra3d api.
         * @param {Number[]} coord Coordinate.
         * @fires Core#RadioTriggerMapViewSetCenter
         * @returns {void}
         */
        setMarker: function (coord) {
            this.showMarker(coord);
            Radio.trigger("MapView", "setCenter", coord);
            this.removeInteraction();
        },

        /**
         * Initialized the infra3d
         * @returns {void}
         */
        initInfra3d: function () {
            const infra3d = window.infra3d,
                divId = "infra3d-div",
                url = "https://client-v3.infra3d.ch",
                coord = this.get("coords"),
                options = {
                    loginurl: "https://auth.infra3d.ch/api/v1/login",
                    credentials: ["WOmuenchen", "6tHqJ2"],
                    easting: coord[0],
                    northing: coord[1],
                    epsg: this.get("epsg"),
                    lang: "de",
                    map: false,
                    layer: false,
                    navigation: false
                };

            if (infra3d) {
                infra3d.init(divId, url, options, this.infra3dInitialized, this);
            }
            else {
                console.error("Infra3D is not loaded!");
            }
            this.setMarker(coord);
        },

        /**
         * Callback function if infra3d initialized. Listens to positionChanged of API.
         * @returns {void}
         */
        infra3dInitialized: function () {
            this.getEnn();
            this.setOnPositionChanged();
        },

        /**
         * Gets the edge-node-network and fills the ennLayer.
         * @returns {void}
         */
        getEnn: function () {
            window.infra3d.getEnn(this.get("epsg"), function (enn) {
                this.createEdgeNodeNetworkLayer(enn);
            }, this);
        },

        /**
         * Fills the ennLayer with the features from the GeoJSON.
         * @param {JSON} json Enn as GeoJSON.
         * @returns {void}
         */
        createEdgeNodeNetworkLayer: function (json) {
            const layer = this.get("ennLayer"),
                source = layer.getSource(),
                formatJSON = new GeoJSON(),
                features = formatJSON.readFeatures(json);

            this.clearEnnLayer();
            source.addFeatures(features);
        },

        /**
         * Listener for positionChanged of API.
         * @returns {void}
         */
        setOnPositionChanged: function () {
            window.infra3d.setOnPositionChanged(function (easting, northing, height, epsg, orientation) {
                this.showMarker([easting, northing], orientation);
            }, this);
        },

        /**
         * Removes the interaction from the map.
         * @fires Core#RadioTriggerMapRemoveInteraction
         * @fires AddOns.StrassenBefahrung#deactivateButton
         * @returns {void}
         */
        removeInteraction: function () {
            Radio.trigger("Map", "removeInteraction", this.get("interaction"));
            this.setInteraction(null);
            this.trigger("deactivateButton", ".btn-marker");
        },

        /**
         * Resets the Model.
         * @returns {void}
         */
        reset: function () {
            this.setIsActive(false);
            this.hideMarker();
            this.clearEnnLayer();
        },

        /**
         * Setter for attribute "interaction".
         * @param {ol/Interaction} value The interaction.
         * @returns {void}
         */
        setInteraction: function (value) {
            this.set("interaction", value);
        },

        /**
         * Setter for attribute "layer".
         * @param {ol/Layer} value The layer.
         * @returns {void}
         */
        setLayer: function (value) {
            this.set("layer", value);
        },

        /**
         * Setter for attribute "ennLayer".
         * @param {ol/Layer} value The ennLayer.
         * @returns {void}
         */
        setEnnLayer: function (value) {
            this.set("ennLayer", value);
        },

        /**
         * Setter for attribute "epsg".
         * @param {Number} value The epsg code.
         * @returns {void}
         */
        setEpsg: function (value) {
            this.set("epsg", value);
        },

        /**
         * Setter for attribute "coords".
         * @param {Number[]} value The coordinates.
         * @returns {void}
         */
        setCoords: function (value) {
            this.set("coords", value);
        }
    });

    StrassenBefahrungModel.initialize();
    return StrassenBefahrungModel;
}
export default initializeStrassenBefahrungModel;
