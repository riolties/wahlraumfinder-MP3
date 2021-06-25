import WahlRaumFinderComponent from "./components/WahlRaumFinder.vue";
import WahlRaumFinderStore from "./store/index";
import deLocale from "./locales/de/additional.json";
import enLocale from "./locales/en/additional.json";

export default {
    component: WahlRaumFinderComponent,
    store: WahlRaumFinderStore,
    locales: {
        de: deLocale,
        en: enLocale
    }
};
