import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import WahlRaumFinderComponent from "../../../components/WahlRaumFinder.vue";
import WahlRaumFinder from "../../../store/index";
import {expect} from "chai";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("addons/WahlRaumFinder/components/WahlRaumFinder.vue", () => {
    const mockConfigJson = {
        Portalconfig: {
            menu: {
                tools: {
                    children: {
                        WahlRaumFinder:
                            {
                                "name": "translate#additional:modules.tools.WahlRaumFinder.title",
                                "glyphicon": "glyphicon-th-list"
                            }
                    }
                }
            }
        }
    };
    let store;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        WahlRaumFinder
                    }
                }
            },
            state: {
                configJson: mockConfigJson
            }
        });
        store.commit("Tools/WahlRaumFinder/setActive", true);
    });

    it("renders the WahlRaumFinder", () => {
        const wrapper = shallowMount(WahlRaumFinderComponent, {store, localVue});

        expect(wrapper.find("#wahllokalfinder").exists()).to.be.true;
    });

    it("do not render the WahlRaumFinders if not active", () => {
        let wrapper = null;

        store.commit("Tools/WahlRaumFinder/setActive", false);
        wrapper = shallowMount(WahlRaumFinderComponent, {store, localVue});

        expect(wrapper.find("#wahllokalfinder").exists()).to.be.false;
    });

});
