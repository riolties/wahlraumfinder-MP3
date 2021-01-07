<script>
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../../../store/gettersRouting";
import mutations from "../../../store/mutationsRouting";
import actions from "../../../store/actionsRouting";
import axios from "axios";
import getProxyUrl from "../../../../../src/utils/getProxyUrl";
import {getMapProjection, transform} from "masterportalAPI/src/crs";

export default {
    name: "Directions",
    data: () => ({
        timeout: null
    }),
    computed: {
        ...mapGetters("Map", ["map"]),
        ...mapGetters("Tools/Routing", Object.keys(getters))
    },
    watch: {
        active (active) {
            if (!active) {
                this.removeRoutingLayer();
            }
        }
    },

    // fake from and to coordinates
    created () {
        this.setORSDCoordinatePart({id: "from_x", value: "11.57085"});
        this.setORSDCoordinatePart({id: "from_y", value: "48.13216"});
        this.setORSDCoordinatePart({id: "to_x", value: "11.55627"});
        this.setORSDCoordinatePart({id: "to_y", value: "48.14441"});
    },
    methods: {
        ...mapActions("Tools/Routing", Object.keys(actions)),
        ...mapMutations("Tools/Routing", Object.keys(mutations)),
        coordinatePartChanged (evt) {
            const id = evt.target.id,
                value = parseFloat(evt.target.value);

            this.setORSDCoordinatePart({id, value});

        },
        startRouting () {
            const from_x = this.openRouteService.from.x,
                from_y = this.openRouteService.from.y,
                to_x = this.openRouteService.to.x,
                to_y = this.openRouteService.to.y,
                coordFrom = from_x + "," + from_y,
                coordTo = to_x + "," + to_y,
                url = this.useProxy ? getProxyUrl(this.url) : this.url,
                apiKey = "5b3ce3597851110001cf62489a7a04728b764689a1eaf55857e43cc2",
                query = url + "/v2/directions/" + this.profile + "?start=" + coordFrom + "&end=" + coordTo + "&api_key=" + apiKey;

            axios.get(query)
                .then(response => {
                    console.log(response.data);
                    this.removeFeaturesFromSource();
                    this.addRouteGeoJSONToRoutingLayer(response.data);
                })
                .catch(error => {
                    console.log(error);

                });
        },
        startAddressChanged (evt) {
            const value = evt.currentTarget.value,
                that = this;

            if (this.timeout) {
                clearTimeout(this.timeout);
            }
            this.timeout = setTimeout(function () {
                if (value.length > 0) {
                    that.searchForAddress(value);
                }
            }, 500, this);
        },
        searchForAddress (searchString) {
            const url = this.useProxy ? getProxyUrl(this.url) : this.url,
                focusPoint = this.getFocusPointIn4326(),
                focusPointParam = "&focus.point.lon=" + focusPoint[0] + "&focus.point.lat=" + focusPoint[1],
                layers = "&layers=address",
                country = "&country=Deutschland",
                apiKey = "5b3ce3597851110001cf62489a7a04728b764689a1eaf55857e43cc2",
                query = url + "/geocode/autocomplete?text=" + searchString + focusPointParam + layers + country + "&api_key=" + apiKey;

            axios.get(query)
                .then(response => {
                    console.log(response.data);
                })
                .catch(error => {
                    console.log(error);

                });
        },
        getFocusPointIn4326 () {
            const mapProjection = getMapProjection(this.map),
                mapCenter = this.map.getView().getCenter();
            let focusPoint = this.focusPoint;

            if (this.focusPoint) {
                focusPoint = transform(mapProjection, "EPSG:4326", focusPoint);
            }
            else {
                focusPoint = transform(mapProjection, "EPSG:4326", mapCenter);
            }
            console.log(focusPoint);
            return focusPoint;
        }
    }
};
</script>

<template lang="html">
    <div
        id="openrouteservice-directions"
    >
        <!-- {{ $t("additional:modules.tools.mietspiegel.content") }} -->
        <!-- {{ routingType }}: {{ routingMode }} -->
        <div
            class="form-group form-group-sm"
        >
            <input
                id="from_address"
                type="text"
                placeholder="Startadresse"
                @keyup="startAddressChanged"
            />
        </div>
        <div
            class="form-group form-group-sm"
        >
            <input
                id="from_x"
                type="number"
                step="0.00001"
                placeholder="Start X"
                :value="openRouteService.from.x"
                @change="coordinatePartChanged"
            />
            <input
                id="from_y"
                type="number"
                step="0.00001"
                placeholder="Start Y"
                :value="openRouteService.from.y"
                @change="coordinatePartChanged"
            />
        </div>
        <div
            class="form-group form-group-sm"
        >
            <input
                id="to_x"
                type="number"
                step="0.00001"
                placeholder="Ziel X"
                :value="openRouteService.to.x"
                @change="coordinatePartChanged"
            />
            <input
                id="to_y"
                type="number"
                step="0.00001"
                placeholder="Ziel Y"
                :value="openRouteService.to.y"
                @change="coordinatePartChanged"
            />
        </div>
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
