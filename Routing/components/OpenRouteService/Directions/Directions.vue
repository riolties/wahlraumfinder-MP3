<script>
import {mapGetters, mapActions} from "vuex";
import axios from "axios";
import getProxyUrl from "../../../../../src/utils/getProxyUrl";
import {getMapProjection, transform} from "masterportalAPI/src/crs";
import Geocoder from "../Geocoder.vue";
import {GeoJSON} from "ol/format.js";

export default {
    name: "Directions",
    components: {
        Geocoder
    },
    computed: {
        ...mapGetters("Map", ["map"]),
        ...mapGetters("Tools/Routing", ["url", "apiKey", "profile", "styleIdForStartAddress", "styleIdForEndAddress", "styleIdForRoute"]),
        ...mapGetters("Tools/Routing/OpenRouteService/Directions", ["from_address", "to_address"])
    },
    methods: {
        ...mapActions("Tools/Routing", ["getFeatureFromRoutingLayer", "removeFeatureFromRoutingLayer", "addFeaturesToRoutingLayer", "createErrorMessage"]),
        async startRouting () {
            const fromFeature = await this.getFeatureFromRoutingLayer("from_address"),
                toFeature = await this.getFeatureFromRoutingLayer("to_address"),
                from_coordinates = fromFeature ? this.transformCoordinatesFromMapProjection(fromFeature.get("coordinates"), "EPSG:4326") : [],
                to_coordinates = toFeature ? this.transformCoordinatesFromMapProjection(toFeature.get("coordinates"), "EPSG:4326") : [],
                url = this.useProxy ? getProxyUrl(this.url) : this.url,
                apiKey = this.apiKey !== "" ? "&api_key=" + this.apiKey : "",
                query = url + "/v2/directions/" + this.profile + "?start=" + from_coordinates.toString() + "&end=" + to_coordinates.toString() + apiKey;

            if (apiKey === "") {
                this.createErrorMessage("API Key missing");
            }
            else if (from_coordinates.length !== 2 || to_coordinates.length !== 2) {
                this.createErrorMessage("Need start and destination");
            }
            else {
                axios.get(query)
                    .then(response => {
                        // console.log(response.data);
                        this.removeFeatureFromRoutingLayer({geometryType: "LineString"});
                        this.addRouteToRoutingLayer(response.data);
                    })
                    .catch(error => {
                        this.createErrorMessage(error);
                    });
            }
        },
        addRouteToRoutingLayer (geojson) {
            const mapProjection = getMapProjection(this.map),
                format = new GeoJSON({
                    dataProjection: "EPSG:4326",
                    featureProjection: mapProjection
                }),
                features = format.readFeatures(geojson);

            features.forEach(function (feature) {
                feature.set("styleId", this.styleIdForRoute);
            }, this);
            this.addFeaturesToRoutingLayer(features);
        },
        transformCoordinatesFromMapProjection (coords, toEPSG) {
            const mapProjection = getMapProjection(this.map),
                transformedCoords = coords.length === 2 ? transform(mapProjection, toEPSG, coords) : [];

            return transformedCoords;
        }
    }
};
</script>

<template lang="html">
    <div
        id="openrouteservice-directions"
    >
        <!-- {{ $t("additional:modules.tools.mietspiegel.content") }} -->
        <Geocoder
            id="from_address"
            from="Directions"
            placeholder="Startadresse"
            :style-id="styleIdForStartAddress"
            :delete-route-on-close="true"
        />
        <Geocoder
            id="to_address"
            from="Directions"
            placeholder="Zieladresse"
            :style-id="styleIdForEndAddress"
            :delete-route-on-close="true"
        />
        <button
            class="btn btn-sm btn-block btn-gsm"
            @click="startRouting"
        >
            Routing berechnen
        </button>
    </div>
</template>

<style lang="less" scoped>
    #openrouteservice-directions {
        .btn-gsm {
            margin-top: 5px;
            margin-bottom: 5px;
            background-color:#e7e7e7;
            color: #00aa9b
        }
        .btn-gsm:hover {
            // border: 2px solid #00aa9b;
            font-weight: bold;
        }
    }
</style>
