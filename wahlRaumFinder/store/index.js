import getters from "./gettersWahlRaumFinder";
import mutations from "./mutationsWahlRaumFinder";
import actions from "./actionsWahlRaumFinder";
import state from "./stateWahlRaumFinder";

export default {
    namespaced: true,
    state: {...state},
    mutations,
    actions,
    getters
};
