import {generateSimpleMutations} from "../../../../src/app-store/utils/generators";
import stateOpenRouteService from "./stateOpenRouteService";

const mutations = {
    /**
     * Creates from every state-key a setter.
     * For example, given a state object {key: value}, an object
     * {setKey:   (state, payload) => *   state[key] = payload * }
     * will be returned.
     */
    ...generateSimpleMutations(stateOpenRouteService),

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

    // orso = openrouteservice optimization
    orsoSetTabActive: (state, value) => {
        state.activeTab = value;
    },
    orsoCreatingVehicle: (state, value) => {
        state.openRouteService.creatingVehicle = value;
    },
    orsoAddVehicle: (state, vehicle) => {
        state.openRouteService.vehicles.push(vehicle);
    },
    orsoRemoveVehicle: (state, value) => {
        state.openRouteService.vehicles = state.openRouteService.vehicles.filter(function (elem) {
            return elem.id !== value;
        });
    },
    orsoCreatingJob: (state, value) => {
        state.openRouteService.creatingJob = value;
    },
    orsoRemoveJob: (state, value) => {
        state.openRouteService.jobs = state.openRouteService.jobs.filter(function (elem) {
            return elem.id !== value;
        });
    },
    orsoAddJob: (state, job) => {
        state.openRouteService.jobs.push(job);
    }

};

export default mutations;
