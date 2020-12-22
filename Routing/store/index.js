import getters from "./gettersRouting";
import mutations from "./mutationsRouting";
import state from "./stateRouting";
import actions from "./actionsRouting";

export default {
    namespaced: true,
    state: {...state},
    mutations,
    getters,
    actions
};
