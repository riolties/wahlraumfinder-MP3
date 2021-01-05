<script>
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../../../store/gettersRouting";
import mutations from "../../../store/mutationsRouting";
import actions from "../../../store/actionsRouting";

export default {
    name: "AddVehicle",
    computed: {
        ...mapGetters("Tools/Routing", Object.keys(getters))
    },
    // created () {
    //     console.log(this.defaultVehicleSpec);
    // },
    methods: {
        ...mapActions("Tools/Routing", Object.keys(actions)),
        ...mapMutations("Tools/Routing", Object.keys(mutations)),
        confirmVehicle () {
            const id = document.getElementById("vehicle-id").value,
                description = document.getElementById("vehicle-description").value,
                start = document.getElementById("vehicle-start").value.split(","),
                end = document.getElementById("vehicle-end").value.split(","),
                capacity = document.getElementById("vehicle-capacity").value,
                vehicle = {
                    id: parseInt(id, 10),
                    profile: this.profile,
                    description: description,
                    start: [parseFloat(start[0]), parseFloat(start[1])],
                    end: [parseFloat(end[0]), parseFloat(end[1])],
                    capacity: [parseInt(capacity, 10)]
                };

            this.orsoAddVehicle(vehicle);
            this.orsoCreatingVehicle(false);
        },
        cancelVehicle () {
            this.orsoCreatingVehicle(false);
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
                :value="openRouteService.vehicles.length"
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
        <div class="form-group form-group-sm">
            <label for="vehicle-start">Start</label>
            <input
                id="vehicle-start"
                class="float-right"
                type="text"
                placeholder="Bitte Start wählen"
                value="11.64891,48.16289"
            />
        </div>
        <!-- end -->
        <div class="form-group form-group-sm">
            <label for="vehicle-end">Ende</label>
            <input
                id="vehicle-end"
                class="float-right"
                type="text"
                placeholder="Bitte Ziel wählen"
                value="11.64891,48.16289"
            />
        </div>
        <!-- capacity -->
        <div class="form-group form-group-sm">
            <label for="vehicle-capacity">Capacity</label>
            <input
                id="vehicle-capacity"
                class="float-right"
                type="number"
                placeholder="Bitte Kapazität wählen"
                value="80"
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
