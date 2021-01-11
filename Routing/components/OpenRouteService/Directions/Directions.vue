<script>
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../../../store/OpenRouteService/Directions/gettersDirections";
import mutations from "../../../store/OpenRouteService/Directions/mutationsDirections";
import actions from "../../../store/OpenRouteService/Directions/actionsDirections";
import axios from "axios";
import getProxyUrl from "../../../../../src/utils/getProxyUrl";
import {getMapProjection, transform} from "masterportalAPI/src/crs";

export default {
    name: "Directions",
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
            const from_coordinates = this.from_address.coordinates.toString(),
                to_coordinates = this.to_address.coordinates.toString(),
                url = this.useProxy ? getProxyUrl(this.url) : this.url,
                apiKey = "5b3ce3597851110001cf62489a7a04728b764689a1eaf55857e43cc2",
                query = url + "/v2/directions/" + this.profile + "?start=" + from_coordinates + "&end=" + to_coordinates + "&api_key=" + apiKey;

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
        transformCoordinatesFromMapProjection (obj) {
            const coords = obj.coords,
                toEPSG = obj.toEPSG,
                mapProjection = getMapProjection(this.map);

            return transform(mapProjection, toEPSG, coords);
        },
        addressChanged (evt) {
            const searchString = evt.currentTarget.value,
                id = evt.currentTarget.id,
                allowSearchForAddress = this[id].allowSearchForAddress,
                that = this;

            if (searchString.length > 0 && allowSearchForAddress) {
                if (this.timeout) {
                    clearTimeout(this.timeout);
                }
                this.setTimeout(setTimeout(function () {
                    that.searchForAddress(searchString, id);
                }, 500));
            }
        },
        optionSelected (evt) {
            const label = evt.currentTarget.value,
                id = evt.currentTarget.id;

            this.setAllowSearchForAddress({id, value: false});
            this.setCoordinatesFromAutocompleteFeature({id, label});
            this.resetAutocompleteFeatures(id);
        },
        resetSearchString (evt) {
            const addressInputId = evt.currentTarget.value;

            document.getElementById(addressInputId).value = "";
            this.resetAutocompleteFeatures(addressInputId);
            this.setAllowSearchForAddress({id: addressInputId, value: true});
        },
        searchForAddress (searchString, target) {
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
                    this.addAutocompleteFeatures({features: response.data.features, target: target});
                })
                .catch(error => {
                    console.log(error);

                });
        },
        getFocusPointIn4326 () {
            const mapCenter = this.map.getView().getCenter();
            let focusPoint = this.focusPoint;

            if (this.focusPoint) {
                focusPoint = this.transformCoordinatesFromMapProjection({coords: focusPoint, toEPSG: "EPSG:4326"});
            }
            else {
                focusPoint = this.transformCoordinatesFromMapProjection({coords: mapCenter, toEPSG: "EPSG:4326"});
            }
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
                list="from_address_autocomplete"
                @keyup="addressChanged"
                @change="optionSelected"
            />
            <datalist id="from_address_autocomplete">
                <option
                    v-for="feature in from_address.autocompleteFeatures"
                    :key="feature.properties.id"
                >
                    {{ feature.properties.label }}
                </option>
            </datalist>
            <button
                id="from_address_reset"
                class="btn btn-sm btn-gsm"
                value="from_address"
                @click="resetSearchString"
            >
                <span class="glyphicon glyphicon-remove" />
            </button>
        </div>
        <div
            class="form-group form-group-sm"
        >
            <input
                id="to_address"
                type="text"
                placeholder="Zieladresse"
                list="to_address_autocomplete"
                @keyup="addressChanged"
                @change="optionSelected"
            />
            <datalist id="to_address_autocomplete">
                <option
                    v-for="feature in to_address.autocompleteFeatures"
                    :key="feature.properties.id"
                >
                    {{ feature.properties.label }}
                </option>
            </datalist>
            <button
                id="to_address_reset"
                class="btn btn-sm btn-gsm"
                value="to_address"
                @click="resetSearchString"
            >
                <span class="glyphicon glyphicon-remove" />
            </button>
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
