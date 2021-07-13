import {generateSimpleGetters} from ".../../../src/app-store/utils/generators";
import StrassenBefahrungState from "./stateStrassenBefahrung";

const getters = {
    ...generateSimpleGetters(StrassenBefahrungState)
};

export default getters;
