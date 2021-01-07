import {generateSimpleGetters} from ".../../../src/app-store/utils/generators";
import stateOptimization from "./stateOptimization";

const getters = {
    ...generateSimpleGetters(stateOptimization)
};

export default getters;
