import Feature from "ol/Feature.js";
import Point from "ol/geom/Point.js";
/**
 * TODO
 * @returns {Object} The model.
 */
function initializePerformanceTesterModel () {
    const PerformanceTesterModel = Radio.request("ModelList", "getModelByAttributes", {id: "performanceTester"}),
        defaults = {
            name: "performanceTester",
            glyphicon: "glyphicon-dashboard",
            numFeatures: 1000,
            extent: [670000, 5320000, 710000, 5350000],
            height: 600,
            interval: 2000,
            movement: false
        };

    Object.assign(PerformanceTesterModel, /** @lends PerformanceTesterModel.prototype */ {
        attributes: Object.assign(defaults, PerformanceTesterModel.attributes),
        initialize: function () {
            const layer = Radio.request("Map", "createLayerIfNotExists", "performanceTest");

            this.superInitialize();
            this.setLayer(layer);
        },

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

        startMovement: function (features) {
            const intervalId = setInterval(this.moveFeatures, this.get("interval"), features, this);

            this.setIntervalId(intervalId);
        },

        moveFeatures: function (features, context) {
            features.forEach(feature => {
                const newRandomCoords = context.createRandomCoordinate();

                feature.getGeometry().setCoordinates(newRandomCoords);
            });
        },
        createRandomFeature: function () {
            const coordinate = this.createRandomCoordinate(),
                feature = new Feature({
                    geometry: new Point(coordinate)
                });

            return feature;
        },

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

        createRandomValue: function (min, max) {
            const randomValue = Math.random() * (max - min) + min;

            return randomValue;
        },
        deleteFeatures: function () {
            window.clearInterval(this.get("intervalId"));
            this.get("layer").getSource().clear();
        },

        setLayer: function (value) {
            this.set("layer", value);
        },

        setNumFeatures: function (value) {
            this.set("numFeatures", value);
        },

        setHeight: function (value) {
            this.set("height", value);
        },

        setMovement: function (value) {
            this.set("movement", value);
        },

        setIntervalId: function (value) {
            this.set("intervalId", value);
        },

        setInterval: function (value) {
            this.set("interval", value);
        }
    });

    PerformanceTesterModel.initialize();
    return PerformanceTesterModel;
}
export default initializePerformanceTesterModel;
