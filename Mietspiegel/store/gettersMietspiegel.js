import {generateSimpleGetters} from ".../../../src/app-store/utils/generators";
import mietspiegelState from "./stateMietspiegel";

const getters = {
    ...generateSimpleGetters(mietspiegelState)
};

export default getters;
