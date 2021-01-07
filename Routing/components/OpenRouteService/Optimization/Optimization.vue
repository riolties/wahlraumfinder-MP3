<script>
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../../../store/gettersRouting";
import mutations from "../../../store/mutationsRouting";
import actions from "../../../store/actionsRouting";
import axios from "axios";
import getProxyUrl from "../../../../../src/utils/getProxyUrl";
import {getMapProjection, transform} from "masterportalAPI/src/crs";
import AddVehicle from "./AddVehicle.vue";
import AddJob from "./AddJob.vue";

export default {
    name: "Optimization",
    components: {
        AddVehicle,
        AddJob
    },
    computed: {
        ...mapGetters("Map", ["map"]),
        ...mapGetters("Tools/Routing", Object.keys(getters))
    },
    watch: {
        active (active) {
            console.log(active);
            if (active) {
                this.initiallyAddFeatures();
            }
        }
    },
    methods: {
        ...mapActions("Tools/Routing", Object.keys(actions)),
        ...mapMutations("Tools/Routing", Object.keys(mutations)),
        enableCreatingVehicle () {
            this.orsoCreatingVehicle(true);
        },
        removeVehicle (evt) {
            const vehicleId = parseInt(evt.target.getAttribute("vehicle-id"), 10);

            this.orsoRemoveVehicle(vehicleId);
            this.removeFeaturesFromSource({attribute: "id", value: vehicleId});
        },
        enableCreatingJob () {
            this.orsoCreatingJob(true);
        },
        removeJob (evt) {
            const jobId = parseInt(evt.target.getAttribute("job-id"), 10);

            this.orsoRemoveJob(jobId);
            this.removeFeaturesFromSource({attribute: "id", value: jobId});
        },
        coordinatePartChanged (evt) {
            const id = evt.target.id,
                value = parseFloat(evt.target.value);

            this.setORSDCoordinatePart({id, value});

        },
        transformVehicleCoordinates () {
            const vehicles = this.openRouteService.vehicles,
                clonedVehicles = JSON.parse(JSON.stringify(vehicles)); // copy array

            clonedVehicles.forEach(function (clonedVehicle) {
                clonedVehicle.start = this.transformCoordinates(clonedVehicle.start);
                clonedVehicle.end = this.transformCoordinates(clonedVehicle.end);
            }, this);
            return clonedVehicles;
        },
        transformJobCoordinates () {
            const jobs = this.openRouteService.jobs,
                clonedJobs = JSON.parse(JSON.stringify(jobs)); // copy array

            clonedJobs.forEach(function (clonedJob) {
                clonedJob.location = this.transformCoordinates(clonedJob.location);
            }, this);
            return clonedJobs;
        },
        transformCoordinates (coords) {
            const mapProjection = getMapProjection(this.map);

            return transform(mapProjection, "EPSG:4326", coords);
        },
        startRouting () {
            const url = this.useProxy ? getProxyUrl(this.url) : this.url,
                apiKey = "5b3ce3597851110001cf62489a7a04728b764689a1eaf55857e43cc2",
                query = url + "/optimization",
                payload = {
                    vehicles: this.transformVehicleCoordinates(),
                    jobs: this.transformJobCoordinates()
                };

            axios.post(query, payload, {
                headers: {
                    Authorization: apiKey
                }
            })
                .then(response => {
                    const routes = response.data.routes;

                    console.log(response.data);
                    this.removeFeaturesFromSource({geometry: "LineString"});
                    routes.forEach(route => {
                        const steps = route.steps;

                        for (let i = 0; i < steps.length - 1; i++) {
                            const currentStep = i,
                                nextStep = i + 1,
                                fromLocation = steps[currentStep].location,
                                toLocation = steps[nextStep].location;

                            this.startRoutingBetweenSingleSteps(url, apiKey, fromLocation, toLocation);
                        }
                    });

                }).catch(error => {
                    console.log(error);
                });
        },
        startRoutingBetweenSingleSteps (url, apiKey, fromLocation, toLocation) {
            const coordFrom = fromLocation.toString(),
                coordTo = toLocation.toString(),
                query = url + "/v2/directions/" + this.profile + "?start=" + coordFrom + "&end=" + coordTo + "&api_key=" + apiKey;

            axios.get(query)
                .then(response => {
                    console.log(response.data);
                    this.addRouteGeoJSONToRoutingLayer(response.data);
                })
                .catch(error => {
                    console.log(error);

                });
        },
        activateTab (evt) {
            const value = parseInt(evt.target.getAttribute("value"), 10);

            this.orsoSetTabActive(value);
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
                >Vehicles</a>
                <a
                    :class="[activeTab === 2 ? 'active' : '']"
                    value="2"
                    @click="activateTab"
                >Jobs</a>
                <a
                    :class="[activeTab === 3 ? 'active' : '']"
                    value="3"
                    @click="activateTab"
                >Summary</a>
            </div>

            <div class="content">
                <div
                    v-if="activeTab === 1"
                    class="tabcontent"
                >
                    <div
                        v-if="openRouteService.creatingVehicle === false"
                    >
                        <table
                            v-for="vehicle in openRouteService.vehicles"
                            :id="'vehicle_'+ vehicle.id"
                            :key="vehicle.id"
                            class="vehicle"
                        >
                            <tr><td>Id</td><td>{{ vehicle.id }}</td></tr>
                            <tr><td>Profil</td><td>{{ vehicle.profile }}</td></tr>
                            <tr><td>Beschreibung</td><td>{{ vehicle.description }}</td></tr>
                            <tr><td>Start</td><td>{{ vehicle.start }}</td></tr>
                            <tr><td>End</td><td>{{ vehicle.end }}</td></tr>
                            <tr><td>Kapazität</td><td>{{ vehicle.capacity }}</td></tr>
                            <tr><td>StyleId</td><td>{{ vehicle.styleId }}</td></tr>
                            <tr>
                                <td>
                                    <button
                                        v-if="openRouteService.creatingVehicle === false"
                                        class="btn btn-sm btn-gsm"
                                        :vehicle-id="vehicle.id"
                                        @click="removeVehicle"
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
                                <td></td>
                            </tr>
                        </table>
                    </div>
                    <button
                        v-if="openRouteService.creatingVehicle === false"
                        class="btn btn-sm btn-gsm"
                        @click="enableCreatingVehicle"
                    >
                        <span class="glyphicon glyphicon-plus" />
                        <span>Fahrzeug hinzufügen</span>
                    </button>
                    <AddVehicle
                        v-if="openRouteService.creatingVehicle === true"
                    />
                </div>
                <div
                    v-if="activeTab === 2"
                    class="tabcontent"
                >
                    <div
                        v-if="openRouteService.creatingJob === false"
                    >
                        <table
                            v-for="job in openRouteService.jobs"
                            :id="'job_'+ job.id"
                            :key="job.id"
                            class="job"
                        >
                            <tr><td>Id</td><td>{{ job.id }}</td></tr>
                            <tr><td>Beschreibung</td><td>{{ job.description }}</td></tr>
                            <tr><td>Koordinaten</td><td>{{ job.location }}</td></tr>
                            <tr><td>Dauer</td><td>{{ job.service }}</td></tr>
                            <tr><td>Menge</td><td>{{ job.pickup }}</td></tr>
                            <tr><td>StyleId</td><td>{{ job.styleId }}</td></tr>
                            <tr>
                                <td>
                                    <button
                                        v-if="openRouteService.creatingJob === false"
                                        class="btn btn-sm btn-gsm"
                                        :job-id="job.id"
                                        @click="removeJob"
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
                                <td></td>
                            </tr>
                        </table>
                    </div>
                    <button
                        v-if="openRouteService.creatingJob === false"
                        class="btn btn-sm btn-gsm"
                        @click="enableCreatingJob"
                    >
                        <span class="glyphicon glyphicon-plus" />
                        <span>Auftrag hinzufügen</span>
                    </button>
                    <AddJob
                        v-if="openRouteService.creatingJob === true"
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

<style lang="less" scoped>
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
