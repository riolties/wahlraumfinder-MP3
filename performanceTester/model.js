import Tool from "../../modules/core/modelList/tool/model";
import Feature from "ol/Feature.js";
import Point from "ol/geom/Point.js";

const PerformanceTesterModel = Tool.extend(/** @lends PerformanceTesterModel.prototype */{
    defaults: Object.assign({}, Tool.prototype.defaults, {
        id: "performanceTester",
        type: "tool",
        parentId: "tools",
        name: "performanceTester",
        glyphicon: "glyphicon-dashboard",
        numFeatures: 1000,
        extent: [670000, 5320000, 710000, 5350000],
        height: 600,
        interval: 2000,
        movement: false
    }),
    /**
     * @class PerformanceTesterModel
     * @extends Tool
     * @memberof Addons.PerformanceTester
     * @fires Core#RadioRequestMapCreateLayerIfNotExists
     * @contructs
     */
    initialize: function () {
        const layer = Radio.request("Map", "createLayerIfNotExists", "performanceTest");

        this.superInitialize();
        this.setLayer(layer);
        this.setSupportedIn3d(["performanceTester"]);
    },

    /**
     * Creates the features and adds them to the tools layer.
     * @returns {void}
     */
    createFeatures: function () {
        const source = this.get("layer").getSource(),
            numFeatures = this.get("numFeatures");
        let feature;

        this.deleteFeatures();
        for (let i = 0; i < numFeatures; i++) {
            feature = this.createRandomFeature();
            source.addFeature(feature);
        }
        if (this.get("movement")) {
            this.startMovement(source.getFeatures());
        }
    },

    /**
     * Starts the Movement of features
     * @param {ol/features[]} features The Features to be moved.
     * @returns {void}
     */
    startMovement: function (features) {
        const intervalId = setInterval(this.moveFeatures, this.get("interval"), features, this);

        this.setIntervalId(intervalId);
    },

    /**
     * Moves the features by creating a random coordinate.
     * @param {ol/features[]} features The Features to be moved.
     * @param {Object} context The context. In this case the model itself.
     * @returns {void}
     */
    moveFeatures: function (features, context) {
        features.forEach(feature => {
            const newRandomCoords = context.createRandomCoordinate();

            feature.getGeometry().setCoordinates(newRandomCoords);
        });
    },

    /**
     * Create a feature with a random coordinate.
     * @returns {ol/feature} - feature with random coordinate.
     */
    createRandomFeature: function () {
        const coordinate = this.createRandomCoordinate(),
            feature = new Feature({
                geometry: new Point(coordinate)
            });

        return feature;
    },

    /**
     * Creates a random coordinate.
     * @returns {Number[]} - random coordinate.
     */
    createRandomCoordinate: function () {
        const extent = this.get("extent"),
            minX = extent[0],
            minY = extent[1],
            maxX = extent[2],
            maxY = extent[3],
            xValue = this.createRandomValue(minX, maxX),
            yValue = this.createRandomValue(minY, maxY),
            height = this.get("height"),
            randomCoordinate = [xValue, yValue, height];

        return randomCoordinate;
    },

    /**
     * Creates a random value between the given min and max.
     * @param {Number} min Minimum value.
     * @param {Number} max Maximum value.
     * @returns {Number} - random value.
     */
    createRandomValue: function (min, max) {
        const randomValue = Math.random() * (max - min) + min;

        return randomValue;
    },
    /**
     * Clears the interval and deletes the features.
     * @returns {void}
     */
    deleteFeatures: function () {
        window.clearInterval(this.get("intervalId"));
        this.get("layer").getSource().clear();
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
     * Setter for attribute "numFeatures"
     * @param {*} value Value.
     * @returns {void}
     */
    setNumFeatures: function (value) {
        this.set("numFeatures", value);
    },

    /**
     * Setter for attribute "height"
     * @param {*} value Value.
     * @returns {void}
     */
    setHeight: function (value) {
        this.set("height", value);
    },

    /**
     * Setter for attribute "movement"
     * @param {*} value Value.
     * @returns {void}
     */
    setMovement: function (value) {
        this.set("movement", value);
    },

    /**
     * Setter for attribute "intervalId"
     * @param {*} value Value.
     * @returns {void}
     */
    setIntervalId: function (value) {
        this.set("intervalId", value);
    },

    /**
     * Setter for attribute "interval"
     * @param {*} value Value.
     * @returns {void}
     */
    setInterval: function (value) {
        this.set("interval", value);
    },

    /**
     * Setter for attribute "supportedIn3d"
     * @param {*} value Value.
     * @returns {void}
     */
    setSupportedIn3d: function (value) {
        this.set("supportedIn3d", value);
    }
});

export default PerformanceTesterModel;
