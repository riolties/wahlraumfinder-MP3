<script>
import {mapGetters, mapActions} from "vuex";
import axios from "axios";
import getProxyUrl from "../../../../src/utils/getProxyUrl";
import {getMapProjection, transform} from "masterportalAPI/src/crs";

export default {
    name: "GeocoderTool",
    props: {
        id: {
            type: String,
            required: true
        },
        from: {
            type: String,
            required: true
        },
        placeholder: {
            type: String,
            required: true
        },
        styleId: {
            type: String,
            required: true
        },
        deleteRouteOnClose: {
            type: Boolean,
            required: true
        }
    },
    data () {
        return {
            autocompleteFeatures: [],
            timeout: undefined,
            feature: {}
        };
    },
    computed: {
        ...mapGetters("Tools/Routing", ["url", "layers", "country", "apiKey"]),
        ...mapGetters("Map", ["map"])
    },
    methods: {
        ...mapActions("Tools/Routing", ["generateFeatureAndAddToRoutingLayer", "removeFeatureFromRoutingLayer", "createErrorMessage"]),
        ...mapActions("Tools/Routing/OpenRouteService", ["setFeatureCoordinatesFromGeocoder", "removeFeatureCoordinatesFromGeocoder"]),
        addressChanged (evt) {
            const searchString = evt.currentTarget.value,
                that = this;

            if (searchString.length > 0) {
                if (this.timeout) {
                    clearTimeout(this.timeout);
                }
                this.timeout = setTimeout(function () {
                    that.searchForAddress(searchString);
                }, 500);
            }
        },
        optionSelected (evt) {
            const address = evt.currentTarget.value;

            document.getElementById(this.id).value = address;
            this.setFeature(address);
            this.resetAutocompleteFeatures();
        },
        resetGeocoder () {
            document.getElementById(this.id).value = "";
            this.resetAutocompleteFeatures();
            this.feature = {};
            this.removeFeatureCoordinatesFromGeocoder({from: this.from, id: this.id});
            this.removeFeatureFromRoutingLayer({attribute: "id", value: this.id});
            if (this.deleteRouteOnClose) {
                this.removeFeatureFromRoutingLayer({geometryType: "LineString"});
            }
        },
        searchForAddress (searchString) {
            const url = this.useProxy ? getProxyUrl(this.url) : this.url,
                mapCenter = this.getMapCenterIn4326(),
                focusPoint = "&focus.point.lon=" + mapCenter[0] + "&focus.point.lat=" + mapCenter[1],
                layers = this.layers !== "" ? "&layers=" + this.layers : "",
                country = this.country !== "" ? "&country=" + this.country : "",
                apiKey = this.apiKey !== "" ? "&api_key=" + this.apiKey : "",
                query = url + "/geocode/autocomplete?text=" + searchString + focusPoint + layers + country + apiKey;

            if (apiKey === "") {
                this.createErrorMessage("API Key missing");
            }
            else {
                axios.get(query)
                    .then(response => {
                        // console.log(response.data);
                        this.setAutocompleteFeatures(response.data.features);
                    })
                    .catch(error => {
                        this.createErrorMessage(error);
                    });
            }
        },
        setAutocompleteFeatures (features) {
            const map = ["id", "continent", "country", "region", "macrocounty", "county", "locality", "postalcode", "neighbourhood", "street", "housenumber", "distance"];

            features.forEach(function (feature) {
                feature.properties = Object.keys(feature.properties)
                    .filter(key => map.includes(key))
                    .reduce((obj, key) => {
                        obj[key] = feature.properties[key];
                        return obj;
                    }, {});
                feature.properties.address = feature.properties.street + " " + feature.properties.housenumber + " " + feature.properties.postalcode + " " + feature.properties.locality;
            });
            this.autocompleteFeatures = features;
        },
        resetAutocompleteFeatures () {
            this.autocompleteFeatures = [];
        },
        setFeature (address) {
            const foundFeature = this.autocompleteFeatures.filter(function (feature) {
                    return feature.properties.address === address;
                })[0],
                mapProjection = getMapProjection(this.map),
                coords = this.transformCoordinates("EPSG:4326", mapProjection, foundFeature.geometry.coordinates),
                properties = foundFeature.properties;

            properties.coordinates = coords;
            properties.styleId = this.styleId;
            properties.id = this.id;
            this.feature = properties;
            this.setFeatureCoordinatesFromGeocoder({from: this.from, id: this.id, properties: properties});
            this.generateFeatureAndAddToRoutingLayer(properties);
        },
        getMapCenterIn4326 () {
            const mapCenter = this.map.getView().getCenter(),
                mapProjection = getMapProjection(this.map),
                mapCenter4326 = this.transformCoordinates(mapProjection, "EPSG:4326", mapCenter);

            return mapCenter4326;
        },
        transformCoordinates (fromEPSG, toEPSG, coords) {
            return transform(fromEPSG, toEPSG, coords);
        }
    }
};
</script>

<template lang="html">
    <div
        class="form-group form-group-sm geocoder"
    >
        <input
            :id="id"
            type="text"
            :placeholder="placeholder"
            @keyup="addressChanged"
        >
        <label :for="id">{{ checked }}</label>
        <!-- <datalist :id="id + '_autocomplete'">
            <option
                v-for="autocompleteFeature in autocompleteFeatures"
                :key="autocompleteFeature.properties.id"
            >
                {{ autocompleteFeature.properties.address }}
            </option>
        </datalist> -->
        <div
            v-if="autocompleteFeatures.length > 0"
            class="autocomplete-features"
        >
            <option
                v-for="autocompleteFeature in autocompleteFeatures"
                :key="autocompleteFeature.properties.id"
                class="autocomplete-feature"
                :value="autocompleteFeature.properties.address"
                @click="optionSelected"
            >
                {{ autocompleteFeature.properties.address }}
            </option>
        </div>
        <button
            :id="id + '_reset'"
            class="btn btn-sm btn-gsm"
            @click="resetGeocoder"
        >
            <span class="glyphicon glyphicon-remove" />
        </button>
    </div>
</template>

<style lang="less" scoped>
    .geocoder {
        .autocomplete-features {
            position: absolute;
            background-color: #ffffff;
            border: 1px solid #000000;
            .autocomplete-feature {
                display: inline-block;
                background-color: #ffffff;
            }
            .autocomplete-feature:hover {
                font-weight: bold;
                color: #00aa9b;
                background-color: lightgray;
            }
        }
    }
</style>
