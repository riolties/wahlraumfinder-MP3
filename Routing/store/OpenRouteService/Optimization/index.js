import getters from "./gettersOptimization";
import mutations from "./mutationsOptimization";
import state from "./stateOptimization";
import actions from "./actionsOptimization";

export default {
    namespaced: true,
    state: {...state},
    mutations,
    getters,
    actions
};
