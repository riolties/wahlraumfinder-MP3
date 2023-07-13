import getters from "./gettersWahlRaumFinder";
import mutations from "./mutationsWahlRaumFinder";
import state from "./stateWahlRaumFinder";

export default {
    namespaced: true,
    state: {...state},
    mutations,
    getters
};
