import {generateSimpleMutations} from "../../../../../src/app-store/utils/generators";
import stateDirections from "./stateDirections";

const mutations = {
    /**
     * Creates from every state-key a setter.
     * For example, given a state object {key: value}, an object
     * {setKey:   (state, payload) => *   state[key] = payload * }
     * will be returned.
     */
    ...generateSimpleMutations(stateDirections),

    /**
     * If name from config.json starts with "translate#", the corrected key is set to name here.
     * @param {object} state of this component
     * @param {string} payload name of this component
     * @returns {void}
     */
    applyTranslationKey: (state, payload) => {
        if (payload && payload.indexOf("translate#") > -1) {
            state.name = payload.substr("translate#".length);
        }
    },

    setAllowSearchForAddress: (state, obj) => {
        const id = obj.id,
            allowSearchForAddress = obj.value;

        // id can only be "from_address" or "to_address"
        state[id].allowSearchForAddress = allowSearchForAddress;
    },
    setCoordinatesFromAutocompleteFeature: (state, obj) => {
        const id = obj.id,
            label = obj.label,
            foundFeature = state[id].autocompleteFeatures.filter(function (feature) {
                return feature.properties.label === label;
            })[0],
            coordinates = foundFeature.geometry.coordinates;

        state[id].coordinates = coordinates;
    },
    resetAutocompleteFeatures: (state, id) => {
        state[id].autocompleteFeatures = [];
    }
};

export default mutations;
