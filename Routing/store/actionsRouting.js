import {GeoJSON} from "ol/format.js";

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
    addGeoJSONToRoutingLayer ({state, commit, dispatch}, geojson) {
        const styleListModel = Radio.request("StyleList", "returnModelById", state.styleId),
            layer = state.routingLayer;

        dispatch("removeRoutingLayer");

        if (styleListModel) {
            const isClustered = false,
                format = new GeoJSON({
                    dataProjection: "EPSG:4326",
                    featureProjection: "EPSG:25832"
                }),
                features = format.readFeatures(geojson);

            dispatch("addFeaturesToLayerSource", features);
            layer.setStyle(function (feature) {
                return styleListModel.createStyle(feature, isClustered);
            });
            commit("Map/addLayerToMap", state.routingLayer, {root: true});
        }
    },
    addFeaturesToLayerSource ({state}, features) {
        const layer = state.routingLayer,
            source = layer.getSource();

        source.addFeatures(features);
    },
    clearSource ({state}) {
        const layer = state.routingLayer,
            source = layer.getSource();

        source.clear();
    },
    removeRoutingLayer ({state, commit}) {
        commit("Map/removeLayerFromMap", state.routingLayer, {root: true});
    }
};

export default actions;
