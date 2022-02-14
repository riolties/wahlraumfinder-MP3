<script>
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../../../store/OpenRouteService/Optimization/gettersOptimization";
import axios from "axios";
import getProxyUrl from "../../../../../src/utils/getProxyUrl";
import AddVehicle from "./AddVehicle.vue";
import AddJob from "./AddJob.vue";
import {getMapProjection, transform} from "masterportalAPI/src/crs";
import {GeoJSON} from "ol/format.js";

export default {
    name: "OptimizationTool",
    components: {
        AddVehicle,
        AddJob
    },
    computed: {
        ...mapGetters("Map", ["map"]),
        ...mapGetters("Tools/Routing", ["url", "profile", "styleIdForRoute", "apiKey"]),
        ...mapGetters("Tools/Routing/OpenRouteService/Optimization", Object.keys(getters))
    },
    created () {
        this.initiallyAddFeatures();
    },
    methods: {
        ...mapActions("Tools/Routing", ["removeFeatureFromRoutingLayer", "addFeaturesToRoutingLayer", "generateFeatureAndAddToRoutingLayer", "transformCoordinatesFromMapProjection", "createErrorMessage"]),
        ...mapMutations("Tools/Routing/OpenRouteService/Optimization", ["setCreatingVehicle", "addVehicle", "removeVehicle", "setCreatingJob", "addJob", "removeJob", "setTabActive"]),
        initiallyAddFeatures () {
            const jobs = this.$store.state.Tools.Routing.jobs,
                vehicles = this.$store.state.Tools.Routing.vehicles;

            vehicles.forEach(function (vehicle) {
                const propsStart = Object.assign({}, vehicle.start, {id: vehicle.id + "_vehicle-start"}),
                    propsEnd = Object.assign({}, vehicle.start, {id: vehicle.id + "_vehicle-end"});

                this.addVehicle(vehicle);
                this.generateFeatureAndAddToRoutingLayer(propsStart);
                this.generateFeatureAndAddToRoutingLayer(propsEnd);
            }, this);
            jobs.forEach(function (job) {
                this.addJob(job);
                this.generateFeatureAndAddToRoutingLayer(job);
            }, this);
        },
        enableCreatingVehicle () {
            this.setCreatingVehicle(true);
        },
        removeVehicleFromStore (evt) {
            const vehicleId = evt.target.getAttribute("vehicle-id");

            this.removeVehicle(vehicleId);
            this.removeRoute();
            this.removeFeatureFromRoutingLayer({attribute: "id", value: vehicleId + "_vehicle-start"});
            this.removeFeatureFromRoutingLayer({attribute: "id", value: vehicleId + "_vehicle-end"});
        },
        enableCreatingJob () {
            this.setCreatingJob(true);
        },
        removeJobFromStore (evt) {
            const jobId = evt.target.getAttribute("job-id");

            this.removeJob(jobId);
            this.removeRoute();
            this.removeFeatureFromRoutingLayer({attribute: "id", value: jobId});
        },
        removeRoute () {
            this.removeFeatureFromRoutingLayer({geometryType: "LineString"});
        },
        prepareVehicles () {
            const vehicles = this.vehicles,
                clonedVehicles = JSON.parse(JSON.stringify(vehicles)); // deep copy array

            clonedVehicles.forEach(function (clonedVehicle) {
                clonedVehicle.id = parseInt(clonedVehicle.id, 10);
                clonedVehicle.start = this.transformCoordinatesFromMapProjection({coords: clonedVehicle.start.coordinates, toEPSG: "EPSG:4326"});
                clonedVehicle.end = this.transformCoordinatesFromMapProjection({coords: clonedVehicle.end.coordinates, toEPSG: "EPSG:4326"});

            }, this);
            return clonedVehicles;
        },
        prepareJobs () {
            const jobs = this.jobs,
                clonedJobs = JSON.parse(JSON.stringify(jobs)); // deep copy array

            clonedJobs.forEach(function (clonedJob) {
                clonedJob.id = parseInt(clonedJob.id, 10);
                clonedJob.location = this.transformCoordinatesFromMapProjection({coords: clonedJob.coordinates, toEPSG: "EPSG:4326"});
            }, this);
            return clonedJobs;
        },
        transformCoordinatesFromMapProjection (obj) {
            const coords = obj.coords,
                toEPSG = obj.toEPSG,
                mapProjection = getMapProjection(this.map);

            return transform(mapProjection, toEPSG, coords);
        },
        startRouting () {
            const url = this.useProxy ? getProxyUrl(this.url) : this.url,
                apiKey = this.apiKey,
                query = url + "/optimization",
                payload = {
                    vehicles: this.prepareVehicles(),
                    jobs: this.prepareJobs()
                },
                headers = {};

            if (apiKey !== "") {
                headers.Authorization = apiKey;
            }

            axios.post(query, payload, {
                headers: headers
            })
                .then(response => {
                    const routes = response.data.routes;

                    // console.log(response.data);
                    this.removeFeatureFromRoutingLayer({geometryType: "LineString"});
                    routes.forEach(route => {
                        const steps = route.steps;

                        for (let i = 0; i < steps.length - 1; i++) {
                            const currentStep = i,
                                nextStep = i + 1,
                                fromLocation = steps[currentStep].location,
                                toLocation = steps[nextStep].location;

                            this.startRoutingBetweenSingleSteps(url, fromLocation, toLocation);
                        }
                    });

                })
                .catch(error => {
                    this.createErrorMessage(error);
                });
        },
        startRoutingBetweenSingleSteps (url, fromLocation, toLocation) {
            const coordFrom = fromLocation.toString(),
                coordTo = toLocation.toString(),
                apiKey = this.apiKey !== "" ? "&api_key=" + this.apiKey : "",
                query = url + "/v2/directions/" + this.profile + "?start=" + coordFrom + "&end=" + coordTo + apiKey;

            axios.get(query)
                .then(response => {
                    // console.log(response.data);
                    this.addRouteToRoutingLayer(response.data);
                })
                .catch(error => {
                    this.createErrorMessage(error);
                });
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
        activateTab (evt) {
            const value = parseInt(evt.target.getAttribute("value"), 10);

            this.setTabActive(value);
        }
    }
};
</script>

<template lang="html">
    <div
        id="openrouteservice-optimization"
    >
        <!-- {{ $t("additional:modules.tools.mietspiegel.content") }} -->
        <!-- {{ routingMode }}: {{ routingType }} -->
        <div
            id="tabs"
        >
            <div class="tabs">
                <a
                    :class="[activeTab === 1 ? 'active' : '']"
                    value="1"
                    @click="activateTab"
                    @keyup.enter="activateTab"
                >Vehicles</a>
                <a
                    :class="[activeTab === 2 ? 'active' : '']"
                    value="2"
                    @click="activateTab"
                    @keyup.enter="activateTab"
                >Jobs</a>
                <a
                    :class="[activeTab === 3 ? 'active' : '']"
                    value="3"
                    @click="activateTab"
                    @keyup.enter="activateTab"
                >Summary</a>
            </div>

            <div class="content">
                <div
                    v-if="activeTab === 1"
                    class="tabcontent"
                >
                    <div
                        v-if="creatingVehicle === false"
                    >
                        <table
                            v-for="vehicle in vehicles"
                            :id="'vehicle_'+ vehicle.id"
                            :key="vehicle.id"
                            class="vehicle"
                        >
                            <tr><td>Id</td><td>{{ vehicle.id }}</td></tr>
                            <tr><td>Profil</td><td>{{ vehicle.profile }}</td></tr>
                            <tr><td>Beschreibung</td><td>{{ vehicle.description }}</td></tr>
                            <tr><td>Start</td><td>{{ vehicle.start.address }}</td></tr>
                            <tr><td>End</td><td>{{ vehicle.end.address }}</td></tr>
                            <tr><td>Kapazität</td><td>{{ vehicle.capacity }}</td></tr>
                            <tr>
                                <td>
                                    <button
                                        v-if="creatingVehicle === false"
                                        class="btn btn-sm btn-gsm"
                                        :vehicle-id="vehicle.id"
                                        @click="removeVehicleFromStore"
                                    >
                                        <span
                                            class="glyphicon glyphicon-minus"
                                            :vehicle-id="vehicle.id"
                                        />
                                        <span
                                            :vehicle-id="vehicle.id"
                                        >Fahrzeug entfernen</span>
                                    </button>
                                </td>
                            </tr>
                        </table>
                    </div>
                    <button
                        v-if="creatingVehicle === false"
                        class="btn btn-sm btn-gsm"
                        @click="enableCreatingVehicle"
                    >
                        <span class="glyphicon glyphicon-plus" />
                        <span>Fahrzeug hinzufügen</span>
                    </button>
                    <AddVehicle
                        v-if="creatingVehicle === true"
                    />
                </div>
                <div
                    v-if="activeTab === 2"
                    class="tabcontent"
                >
                    <div
                        v-if="creatingJob === false"
                    >
                        <table
                            v-for="job in jobs"
                            :id="'job_'+ job.id"
                            :key="job.id"
                            class="job"
                        >
                            <tr><td>Id</td><td>{{ job.id }}</td></tr>
                            <tr><td>Beschreibung</td><td>{{ job.description }}</td></tr>
                            <tr><td>Addresse</td><td>{{ job.address }}</td></tr>
                            <tr><td>Dauer</td><td>{{ job.service }}</td></tr>
                            <tr><td>Menge</td><td>{{ job.pickup }}</td></tr>
                            <tr>
                                <td>
                                    <button
                                        v-if="creatingJob === false"
                                        class="btn btn-sm btn-gsm"
                                        :job-id="job.id"
                                        @click="removeJobFromStore"
                                    >
                                        <span
                                            class="glyphicon glyphicon-minus"
                                            :job-id="job.id"
                                        />
                                        <span
                                            :job-id="job.id"
                                        >Auftrag entfernen</span>
                                    </button>
                                </td>
                                <td />
                            </tr>
                        </table>
                    </div>
                    <button
                        v-if="creatingJob === false"
                        class="btn btn-sm btn-gsm"
                        @click="enableCreatingJob"
                    >
                        <span class="glyphicon glyphicon-plus" />
                        <span>Auftrag hinzufügen</span>
                    </button>
                    <AddJob
                        v-if="creatingJob === true"
                    />
                </div>
                <div
                    v-if="activeTab === 3"
                    class="tabcontent"
                >
                    Lorem ipsum dolor si amet
                </div>
            </div>
        </div>

        <button
            class="btn btn-sm btn-block btn-gsm"
            @click="startRouting"
        >
            Routing berechnen
        </button>
    </div>
</template>

<style lang="scss" scoped>
    #openrouteservice-optimization {
        .btn-gsm {
            margin-top: 5px;
            margin-bottom: 5px;
            background-color:#e7e7e7;
            color: #00aa9b
        }
        .btn-gsm:hover {
            font-weight: bold;
        }
        .vehicle,
        .job {
            margin-bottom: 10px;
            border: 2px solid #00aa9b
        }
        #tabs {
            width: 100%;
            padding: unset;

            /* Style the tabs */
            .tabs {
                overflow: hidden;
                margin-left: 20px;
                margin-bottom: -2px; // hide bottom border
            }

            .tabs ul {
                list-style-type: none;
                margin-left: 20px;
            }

            .tabs a{
                float: left;
                cursor: pointer;
                padding: 12px 24px;
                transition: background-color 0.2s;
                border: 1px solid #ccc;
                border-right: none;
                background-color: #f1f1f1;
                border-radius: 10px 10px 0 0;
                font-weight: bold;
                color: #00aa9b;
            }
            .tabs a:last-child {
                border-right: 1px solid #ccc;
            }

            /* Change background color of tabs on hover */
            .tabs a:hover {
                background-color: #aaa;
                color: #fff;
            }

            /* Styling for active tab */
            .tabs a.active {
                background-color: #fff;
                color: #484848;
                border-bottom: 2px solid #fff;
                cursor: default;
            }

            /* Style the tab content */
            .tabcontent {
                padding: 30px;
                border: 1px solid #ccc;
                border-radius: 10px;
                box-shadow: 3px 3px 6px #e1e1e1;
                overflow: hidden;
            }
        }
    }
</style>
