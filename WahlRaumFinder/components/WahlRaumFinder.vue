<script>
import Tool from "../../../src/modules/tools/Tool.vue";
import {mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersWahlRaumFinder";
import mutations from "../store/mutationsWahlRaumFinder";
import getProxyUrl from "../../../src/utils/getProxyUrl";
import {WFS} from "ol/format.js";
import Feature from "ol/Feature";
import {Point, LineString} from "ol/geom";

export default {
    name: "WahlRaumFinder",
    components: {
        Tool
    },
    computed: {
        ...mapGetters("Tools/WahlRaumFinder", Object.keys(getters)),
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
        ...mapMutations("Tools/WahlRaumFinder", Object.keys(mutations)),

        close (reset) {
            this.setActive(false);

            // TODO replace trigger when Menu is migrated
            // set the backbone model to active false for changing css class in menu (menu/desktop/tool/view.toggleIsActiveClass)
            // else the menu-entry for this tool is always highlighted
            const model = Radio.request("ModelList", "getModelByAttributes", {id: this.$store.state.Tools.WahlRaumFinder.id});

            if (model) {
                model.set("isActive", false);
            }
            if (reset !== false) {
                this.reset();
            }
            this.$store.dispatch("MapMarker/removePointMarker");
        },
        listenToSearchResults () {
            Backbone.Events.listenTo(Radio.channel("Searchbar"), {
                "hit": (hit) => {
                    Radio.trigger("Util", "showLoader");
                    this.mainProcess(hit);
                }
            });
        },
        mainProcess (hit) {
            const addressString = hit.name,
                addressCoord = hit.coordinate,
                gfiUrl = addressCoord ? this.getGfiUrl(addressCoord, this.addressLayerId) : undefined,
                pollingStationId = gfiUrl ? this.derivePollingStationIdFromAddress(gfiUrl) : undefined,
                pollingStationFeature = pollingStationId ? this.derivePollingStationFromWfs(pollingStationId) : undefined;
            let featureCoord = [],
                extent = [],
                featureValues,
                distanceString;

            if (pollingStationFeature) {
                featureCoord = pollingStationFeature.getGeometry().getCoordinates();
                extent = this.createExtent(addressCoord, featureCoord, 100);
                distanceString = this.calculateDistanceString(addressCoord, featureCoord);
                this.addLayerOnMap(addressCoord, featureCoord, distanceString);
                this.setExtentToMap(extent);
                featureValues = this.prepareFeature(pollingStationFeature);
                this.setAddressString(addressString);
                this.setFeatureValues(featureValues);
                this.setDistanceString(distanceString);
                this.setActive(true);
                Radio.trigger("Util", "hideLoader");
            }
            else {
                this.close();
            }
        },
        createExtent (addressCoord, featureCoord, offset) {
            let xMin = 0,
                yMin = 0,
                xMax = 0,
                yMax = 0,
                extent = [xMin, yMin, xMax, yMax];
            const isValidAddressCoord = this.isValidCoord(addressCoord),
                isValidFeatureCoord = this.isValidCoord(featureCoord),
                offsetForExtent = offset ? offset : 0;

            if (isValidAddressCoord && isValidFeatureCoord) {
                xMin = Math.min(addressCoord[0], featureCoord[0]) - offsetForExtent;
                yMin = Math.min(addressCoord[1], featureCoord[1]) - offsetForExtent;
                xMax = Math.max(addressCoord[0], featureCoord[0]) + offsetForExtent;
                yMax = Math.max(addressCoord[1], featureCoord[1]) + offsetForExtent;
                extent = [xMin, yMin, xMax, yMax];
            }

            return extent;
        },
        isValidCoord (coord) {
            const isArray = Array.isArray(coord),
                isLength = isArray && (coord.length === 2 || coord.length === 3) || false,
                isNumber = isArray ? coord.every(function (element) {
                    return typeof element === "number";
                }) : false;

            return isArray && isLength && isNumber;
        },
        setExtentToMap (extent) {
            Radio.trigger("Map", "zoomToExtent", extent);
        },
        calculateDistanceString (addressCoord, featureCoord) {
            const deltaX = addressCoord[0] - featureCoord[0],
                deltaY = addressCoord[1] - featureCoord[1];
            let distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));

            distance = "ca." + Math.round(distance) + "m (Luftlinie)";
            return distance;
        },
        addLayerOnMap (addressCoord, featureCoord, distanceString) {
            const layer = Radio.request("Map", "createLayerIfNotExists", "pollingStationMarker"),
                source = layer.getSource(),
                addressFeature = this.createPointFeatureAndSetStyle(addressCoord, "addressFeature", this.styleId_circle_address, "Adresse"),
                pollingStationFeature = this.createPointFeatureAndSetStyle(featureCoord, "pollingStationFeature", this.styleId_circle_wahlraum, "Wahlraum"),
                distanceFeature = this.createLineFeatureAndSetStyle(addressCoord, featureCoord, "distanceFeature", this.styleId_distance, distanceString);

            source.clear();
            source.addFeature(addressFeature);
            source.addFeature(pollingStationFeature);
            source.addFeature(distanceFeature);
        },
        createPointFeatureAndSetStyle (coord, id, styleId, text) {
            const feature = new Feature({
                    geometry: new Point(coord),
                    id: id,
                    text: text
                }),
                style = Radio.request("StyleList", "returnModelById", styleId);

            if (style) {
                feature.setStyle(style.createStyle(feature, false));
            }
            return feature;
        },

        createLineFeatureAndSetStyle (coord1, coord2, id, styleId, text) {
            const feature = new Feature({
                    geometry: new LineString([coord1, coord2]),
                    id: id,
                    text: text
                }),
                style = Radio.request("StyleList", "returnModelById", styleId);

            if (style) {
                feature.setStyle(style.createStyle(feature, false));
            }
            return feature;
        },
        prepareFeature (feature) {
            let obj = {};

            feature.getKeys().forEach(key => {
                obj[key] = feature.get(key);
            });
            obj = this.mapFeatureAttributes(obj, this.featureAttributes);

            return obj;
        },

        mapFeatureAttributes (obj, featureAttributes) {
            const mappedObj = {};

            Object.keys(featureAttributes).forEach(attr => {
                mappedObj[featureAttributes[attr]] = obj[attr];
            });
            return mappedObj;
        },
        getGfiUrl (coord, addressLayerId) {
            const layer = Radio.request("ModelList", "getModelByAttributes", {id: addressLayerId}),
                resolution = Radio.request("MapView", "getOptions").resolution,
                projection = Radio.request("MapView", "getProjection"),
                gfiUrl = layer.get("layerSource").getFeatureInfoUrl(coord, resolution, projection, {INFO_FORMAT: layer.get("infoFormat"), FEATURE_COUNT: layer.get("featureCount")});

            return gfiUrl;
        },
        derivePollingStationIdFromAddress (url) {
            const proxyUrl = getProxyUrl(url),
                xhr = new XMLHttpRequest(),
                that = this;
            let pollingStationId;

            xhr.open("GET", proxyUrl, false);
            xhr.onload = function (event) {
                pollingStationId = that.parseAddressResponse(event);
            };
            xhr.onerror = function () {
                that.showError();
            };
            xhr.send();
            return pollingStationId;
        },
        parseAddressResponse (event) {
            const currentTarget = event.currentTarget,
                status = currentTarget.status,
                response = currentTarget.response,
                wfsReader = new WFS(),
                addressLayerPollingStationAttribute = this.addressLayerPollingStationAttribute,
                that = this;
            let feature,
                pollingStationId;

            if (status === 200) {
                feature = wfsReader.readFeature(response);
                pollingStationId = feature.get(addressLayerPollingStationAttribute);
            }
            else {
                that.showError();
            }
            return pollingStationId;
        },
        derivePollingStationFromWfs (pollingStationId) {
            const layer = Radio.request("ModelList", "getModelByAttributes", {id: this.pollingStationLayerId}),
                features = layer.get("layer").getSource().getFeatures(),
                pollingStationFeature = features.filter(feature => {
                    const attribute = feature.get(this.pollingStationAttribute),
                        attributeArray = attribute.split(this.pollingStationAttributeSeparator);

                    return attributeArray.includes(pollingStationId);
                })[0];

            if (!pollingStationFeature) {
                this.showError();
            }
            return pollingStationFeature;
        },
        showError () {
            this.$store.dispatch("Alerting/addSingleAlert", {content: "<b>Entschuldigung</b><br>" +
                "Bei der Abfrage ist etwas schiefgelaufen.<br>" +
                "Das Portal konnte den zur Adresse zugehörigen Wahlraum nicht ermitteln.<br>" +
                "Versuchen Sie bitte die Website neu zu starten.<br>" +
                "Falls der Fehler immer noch auftritt, wenden Sie sich bitte an:<br>" +
                "<a href='mailto:" + this.mailTo + "'>" + this.mailTo + "</a>"
            });
            Radio.trigger("Util", "hideLoader");
        },
        reset () {
            const layer = Radio.request("Map", "createLayerIfNotExists", "pollingStationMarker"),
                source = layer.getSource();

            source.clear();
        },
        closeMobileOverlay () {
            this.close(false);
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
                id="wahllokalfinder"
            >
                <!-- {{ $t("additional:modules.tools.WahlRaumFinder.content") }} -->
                <div class="block">
                    <span class="title bold">Adresse: </span>
                    <span class="title">{{ addressString }}</span>
                </div>
                <div class="block">
                    <span class="title bold">Informationen zum Wahlraum:</span>
                    <table class="table text">
                        <tr
                            v-for="(value, key) in featureValues"
                            :key="key"
                        >
                            <td class="bold">
                                {{ key }}
                            </td>
                            <td>{{ value }}</td>
                        </tr>
                        <tr>
                            <td class="bold">
                                Distanz
                            </td>
                            <td>{{ distanceString }}</td>
                        </tr>
                    </table>
                </div>
                <button
                    v-if="isMobile"
                    class="btn btn-primary block mobile-btn-map"
                    @click="closeMobileOverlay"
                >
                    Zurück zur Karte
                </button>
            </div>
        </template>
    </Tool>
</template>

<style lang="scss" scoped>
    #wahllokalfinder {
        .block {
            padding: 10px;
        }
        .mobile-btn-map {
            position: absolute;
            width: 80%;
            left: 10%;
            bottom: 20px;
            background-color: #00aa9b;
            border-color: #00aa9b;
        }
    }
</style>
