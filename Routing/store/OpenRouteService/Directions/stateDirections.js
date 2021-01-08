
/**
 * User type definition
 * @typedef {object} RoutingState
 */
const state = {
    timeout: undefined,
    from_address: {
        coordinates: [],
        allowSearchForAddress: true,
        autocompleteFeatures: []
    },
    to_address: {
        coordinates: [],
        allowSearchForAddress: true,
        autocompleteFeatures: []
    }
};

export default state;
