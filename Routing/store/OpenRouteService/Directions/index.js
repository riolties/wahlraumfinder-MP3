import getters from "./gettersDirections";
import mutations from "./mutationsDirections";
import state from "./stateDirections";
import actions from "./actionsDirections";

export default {
    namespaced: true,
    state: {...state},
    mutations,
    getters,
    actions
};
