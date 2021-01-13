import getters from "./gettersOptimization";
import mutations from "./mutationsOptimization";
import state from "./stateOptimization";

export default {
    namespaced: true,
    state: {...state},
    mutations,
    getters
};
