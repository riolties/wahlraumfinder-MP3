<script>
import {mapGetters, mapActions, mapMutations} from "vuex";
import Geocoder from "../Geocoder.vue";

export default {
    name: "AddJob",
    components: {
        Geocoder
    },
    computed: {
        ...mapGetters("Tools/Routing", ["styleIdForJob"]),
        id () {
            return Math.round(Math.random() * 100000).toString();
        }
    },
    methods: {
        ...mapActions("Tools/Routing", ["getFeatureFromRoutingLayer", "removeFeatureFromRoutingLayer"]),
        ...mapMutations("Tools/Routing/OpenRouteService/Optimization", ["addJob", "setCreatingJob"]),
        async confirmJob () {
            const id = this.id,
                description = document.getElementById("job-description").value,
                feature = await this.getFeatureFromRoutingLayer(id),
                service = document.getElementById("job-service").value,
                pickup = document.getElementById("job-pickup").value,
                job = {
                    id: id,
                    description: description,
                    service: parseInt(service, 10),
                    pickup: [parseInt(pickup, 10)]
                };

            if (feature) {
                job.address = feature.get("address");
                job.coordinates = feature.get("coordinates");
                this.addJob(job);
                this.setCreatingJob(false);
            }
            else {
                console.log("NEED address for JOB");
            }
        },
        cancelJob () {
            console.log(this.id);
            this.removeFeatureFromRoutingLayer({attribute: "id", value: this.id});
            this.setCreatingJob(false);
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
        <!-- address -->
        <label for="job-description">Adresse</label>
        <Geocoder
            :id="id"
            from="Optimization"
            placeholder="Adresse"
            :styleId="styleIdForJob"
            :deleteRouteOnClose="false"
        />
        <!-- service -->
        <div class="form-group form-group-sm">
            <label for="job-service">Dauer</label>
            <input
                id="job-service"
                class="float-right"
                type="number"
                placeholder="Bitte Dauer wählen"
                value="0"
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
                value="1"
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
