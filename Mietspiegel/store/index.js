import getters from "./gettersMietspiegel";
import mutations from "./mutationsMietspiegel";
import state from "./stateMietspiegel";

export default {
    namespaced: true,
    state: {...state},
    mutations,
    getters
};
