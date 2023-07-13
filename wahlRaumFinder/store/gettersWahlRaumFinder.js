import {generateSimpleGetters} from ".../../../src/app-store/utils/generators";
import WahlRaumFinderState from "./stateWahlRaumFinder";

const getters = {
    ...generateSimpleGetters(WahlRaumFinderState)
};

export default getters;
