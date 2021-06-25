<script>
import Tool from "../../../src/modules/tools/Tool.vue";
import {mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersWahlRaumFinder";
import mutations from "../store/mutationsWahlRaumFinder";
import getProxyUrl from "../../../src/utils/getProxyUrl";
import {WFS} from "ol/format.js";

export default {
    name: "WahlRaumFinder",
    components: {
        Tool
    },
    computed: {
        ...mapGetters("Tools/WahlRaumFinder", Object.keys(getters))
    },
    created () {
        this.listenToSearchResults();
        this.$on("close", this.close);

        // fake search result
        setTimeout(function () {
            Backbone.Radio.trigger("Searchbar", "hit", {
                name: "FakeAddresse",
                coordinate: [5334186, 691340]
            });
        }, 2000);
    },
    /**
     * Put initialize here if mounting occurs after config parsing
     * @returns {void}
     */
    mounted () {
        this.applyTranslationKey(this.name);
    },
    methods: {
        ...mapMutations("Tools/WahlRaumFinder", Object.keys(mutations)),

        /**
         * Closes this tool window by setting active to false
         * @returns {void}
         */
        close () {
            this.setActive(false);

            // TODO replace trigger when Menu is migrated
            // set the backbone model to active false for changing css class in menu (menu/desktop/tool/view.toggleIsActiveClass)
            // else the menu-entry for this tool is always highlighted
            const model = Radio.request("ModelList", "getModelByAttributes", {id: this.$store.state.Tools.WahlRaumFinder.id});

            if (model) {
                model.set("isActive", false);
            }
        },
        listenToSearchResults () {
            Backbone.Events.listenTo(Radio.channel("Searchbar"), {
                "hit": (hit) => {
                    this.mainProcess(hit);
                }
            });
        },
        mainProcess (hit) {
            console.log(hit);
            const addressString = hit.name,
                addressCoord = hit.coordinate,
                gfiUrl = addressCoord ? this.getGfiUrl(addressCoord, this.addressLayerId) : undefined,
                pollingStationId = gfiUrl ? this.derivePollingStationFromAddress(gfiUrl) : undefined;
                
                console.log(pollingStationId);
        },
        getGfiUrl: function (coord, addressLayerId) {
            const layer = Radio.request("ModelList", "getModelByAttributes", {id: addressLayerId}),
                resolution = Radio.request("MapView", "getOptions").resolution,
                projection = Radio.request("MapView", "getProjection"),
                gfiUrl = layer.get("layerSource").getFeatureInfoUrl(coord, resolution, projection, {INFO_FORMAT: layer.get("infoFormat"), FEATURE_COUNT: layer.get("featureCount")});

            return gfiUrl;
        },
        derivePollingStationFromAddress: function (url) {
            const proxyUrl = getProxyUrl(url),
                xhr = new XMLHttpRequest(),
                that = this;
            let pollingStationId;
    console.log(proxyUrl);
            xhr.open("GET", proxyUrl, false);
            xhr.onload = function (event) {
                pollingStationId = that.parseAddressResponse(event);
            };
            xhr.onerror = function () {
                Radio.trigger("Alert", "alert", {
                    text: "<b>Entschuldigung</b><br>" +
                    "Bei der Abfrage ist etwas schiefgelaufen.<br>" +
                    "Das Portal konnte das zur Adresse zugehörige Wahllokal nicht ermitteln.<br>" +
                    "Versuchen Sie bitte die Website neu zu starten.<br>" +
                    "Falls der Fehler immer noch auftritt, wenden Sie sich bitte an:<br>" +
                    "<a href='mailto:" + this.get("mailTo") + "'>" + this.get("mailTo") + "</a>",
                    confirmable: true
                });
            };
            xhr.send();
            return pollingStationId;
        },
        parseAddressResponse: function (event) {
            const currentTarget = event.currentTarget,
                status = currentTarget.status,
                response = currentTarget.response,
                wfsReader = new WFS(),
                addressLayerPollingStationAttribute = this.addressLayerPollingStationAttribute;
            let feature,
                pollingStationId;

            if (status === 200) {
                feature = wfsReader.readFeature(response);
                pollingStationId = feature.get(addressLayerPollingStationAttribute);
            }
            else {
                Radio.trigger("Alert", "alert", {
                    text: "<b>Entschuldigung</b><br>" +
                    "Bei der Abfrage ist etwas schiefgelaufen.<br>" +
                    "Das Portal konnte das zur Adresse zugehörige Wahllokal nicht ermitteln.<br>" +
                    "Versuchen Sie bitte die Website neu zu starten.<br>" +
                    "Falls der Fehler immer noch auftritt, wenden Sie sich bitte an:<br>" +
                    "<a href='mailto:" + this.mailTo + "'>" + this.mailTo + "</a>",
                    confirmable: true
                });
            }
            return pollingStationId;
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
                id="vue-addon"
            >
                <!-- {{ $t("additional:modules.tools.WahlRaumFinder.content") }} -->
                Hello World!
            </div>
        </template>
    </Tool>
</template>
