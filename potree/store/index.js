import getters from "./gettersPotree";
import mutations from "./mutationsPotree";
import state from "./statePotree";

export default {
    namespaced: true,
    state: {...state},
    mutations,
    getters
};
