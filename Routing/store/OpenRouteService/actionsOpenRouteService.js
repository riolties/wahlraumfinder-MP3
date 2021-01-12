const actions = {
    // NOTE write actions here if you need them
    setFeatureCoordinatesFromGeocoder ({state}, obj) {
        const from = obj.from,
            id = obj.id,
            properties = obj.properties,
            coords = properties.coordinates;

        console.log(from);
        console.log(id);
        state[from][id].coordinates = coords;
    },
    removeFeatureCoordinatesFromGeocoder ({state}, obj) {
        const from = obj.from,
            id = obj.id;

        console.log(from);
        console.log(id);
        state[from][id].coordinates = [];
    }
};

export default actions;
