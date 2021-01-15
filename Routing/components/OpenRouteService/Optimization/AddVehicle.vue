<script>
import {mapGetters, mapActions, mapMutations} from "vuex";
import Geocoder from "../Geocoder.vue";

export default {
    name: "AddVehicle",
    components: {
        Geocoder
    },
    computed: {
        ...mapGetters("Tools/Routing", ["profile", "styleIdForStartAddress", "styleIdForEndAddress"]),
        id () {
            return Math.round(Math.random() * 100000).toString();
        }
    },
    methods: {
        ...mapActions("Tools/Routing", ["getFeatureFromRoutingLayer", "removeFeatureFromRoutingLayer"]),
        ...mapMutations("Tools/Routing/OpenRouteService/Optimization", ["addVehicle", "setCreatingVehicle"]),
        async confirmVehicle () {
            const id = this.id,
                description = document.getElementById("vehicle-description").value,
                startFeature = await this.getFeatureFromRoutingLayer(id + "_vehicle-start"),
                endFeature = await this.getFeatureFromRoutingLayer(id + "_vehicle-end"),
                capacity = document.getElementById("vehicle-capacity").value,
                vehicle = {
                    id: id,
                    profile: this.profile,
                    description: description,
                    capacity: [parseInt(capacity, 10)]
                };

            if (startFeature && endFeature) {
                vehicle.start = {
                    address: startFeature.get("address"),
                    coordinates: startFeature.get("coordinates")
                };
                vehicle.end = {
                    address: endFeature.get("address"),
                    coordinates: endFeature.get("coordinates")
                };
                this.addVehicle(vehicle);
                this.setCreatingVehicle(false);
            }
            else {
                this.createErrorMessage("NEED START AND END OF VEHICLE");
            }

        },
        cancelVehicle () {
            this.removeFeatureFromRoutingLayer({attribute: "id", value: this.id + "_vehicle-start"});
            this.removeFeatureFromRoutingLayer({attribute: "id", value: this.id + "_vehicle-end"});
            this.setCreatingVehicle(false);
        }
    }
};
</script>

<template lang="html">
    <div
        id="openrouteservice-optimization-add-vehicle"
    >
        <!-- id -->
        <div class="form-group form-group-sm">
            <label for="vehicle-id">Id</label>
            <input
                id="vehicle-id"
                class="float-right"
                type="number"
                :value="id"
                disabled
            />
        </div>
        <!-- profile -->
        <div class="form-group form-group-sm">
            <label for="vehicle-profile">Profil</label>
            <input
                id="vehicle-profile"
                class="float-right"
                type="text"
                :value="profile"
                disabled
            />
        </div>
        <!-- description -->
        <div class="form-group form-group-sm">
            <label for="vehicle-description">Beschreibung</label>
            <input
                id="vehicle-description"
                class="float-right"
                type="text"
                placeholder="Bitte Beschreibung eingeben"
            />
        </div>
        <!-- start -->
        <label for="vehicle-start">Start</label>
        <Geocoder
            :id="id + '_vehicle-start'"
            from="Optimization"
            placeholder="Startadresse"
            :styleId="styleIdForStartAddress"
            :deleteRouteOnClose="false"
        />
        <!-- end -->
        <label for="vehicle-end">Ende</label>
        <Geocoder
            :id="id + '_vehicle-end'"
            from="Optimization"
            placeholder="Zieladresse"
            :styleId="styleIdForEndAddress"
            :deleteRouteOnClose="false"
        />
        <!-- capacity -->
        <div class="form-group form-group-sm">
            <label for="vehicle-capacity">Capacity</label>
            <input
                id="vehicle-capacity"
                class="float-right"
                type="number"
                placeholder="Bitte Kapazität wählen"
                value="10"
            />
        </div>

        <div class="form-group form-group-sm">
            <button
                class="btn btn-sm btn-gsm float-left"
                @click="confirmVehicle"
            >
                <span>OK</span>
            </button>
            <button
                class="btn btn-sm btn-gsm float-right"
                @click="cancelVehicle"
            >
                <span>ZURÜCK</span>
            </button>
        </div>
    </div>
</template>

<style lang="less" scoped>
    #openrouteservice-optimization-add-vehicle {
        .btn-gsm {
            margin-top: 5px;
            margin-bottom: 5px;
            background-color:#e7e7e7;
            color: #00aa9b
        }
        .btn-gsm:hover {
            font-weight: bold;
        }
        label {
            padding: 5px;
        }
        input[disabled] {
            cursor: not-allowed;
        }
    }
</style>
