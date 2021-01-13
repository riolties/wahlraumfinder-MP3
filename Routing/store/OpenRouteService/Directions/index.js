import getters from "./gettersDirections";
import mutations from "./mutationsDirections";
import state from "./stateDirections";

export default {
    namespaced: true,
    state: {...state},
    mutations,
    getters
};
