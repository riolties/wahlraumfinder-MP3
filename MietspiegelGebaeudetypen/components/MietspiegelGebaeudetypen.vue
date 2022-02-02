<script>
import Tool from "../../../src/modules/tools/Tool.vue";
import {mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersMietspiegelGebaeudetypen";
import mutations from "../store/mutationsMietspiegelGebaeudetypen";

export default {
    name: "MietspiegelGebaeudetypen",
    components: {
        Tool
    },
    computed: {
        ...mapGetters("Tools/MietspiegelGebaeudetypen", Object.keys(getters)),
        ...mapGetters({
            isMobile: "mobile"
        })
    },
    created () {
        this.listenToSearchResults();
        this.$on("close", this.close);
    },
    /**
     * Put initialize here if mounting occurs after config parsing
     * @returns {void}
     */
    mounted () {
        this.applyTranslationKey(this.name);
    },
    methods: {
        ...mapMutations("Tools/MietspiegelGebaeudetypen", Object.keys(mutations)),

        /**
         * Closes this tool window by setting active to false
         * @returns {void}
         */
        close () {
            this.setActive(false);
            // TODO replace trigger when Menu is migrated
            // set the backbone model to active false for changing css class in menu (menu/desktop/tool/view.toggleIsActiveClass)
            // else the menu-entry for this tool is always highlighted
            const model = Radio.request("ModelList", "getModelByAttributes", {id: this.$store.state.Tools.MietspiegelGebaeudetypen.id});

            if (model) {
                model.set("isActive", false);
            }
        },
        pushValuesBack (evt) {
            const valueToPost = evt.target.attributes.valueToPost.value,
                address = this.address,
                opener = window.opener ? window.opener : null;

            if (opener) {
                this.postMessageUrls.forEach(url => {
                    opener.postMessage({
                        gebaeudetyp: valueToPost,
                        address: address
                    }, url);
                });
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
        :deactivate-gfi="deactivateGFI"
    >
        <template #toolBody>
            <div
                v-if="active"
                id="mietspiegel_gebaeudetypen"
            >
                <!-- {{ $t("additional:modules.tools.mietspiegel.content") }} -->
                <p>
                    Hinweis:<br>
                    Eine Anleitung finden Sie im Menü unter "Hilfe".
                </p>
                <div
                    v-if="isMobile === false"
                >
                    <div
                        v-for="value in values"
                        :key="value.name"
                        class="form-group form-group-xs"
                    >
                        <button
                            :valueToPost="value.valueToPost"
                            class="btn btn-sm btn-block"
                            @click="pushValuesBack"
                        >
                            <span
                                :valueToPost="value.valueToPost"
                                @click="pushValuesBack"
                                @keyup.enter="pushValuesBack"
                            >
                                {{ value.name }}
                            </span>
                        </button>
                    </div>
                </div>
                <div
                    v-if="isMobile === true"
                >
                    <div
                        v-for="value in values"
                        :key="value.name"
                        class="form-group form-group-xs col-xs-6 form-group-mobile"
                    >
                        <button
                            :valueToPost="value.valueToPost"
                            class="btn btn-sm btn-block"
                            @click="pushValuesBack"
                        >
                            <span
                                :valueToPost="value.valueToPost"
                                @click="pushValuesBack"
                                @keyup.enter="pushValuesBack"
                            >
                                {{ value.name_mobile }}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </template>
    </Tool>
</template>

<style lang="less" scoped>
    #mietspiegel_gebaeudetypen {
        button {
            margin-top: 5px;
            margin-bottom: 5px;
            background-color:#e7e7e7;
            color: #00aa9b
        }
        button:hover {
            border: 2px solid #00aa9b;
            font-weight: bold;
        }
        .form-group-mobile {
            padding-left: 5px;
            padding-right: 5px;
            margin-bottom: 5px;
        }
    }
</style>
