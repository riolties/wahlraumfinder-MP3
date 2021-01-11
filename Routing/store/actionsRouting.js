import {GeoJSON} from "ol/format.js";
import Feature from "ol/Feature.js";

const actions = {
    addRouteGeoJSONToRoutingLayer ({state, dispatch}, geojson) {
        const styleListModel = Radio.request("StyleList", "returnModelById", state.styleIdForRoute);

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
