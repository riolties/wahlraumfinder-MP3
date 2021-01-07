import getters from "./gettersOpenRouteService";
import mutations from "./mutationsOpenRouteService";
import state from "./stateOpenRouteService";
import actions from "./actionsOpenRouteService";

import Directions from "./Directions/index";
import Optimization from "./Optimization/index";

export default {
    namespaced: true,
    modules: {
        Directions,
        Optimization
    },
    state: {...state},
    mutations,
    getters,
    actions
};
