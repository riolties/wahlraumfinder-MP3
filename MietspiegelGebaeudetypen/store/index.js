import getters from "./gettersMietspiegelGebaeudetypen";
import mutations from "./mutationsMietspiegelGebaeudetypen";
import state from "./stateMietspiegelGebaeudetypen";

export default {
    namespaced: true,
    state: {...state},
    mutations,
    getters
};
