<script>
import Tool from "../../../src/modules/tools/Tool.vue";
import {mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersMietspiegel";
import mutations from "../store/mutationsMietspiegel";

export default {
    name: "Mietspiegel",
    components: {
        Tool
    },
    computed: {
        ...mapGetters("Tools/Mietspiegel", Object.keys(getters))
    },
    created () {
        this.$on("close", this.close);
        this.listenToSearchResults();
    },
    /**
     * Put initialize here if mounting occurs after config parsing
     * @returns {void}
     */
    mounted () {
        this.applyTranslationKey(this.name);
    },
    methods: {
        ...mapMutations("Tools/Mietspiegel", Object.keys(mutations)),

        /**
         * Closes this tool window by setting active to false
         * @returns {void}
         */
        close () {
            this.setActive(false);

            // TODO replace trigger when Menu is migrated
            // set the backbone model to active false for changing css class in menu (menu/desktop/tool/view.toggleIsActiveClass)
            // else the menu-entry for this tool is always highlighted
            const model = Radio.request("ModelList", "getModelByAttributes", {id: this.$store.state.Tools.Mietspiegel.id});

            if (model) {
                model.set("isActive", false);
            }
        },
        pushValuesBack (evt) {
            const alias = evt.target.attributes.alias.value,
                address = this.address,
                opener = window.opener ? window.opener : null,
                url = opener.location.origin;

            if (opener) {
                opener.postMessage({
                    lage: alias,
                    address: address
                }, url);
                window.close();
            }
        },
        listenToSearchResults () {
            Backbone.Events.listenTo(Radio.channel("Searchbar"), {
                "hit": (hit) => {
                    const addressName = hit.name.split(",")[0];

                    this.updateUrlParams("query", addressName);
                    this.setAddress(addressName);
                }
            });
        },
        updateUrlParams (key, value) {
            const baseUrl = [location.protocol, "//", location.host, location.pathname].join(""),
                urlQueryString = document.location.search,
                newParam = key + "=" + value;

            let keyRegex,
                params = "?" + newParam;

            // If the "search" string exists, then build params from it
            if (urlQueryString) {
                keyRegex = new RegExp("([?,&])" + key + "[^&]*");

                // If param exists already, update it
                if (urlQueryString.match(keyRegex) !== null) {
                    params = urlQueryString.replace(keyRegex, "$1" + newParam);
                }
                // Otherwise, add it to end of query string
                else {
                    params = urlQueryString + "&" + newParam;
                }
            }

            window.history.replaceState({}, "", baseUrl + params);
        }
    }
};
</script>

<template lang="html">
    <Tool
        :title="$t(name)"
        :icon="glyphicon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivateGFI="deactivateGFI"
    >
        <template v-slot:toolBody>
            <div
                v-if="active"
                id="mietspiegel"
            >
                <!-- {{ $t("additional:modules.tools.mietspiegel.content") }} -->
                <p>
                    Hinweis:<br>
                    Eine Anleitung finden Sie im Menü unter "Hilfe".
                </p>
                <div
                    v-for="value in values"
                    :key="value.name"
                    :alias="value.alias"
                    class="values"
                    @click="pushValuesBack"
                >
                    <div
                        class="color"
                        :style="{'background-color': value.color}"
                        :alias="value.alias"
                    />{{ value.name }}
                </div>
            </div>
        </template>
    </Tool>
</template>

<style lang="less" scoped>
    #mietspiegel {
        .color {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 1px solid black;
            margin: 5px 10px 5px 5px;
            vertical-align: middle;
        }
        .values {
            cursor: pointer;
        }
        .values:hover {
            border: 2px solid #ff0000;
            font-weight: bold;
        }
    }
</style>
