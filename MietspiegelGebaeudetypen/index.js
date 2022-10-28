import MietspiegelGebaeudetypenComponent from "./components/MietspiegelGebaeudetypen.vue";
import MietspiegelGebaeudetypenStore from "./store/indexMietspiegelGebaeudetypen";
import deLocale from "./locales/de/additional.json";
import enLocale from "./locales/en/additional.json";

export default {
    component: MietspiegelGebaeudetypenComponent,
    store: MietspiegelGebaeudetypenStore,
    locales: {
        de: deLocale,
        en: enLocale
    }
};
