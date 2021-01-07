import {generateSimpleGetters} from ".../../../src/app-store/utils/generators";
import stateOpenRouteService from "./stateOpenRouteService";

const getters = {
    ...generateSimpleGetters(stateOpenRouteService)
};

export default getters;
