const actions = {
    // NOTE write actions here if you need them
    setFeatureCoordinatesFromGeocoder ({state}, obj) {
        const from = obj.from,
            id = obj.id,
            properties = obj.properties,
            coords = properties.coordinates;

        if (from === "Directions") {
            state[from][id].coordinates = coords;
        }
    },
    removeFeatureCoordinatesFromGeocoder ({state}, obj) {
        const from = obj.from,
            id = obj.id;

        if (from === "Directions") {
            state[from][id].coordinates = [];
        }
    }
};

export default actions;
