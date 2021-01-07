import {generateSimpleGetters} from "../../../../../src/app-store/utils/generators";
import stateDirections from "./stateDirections";

const getters = {
    ...generateSimpleGetters(stateDirections)
};

export default getters;
