import MietspiegelWohnlageComponent from "./components/MietspiegelWohnlage.vue";
import MietspiegelWohnlageStore from "./store/indexMietspiegelWohnlage";
import deLocale from "./locales/de/additional.json";
import enLocale from "./locales/en/additional.json";

export default {
    component: MietspiegelWohnlageComponent,
    store: MietspiegelWohnlageStore,
    locales: {
        de: deLocale,
        en: enLocale
    }
};
