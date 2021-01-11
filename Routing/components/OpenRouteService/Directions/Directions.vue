<script>
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../../../store/OpenRouteService/Directions/gettersDirections";
import mutations from "../../../store/OpenRouteService/Directions/mutationsDirections";
import actions from "../../../store/OpenRouteService/Directions/actionsDirections";
import axios from "axios";
import getProxyUrl from "../../../../../src/utils/getProxyUrl";
import {getMapProjection, transform} from "masterportalAPI/src/crs";
import Geocoder from "../Geocoder.vue";

export default {
    name: "Directions",
    components: {
        Geocoder
    },
    computed: {
        ...mapGetters("Map", ["map"]),
        ...mapGetters("Tools/Routing", ["active", "url", "profile", "removeFeaturesFromStore"]),
        ...mapGetters("Tools/Routing/OpenRouteService/Directions", Object.keys(getters))
    },
    methods: {
        ...mapActions("Tools/Routing", ["removeFeaturesFromSource", "addRouteGeoJSONToRoutingLayer"]),
        ...mapActions("Tools/Routing/OpenRouteService/Directions", Object.keys(actions)),
        ...mapMutations("Tools/Routing/OpenRouteService/Directions", Object.keys(mutations)),
        startRouting () {
            const from_coordinates = this.transformCoordinatesFromMapProjection(this.from_address.coordinates, "EPSG:4326"),
                to_coordinates = this.transformCoordinatesFromMapProjection(this.to_address.coordinates, "EPSG:4326"),
                url = this.useProxy ? getProxyUrl(this.url) : this.url,
                apiKey = "5b3ce3597851110001cf62489a7a04728b764689a1eaf55857e43cc2";
            let query = url + "/v2/directions/" + this.profile;

            if (from_coordinates.length === 2 && to_coordinates.length === 2) {
                query += "?start=" + from_coordinates.toString() + "&end=" + to_coordinates.toString() + "&api_key=" + apiKey;
                axios.get(query)
                    .then(response => {
                        console.log(response.data);
                        this.removeFeaturesFromSource();
                        this.addRouteGeoJSONToRoutingLayer(response.data);
                    })
                    .catch(error => {
                        console.log(error);
                    });
            }
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
            layers="address"
            country="Deutschland"
        />
        <Geocoder
            id="to_address"
            from="Directions"
            placeholder="Zieladresse"
            layers="address"
            country="Deutschland"
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
