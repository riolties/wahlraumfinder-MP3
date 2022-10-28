import getters from "./gettersMietspiegelWohnlage";
import mutations from "./mutationsMietspiegelWohnlage";
import state from "./stateMietspiegelWohnlage";

export default {
    namespaced: true,
    state: {...state},
    mutations,
    getters
};
