import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import MietspiegelWohnlageComponent from "../../../components/MietspiegelWohnlage.vue";
import Mietspiegel from "../../../store/index";
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
                        Mietspiegel:
                            {
                                "name": "translate#additional:modules.tools.mietspiegel.wohnlage.title",
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
                        Mietspiegel
                    }
                }
            },
            state: {
                configJson: mockConfigJson
            }
        });
        store.commit("Tools/MietspiegelWohnlage/setActive", true);
    });

    it("renders the Mietspiegel", () => {
        const wrapper = shallowMount(MietspiegelWohnlageComponent, {store, localVue});

        expect(wrapper.find("#mietspiegel_wohnlage").exists()).to.be.true;
    });

    it("do not render the Mietspiegel if not active", () => {
        let wrapper = null;

        store.commit("Tools/MietspiegelWohnlage/setActive", false);
        wrapper = shallowMount(MietspiegelWohnlageComponent, {store, localVue});

        expect(wrapper.find("#mietspiegel_wohnlage").exists()).to.be.false;
    });

});
