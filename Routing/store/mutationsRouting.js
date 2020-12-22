import {generateSimpleMutations} from "../../../src/app-store/utils/generators";
import stateRouting from "./stateRouting";

const mutations = {
    /**
     * Creates from every state-key a setter.
     * For example, given a state object {key: value}, an object
     * {setKey:   (state, payload) => *   state[key] = payload * }
     * will be returned.
     */
    ...generateSimpleMutations(stateRouting),

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
    // ORSD = OpenRouteService Directions
    setORSDFromX: (state, value) => {
        state.openRouteService.directions.from_x = value;
    },
    setORSDFromY: (state, value) => {
        state.openRouteService.directions.from_y = value;
    },
    setORSDToX: (state, value) => {
        state.openRouteService.directions.to_x = value;
    },
    setORSDToY: (state, value) => {
        state.openRouteService.directions.to_y = value;
    }

};

export default mutations;
