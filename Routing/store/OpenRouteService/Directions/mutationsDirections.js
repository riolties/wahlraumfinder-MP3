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
    setFromX: (state, value) => {
        state.from.x = value;
    },
    setFromY: (state, value) => {
        state.from.y = value;
    },
    setToX: (state, value) => {
        state.to.x = value;
    },
    setToY: (state, value) => {
        state.to.y = value;
    }

};

export default mutations;
