import getters from "./gettersRouting";
import mutations from "./mutationsRouting";
import state from "./stateRouting";
import actions from "./actionsRouting";

import OpenRouteService from "./OpenRouteService/index";

export default {
    namespaced: true,
    modules: {
        OpenRouteService
    },
    state: {...state},
    mutations,
    getters,
    actions
};
