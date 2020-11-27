import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import MietspiegelComponent from "../../../components/Mietspiegel.vue";
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
                                "name": "translate#additional:modules.tools.mietspiegel.title",
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
        store.commit("Tools/VueAddon/setActive", true);
    });

    it("renders the VueAddon", () => {
        const wrapper = shallowMount(MietspiegelComponent, {store, localVue});

        expect(wrapper.find("#vue-addon").exists()).to.be.true;
    });

    it("do not render the VueAddons if not active", () => {
        let wrapper = null;

        store.commit("Tools/VueAddon/setActive", false);
        wrapper = shallowMount(MietspiegelComponent, {store, localVue});

        expect(wrapper.find("#vue-addon").exists()).to.be.false;
    });
    it("VueAddon contains correct html", () => {
        const wrapper = shallowMount(MietspiegelComponent, {store, localVue});

        expect(wrapper.find("#vue-addon").html()).to.be.equals("<div id=\"vue-addon\">\n  additional:modules.tools.mietspiegel.content\n</div>");
    });

});
