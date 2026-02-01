import {generateSimpleGetters} from "@shared/js/utils/generators";
import WahlRaumFinderState from "./stateWahlRaumFinder";

const getters = {
    ...generateSimpleGetters(WahlRaumFinderState)
};

export default getters;
