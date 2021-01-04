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
        state.openRouteService.from.x = value;
    },
    setORSDFromY: (state, value) => {
        state.openRouteService.from.y = value;
    },
    setORSDToX: (state, value) => {
        state.openRouteService.to.x = value;
    },
    setORSDToY: (state, value) => {
        state.openRouteService.to.y = value;
    },
    addViaToStore: (state) => {
        const via = {
                x: -1,
                y: -1,
                name: "",
                description: "",
                service: 0,
                pickup: [1]
            },
            length = state.openRouteService.vias.length;

        // fake values
        if (length === 0) {
            via.x = 11.65390;
            via.y = 48.15772;
            via.description = "Container 1";
        }
        if (length === 1) {
            via.x = 11.64467;
            via.y = 48.16070;
            via.description = "Container 2";
        }
        if (length === 2) {
            via.x = 11.65697;
            via.y = 48.16435;
            via.description = "Container 3";
        }
        if (length === 3) {
            via.x = 11.65962;
            via.y = 48.16734;
            via.description = "Container 4";
        }
        if (length === 4) {
            via.x = 11.64311;
            via.y = 48.16928;
            via.description = "Container 5";
        }
        state.openRouteService.vias.push(via);
    },
    removeViaFromStore: (state, value) => {
        state.openRouteService.vias = state.openRouteService.vias.filter(function (elem, index) {
            return index !== value;
        });
    }

};

export default mutations;
