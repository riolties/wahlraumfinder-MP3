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
        // this.getSearchstringFromUrl();
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
                opener = window.opener ? window.opener.document : null;

            if (opener) {
                const form_lage = opener.getElementById("formwohnlage"),
                    input_address = opener.getElementsByName("str")[0];

                form_lage.target = alias;
                form_lage.str = address;
                input_address.value = address;
                form_lage.submit();
                window.opener = self;
                window.close();
            }
        },
        // getSearchstringFromUrl () {
        //     const urlParams = location.search.substr(1).split("&");

        //     urlParams.forEach(urlParam => {
        //         const key = urlParam.split("=")[0],
        //             value = decodeURI(urlParam.split("=")[1]);

        //         if (key.toLowerCase() === "str") {
        //             document.getElementById("searchInput").value = value;
        //             Backbone.Radio.trigger("Searchbar", "search", value);
        //         }
        //     });
        // },
        listenToSearchResults () {
            Backbone.Events.listenTo(Radio.channel("Searchbar"), {
                "hit": (hit) => {
                    const addressName = hit.name.split(",")[0];

                    this.updateUrlParams("query", addressName);
                    // this.updateUrlParams("str", addressName);
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
                    Hinweis: Bitte schauen Sie sich in der Karte die Position des Markers an.
                    Klicken Sie dann hier auf die Farbe, auf welcher der Marker sitzt.
                    Sie werden dann automatisch zurück zum Formular geführt.
                </p>
                <div
                    v-for="value in values"
                    :key="value.name"
                    :alias="value.alias"
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
            border: 1px solid black
        }
    }
</style>
