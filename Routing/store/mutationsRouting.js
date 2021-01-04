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
            via.x = 11.653909242678891;
            via.y = 48.157728105827626;
            via.description = "Container 1";
        }
        if (length === 1) {
            via.x = 11.644679690510779;
            via.y = 48.1607022776266895;
            via.description = "Container 2";
        }
        if (length === 2) {
            via.x = 11.656977751729558;
            via.y = 48.164353862146754;
            via.description = "Container 3";
        }
        if (length === 3) {
            via.x = 11.659629875739959;
            via.y = 48.167340973115387;
            via.description = "Container 4";
        }
        if (length === 4) {
            via.x = 11.643119794434442;
            via.y = 48.169288814856912;
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
