<script>
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../../../store/gettersRouting";
import mutations from "../../../store/mutationsRouting";
import actions from "../../../store/actionsRouting";

export default {
    name: "AddJob",
    computed: {
        ...mapGetters("Tools/Routing", Object.keys(getters)),
        id () {
            return Math.round(Math.random() * 1000);
        }
    },
    methods: {
        ...mapActions("Tools/Routing", Object.keys(actions)),
        ...mapMutations("Tools/Routing", Object.keys(mutations)),
        confirmJob () {
            const id = document.getElementById("job-id").value,
                description = document.getElementById("job-description").value,
                location = document.getElementById("job-location").value.split(","),
                service = document.getElementById("job-service").value,
                pickup = document.getElementById("job-pickup").value,
                job = {
                    id: parseInt(id, 10),
                    description: description,
                    location: [parseFloat(location[0]), parseFloat(location[1])],
                    service: parseInt(service, 10),
                    pickup: [parseInt(pickup, 10)]
                };

            this.orsoAddJob(job);
            this.orsoCreatingJob(false);
        },
        cancelJob () {
            this.orsoCreatingJob(false);
        }
    }
};
</script>

<template lang="html">
    <div
        id="openrouteservice-optimization-add-job"
    >
        <!-- id -->
        <div class="form-group form-group-sm">
            <label for="job-id">Id</label>
            <input
                id="job-id"
                class="float-right"
                type="number"
                :value="id"
                disabled
            />
        </div>
        <!-- description -->
        <div class="form-group form-group-sm">
            <label for="job-description">Beschreibung</label>
            <input
                id="job-description"
                class="float-right"
                type="text"
                placeholder="Bitte Beschreibung eingeben"
            />
        </div>
        <!-- location -->
        <div class="form-group form-group-sm">
            <label for="job-location">Koordinaten</label>
            <input
                id="job-location"
                class="float-right"
                type="text"
                placeholder="Bitte Koordinaten setzen wählen"
            />
        </div>
        <!-- service -->
        <div class="form-group form-group-sm">
            <label for="job-service">Dauer</label>
            <input
                id="job-service"
                class="float-right"
                type="number"
                placeholder="Bitte Dauer wählen"
            />
        </div>
        <!-- pickup -->
        <div class="form-group form-group-sm">
            <label for="job-pickup">Menge</label>
            <input
                id="job-pickup"
                class="float-right"
                type="number"
                placeholder="Bitte Anzahl wählen"
            />
        </div>
        <div class="form-group form-group-sm">
            <button
                class="btn btn-sm btn-gsm float-left"
                @click="confirmJob"
            >
                <span>OK</span>
            </button>
            <button
                class="btn btn-sm btn-gsm float-right"
                @click="cancelJob"
            >
                <span>ZURÜCK</span>
            </button>
        </div>
    </div>
</template>

<style lang="less" scoped>
    #openrouteservice-optimization-add-job {
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
