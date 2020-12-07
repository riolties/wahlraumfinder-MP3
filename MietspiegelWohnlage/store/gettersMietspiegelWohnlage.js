import {generateSimpleGetters} from ".../../../src/app-store/utils/generators";
import stateMietspiegelWohnlage from "./stateMietspiegelWohnlage";

const getters = {
    ...generateSimpleGetters(stateMietspiegelWohnlage)
};

export default getters;
