import {GeoJSON} from "ol/format.js";
import Feature from "ol/Feature.js";
import Point from "ol/geom/Point.js";
const actions = {
    // NOTE write actions here if you need them
    setORSDCoordinatePart: function ({commit}, val) {
        const id = val.id,
            value = parseFloat(val.value);

        if (id === "from_x") {
            commit("setORSDFromX", value);
        }
        if (id === "from_y") {
            commit("setORSDFromY", value);
        }
        if (id === "to_x") {
            commit("setORSDToX", value);
        }
        if (id === "to_y") {
            commit("setORSDToY", value);
        }
    },
    initiallyAddFeatures ({state, dispatch}) {
        const vehicles = state.openRouteService.vehicles,
            jobs = state.openRouteService.jobs;

        vehicles.forEach(function (vehicle) {
            dispatch("orsoAddVehicleToRoutingLayer", vehicle);
        });
        jobs.forEach(function (job) {
            dispatch("orsoAddJobToRoutingLayer", job);
        });
    },
    addRouteGeoJSONToRoutingLayer ({state, dispatch}, geojson) {
        const styleListModel = Radio.request("StyleList", "returnModelById", state.styleId[0]);

        if (styleListModel) {
            const format = new GeoJSON({
                    dataProjection: "EPSG:4326",
                    featureProjection: "EPSG:25832"
                }),
                features = format.readFeatures(geojson);

            features.forEach(function (feature) {
                feature.setStyle(function (feat) {
                    return styleListModel.createStyle(feat, false);
                });
            });
            dispatch("addFeaturesToLayerSource", features);
        }
    },
    orsoAddVehicleToRoutingLayer ({dispatch}, vehicle) {
        const start = vehicle.start,
            end = vehicle.end;

        vehicle.geometry = new Point(start);
        dispatch("generateFeature", vehicle);

        // if start or end coordinates are not the same, add a second feature for the end coordinates
        if (start[0] !== end[0] || start[1] !== end[1]) {
            vehicle.geometry = new Point(end);
            dispatch("generateFeature", vehicle);
        }
    },
    orsoAddJobToRoutingLayer ({dispatch}, job) {
        job.geometry = new Point(job.location);
        dispatch("generateFeature", job);
    },
    generateFeature ({dispatch}, props) {
        const feature = new Feature(props),
            styleId = props.styleId,
            styleListModel = Radio.request("StyleList", "returnModelById", styleId);

        feature.setStyle(function (feat) {
            return styleListModel.createStyle(feat, false);
        });
        dispatch("addFeaturesToLayerSource", [feature]);
    },
    addFeaturesToLayerSource ({state}, features) {
        const layer = state.routingLayer,
            source = layer.getSource();

        source.addFeatures(features);

    },
    removeFeaturesFromSource ({state}, obj) {
        const layer = state.routingLayer,
            source = layer.getSource(),
            geometry = obj ? obj.geometry : undefined,
            attribute = obj ? obj.attribute : undefined,
            value = obj ? obj.value : undefined;
        let features = source.getFeatures();

        source.clear();
        if (geometry) {
            features = features.filter((feature) => {
                return feature.getGeometry().getType() !== geometry;
            });
            source.addFeatures(features);
        }
        else if (attribute && value) {
            features = features.filter((feature) => {
                return feature.get(attribute) !== value;
            });
            source.addFeatures(features);
        }
    },
    addRoutingLayer ({state, commit}) {
        commit("Map/addLayerToMap", state.routingLayer, {root: true});
    },
    removeRoutingLayer ({state, commit}) {
        commit("Map/removeLayerFromMap", state.routingLayer, {root: true});
    }
};

export default actions;
