import {generateSimpleMutations} from "../../../src/app-store/utils/generators";
import stateMietspiegelWohnlage from "./stateMietspiegelWohnlage";

const mutations = {
    /**
     * Creates from every state-key a setter.
     * For example, given a state object {key: value}, an object
     * {setKey:   (state, payload) => *   state[key] = payload * }
     * will be returned.
     */
    ...generateSimpleMutations(stateMietspiegelWohnlage),

    setAddress: (state, address) => {
        state.address = address;
    }

};

export default mutations;
