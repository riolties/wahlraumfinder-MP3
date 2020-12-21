import {generateSimpleGetters} from ".../../../src/app-store/utils/generators";
import stateRouting from "./stateRouting";

const getters = {
    ...generateSimpleGetters(stateRouting)
};

export default getters;
