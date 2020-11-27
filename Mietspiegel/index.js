import MietspiegelComponent from "./components/Mietspiegel.vue";
import MietspiegelStore from "./store/index";
import deLocale from "./locales/de/additional.json";
import enLocale from "./locales/en/additional.json";

export default {
    component: MietspiegelComponent,
    store: MietspiegelStore,
    locales: {
        de: deLocale,
        en: enLocale
    }
};
