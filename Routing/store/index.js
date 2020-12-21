import getters from "./gettersRouting";
import mutations from "./mutationsRouting";
import state from "./stateRouting";

export default {
    namespaced: true,
    state: {...state},
    mutations,
    getters
};
