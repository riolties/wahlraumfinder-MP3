<script>
import ToolTemplate from "../../../src/modules/tools/ToolTemplate.vue";
import {mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersMietspiegelGebaeudetypen";
import mutations from "../store/mutationsMietspiegelGebaeudetypen";
import Multiselect from "vue-multiselect";

export default {
    name: "MietspiegelGebaeudetypen",
    components: {
        ToolTemplate,
        Multiselect
    },
    data () {
        return {
            mobileSelected: null
        };
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
    methods: {
        ...mapMutations("Tools/MietspiegelGebaeudetypen", Object.keys(mutations)),
        pushValuesBack (evt) {
            // in desktop mode obj is an event, in mobile is ist an object
            const valueToPost = evt instanceof Event ? evt.target.attributes.valueToPost.value : evt.valueToPost,
                address = this.address,
                opener = window.opener ? window.opener : null;

            if (opener) {
                this.postMessageUrls.forEach((url) => {
                    opener.postMessage(
                        {
                            gebaeudetyp: String(valueToPost),
                            address: address
                        },
                        url
                    );
                });
                window.close();
            }
        },
        listenToSearchResults () {
            Backbone.Events.listenTo(Radio.channel("Searchbar"), {
                hit: (hit) => {
                    const addressName = hit.name.split(",")[0];

                    this.updateUrlParams("query", addressName);
                    this.setAddress(addressName);
                }
            });
        },
        updateUrlParams (key, value) {
            const baseUrl = [
                    location.protocol,
                    "//",
                    location.host,
                    location.pathname
                ].join(""),
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
        },
        /**
         * Closes this tool window by setting active to false
         * @returns {void}
         */
        close () {
            this.setActive(false);
            // TODO replace trigger when Menu is migrated
            // set the backbone model to active false for changing css class in menu (menu/desktop/tool/view.toggleIsActiveClass)
            // else the menu-entry for this tool is always highlighted
            const model = Radio.request("ModelList", "getModelByAttributes", {
                id: "mietspiegelGebaeudetypen"
            });

            if (model) {
                model.set("isActive", false);
            }
        },
        watch: {
            mobileSelected (newValue) {
                // on mobile and deselect the new value is null
                if (newValue) {
                    this.pushValuesBack(newValue);
                }
            }
        }
    }
};
</script>

<template lang="html">
    <ToolTemplate
        :title="name"
        :icon="glyphicon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivate-gfi="deactivateGFI"
    >
        <template
            v-if="active"
            #toolBody
        >
            <div
                id="mietspiegel_gebaeudetypen"
            >
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
                <!-- https://vue-multiselect.js.org/ -->
                    <Multiselect
                        v-model="mobileSelected"
                        :options="values"
                        :multiple="false"
                        placeholder="Bitte Gebäudetyp wählen!"
                    >
                        <!-- template für die ausgesuchte option -->
                        <template
                            slot="singleLabel"
                            slot-scope="props"
                        >
                            <span class="option__desc">
                                <span class="option__title">
                                    {{ props.option.name_mobile }}
                                </span>
                            </span>
                        </template>

                        <!-- template für jede option -->
                        <template
                            slot="option"
                            slot-scope="props"
                        >
                            <div class="option__desc">
                                <span class="option__title">
                                    {{ props.option.name_mobile }}
                                </span>
                            </div>
                        </template>
                    </Multiselect>
                </div>
            </div>
        </template>
    </ToolTemplate>
</template>

<style lang="scss" scoped>
#mietspiegel_gebaeudetypen {
  button {
    margin-top: 5px;
    margin-bottom: 5px;
    background-color: #e7e7e7;
    color: #00aa9b;
    width: 100%;
  }
  button:hover {
    border: 2px solid #00aa9b;
    font-weight: bold;
  }
}
</style>
