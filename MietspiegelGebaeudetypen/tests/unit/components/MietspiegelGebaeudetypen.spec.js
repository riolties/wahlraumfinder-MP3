import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import MietspiegelGebaeudetypenComponent from "../../../components/MietspiegelGebaeudetypen.vue";
import MietspiegelGebaeudetypen from "../../../store/index";
import {expect} from "chai";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("addons/VueAddon/components/VueAddon.vue", () => {
    const mockConfigJson = {
        Portalconfig: {
            menu: {
                tools: {
                    children: {
                        MietspiegelGebaeudetypen:
                            {
                                "name": "translate#additional:modules.tools.mietspiegel.gebaeudetypen.title",
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
                        MietspiegelGebaeudetypen
                    }
                }
            },
            state: {
                configJson: mockConfigJson
            }
        });
        store.commit("Tools/MietspiegelGebaeudetypen/setActive", true);
    });

    it("renders the Mietspiegel", () => {
        const wrapper = shallowMount(MietspiegelGebaeudetypenComponent, {store, localVue});

        expect(wrapper.find("#mietspiegel_gebaeudetypen").exists()).to.be.true;
    });

    it("do not render the Mietspiegel if not active", () => {
        let wrapper = null;

        store.commit("Tools/MietspiegelGebaeudetypen/setActive", false);
        wrapper = shallowMount(MietspiegelGebaeudetypenComponent, {store, localVue});

        expect(wrapper.find("#mietspiegel_gebaeudetypen").exists()).to.be.false;
    });

});
