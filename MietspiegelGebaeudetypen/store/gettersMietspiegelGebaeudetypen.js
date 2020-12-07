import {generateSimpleGetters} from ".../../../src/app-store/utils/generators";
import stateMietspiegelGebaeudetypen from "./stateMietspiegelGebaeudetypen";

const getters = {
    ...generateSimpleGetters(stateMietspiegelGebaeudetypen)
};

export default getters;
