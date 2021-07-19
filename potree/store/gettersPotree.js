import {generateSimpleGetters} from ".../../../src/app-store/utils/generators";
import PotreeState from "./statePotree";

const getters = {
    ...generateSimpleGetters(PotreeState)
};

export default getters;
