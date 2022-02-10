import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import RoutingComponent from "../../../components/RoutingTool.vue";
import Routing from "../../../store/index";
import {expect} from "chai";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("addons/Routing/components/VueAddon.vue", () => {
    const mockConfigJson = {
        Portalconfig: {
            menu: {
                tools: {
                    children: {
                        Routing:
                            {
                                "name": "translate#additional:modules.tools.routing.title",
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
                        Routing
                    }
                }
            },
            state: {
                configJson: mockConfigJson
            }
        });
        store.commit("Tools/Routing/setActive", true);
    });

    it("renders the Routing", () => {
        const wrapper = shallowMount(RoutingComponent, {store, localVue});

        expect(wrapper.find("#routing").exists()).to.be.true;
    });

    it("do not render the Routing if not active", () => {
        let wrapper = null;

        store.commit("Tools/Routing/setActive", false);
        wrapper = shallowMount(RoutingComponent, {store, localVue});

        expect(wrapper.find("#routing").exists()).to.be.false;
    });

});
