const actions = {
    addAutocompleteFeatures: ({state}, payload) => {
        const features = payload.features,
            target = payload.target,
            map = ["id", "continent", "country", "region", "macrocounty", "county", "locality", "postalcode", "neighbourhood", "street", "housenumber", "distance"];

        features.forEach(function (feature) {
            feature.properties = Object.keys(feature.properties)
                .filter(key => map.includes(key))
                .reduce((obj, key) => {
                    obj[key] = feature.properties[key];
                    return obj;
                }, {});
            feature.properties.label = feature.properties.street + " " + feature.properties.housenumber + " " + feature.properties.postalcode + " " + feature.properties.locality;
        });
        state[target].autocompleteFeatures = features;
    }
};

export default actions;
