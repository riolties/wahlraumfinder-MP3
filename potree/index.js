import PotreeComponent from "./components/Potree.vue";
import PotreeStore from "./store/index";
import deLocale from "./locales/de/additional.json";
import enLocale from "./locales/en/additional.json";

export default {
    component: PotreeComponent,
    store: PotreeStore,
    locales: {
        de: deLocale,
        en: enLocale
    }
};
