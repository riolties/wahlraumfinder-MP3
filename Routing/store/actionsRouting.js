import Feature from "ol/Feature.js";
import Point from "ol/geom/Point.js";

const actions = {
    generateFeatureAndAddToRoutingLayer ({dispatch}, properties) {
        const props = properties;

        props.geometry = new Point(props.coordinates);
        dispatch("generateFeature", props);
    },
    generateFeature ({dispatch}, props) {
        const feature = new Feature(props);

        dispatch("addFeaturesToRoutingLayer", [feature]);
    },
    addFeaturesToRoutingLayer ({state, dispatch}, features) {
        const layer = state.routingLayer,
            source = layer.getSource();

        features.forEach(function (feature) {
            dispatch("setFeatureStyle", feature);
        });
        source.addFeatures(features);

    },
    setFeatureStyle ({}, feature) {
        const styleId = feature.get("styleId"),
            styleListModel = Radio.request("StyleList", "returnModelById", styleId),
            style = styleListModel.createStyle(feature, false);

        feature.setStyle(style);
    },
    removeFeatureFromRoutingLayer ({state}, obj) {
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
    getFeatureFromRoutingLayer ({state}, id) {
        const layer = state.routingLayer,
            source = layer.getSource(),
            features = source.getFeatures(),
            foundFeature = features.filter((feature)=> {
                return feature.get("id") === id;
            })[0];

        return foundFeature;
    },

    addRoutingLayer ({state, commit}) {
        commit("Map/addLayerToMap", state.routingLayer, {root: true});
    },
    removeRoutingLayer ({state, commit}) {
        commit("Map/removeLayerFromMap", state.routingLayer, {root: true});
    },
    createErrorMessage ({dispatch}, msg) {
        dispatch("Alerting/addSingleAlert", {
            category: "Warnung",
            displayClass: "warning",
            content: msg,
            mustBeConfirmed: false
        }, {root: true});

    }
};

export default actions;
