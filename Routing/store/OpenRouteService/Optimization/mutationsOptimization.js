import {generateSimpleMutations} from "../../../../../src/app-store/utils/generators";
import stateOptimization from "./stateOptimization";

const mutations = {
    /**
     * Creates from every state-key a setter.
     * For example, given a state object {key: value}, an object
     * {setKey:   (state, payload) => *   state[key] = payload * }
     * will be returned.
     */
    ...generateSimpleMutations(stateOptimization),

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

    setTabActive: (state, value) => {
        state.activeTab = value;
    },
    setCreatingVehicle: (state, value) => {
        state.creatingVehicle = value;
    },
    addVehicle: (state, vehicle) => {
        state.vehicles.push(vehicle);
    },
    removeVehicle: (state, value) => {
        state.vehicles = state.vehicles.filter(function (elem) {
            return elem.id !== value;
        });
    },
    setCreatingJob: (state, value) => {
        state.creatingJob = value;
    },
    addJob: (state, job) => {
        state.jobs.push(job);
    },
    removeJob: (state, value) => {
        state.jobs = state.jobs.filter(function (elem) {
            return elem.id !== value;
        });
    }

};

export default mutations;
