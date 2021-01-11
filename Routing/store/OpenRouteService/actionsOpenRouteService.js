const actions = {
    // NOTE write actions here if you need them
    setFeatureFromGeocoder ({state}, obj) {
        const from = obj.from,
            id = obj.id,
            feature = obj.feature,
            coords = feature.getGeometry().getCoordinates();

        state[from][id].coordinates = coords;
    }
};

export default actions;
