import {generateSimpleMutations} from "../../../src/app-store/utils/generators";
import stateWahlRaumFinder from "./stateWahlRaumFinder";

const mutations = {
    /**
     * Creates from every state-key a setter.
     * For example, given a state object {key: value}, an object
     * {setKey:   (state, payload) => *   state[key] = payload * }
     * will be returned.
     */
    ...generateSimpleMutations(stateWahlRaumFinder),

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
    setAddressString: (state, addressString) => {
        state.addressString = addressString;
    },
    setAddressPollingStationId: (state, addressPollingStationId) => {
        state.addressPollingStationId = addressPollingStationId;
    },
    setFeatureValues: (state, featureValues) => {
        state.featureValues = featureValues;
    },
    setDistanceString: (state, distanceString) => {
        state.distanceString = distanceString;
    }
};

export default mutations;
