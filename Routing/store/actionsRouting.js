import {GeoJSON} from "ol/format.js";
import Feature from "ol/Feature.js";
import Point from "ol/geom/Point.js";

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
    addFeatureToRoutingLayer ({dispatch}, properties) {
        const props = properties;

        props.geometry = new Point(props.coordinates);
        dispatch("generateFeature", props);
    },
    generateFeature ({dispatch}, props) {
        const feature = new Feature(props),
            styleId = props.styleId,
            styleListModel = styleId ? Radio.request("StyleList", "returnModelById", styleId) : undefined;

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
            geometryType = obj ? obj.geometryType : undefined,
            attribute = obj ? obj.attribute : undefined,
            value = obj ? obj.value : undefined;
        let features = source.getFeatures();

        source.clear();
        if (geometryType) {
            features = features.filter((feature) => {
                return feature.getGeometry().getType() !== geometryType;
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
