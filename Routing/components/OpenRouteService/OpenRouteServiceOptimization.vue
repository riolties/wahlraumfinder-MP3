<script>
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../../store/gettersRouting";
import mutations from "../../store/mutationsRouting";
import actions from "../../store/actionsRouting";
import axios from "axios";
import getProxyUrl from "../../../../src/utils/getProxyUrl";

export default {
    name: "OpenRouteServiceOptimization",
    computed: {
        ...mapGetters("Tools/Routing", Object.keys(getters))
    },
    // fake from and to coordinates
    created () {
        this.setORSDCoordinatePart({id: "from_x", value: "11.64891"});
        this.setORSDCoordinatePart({id: "from_y", value: "48.16289"});
        this.setORSDCoordinatePart({id: "to_x", value: "11.64891"});
        this.setORSDCoordinatePart({id: "to_y", value: "48.16289"});
    },
    methods: {
        ...mapActions("Tools/Routing", Object.keys(actions)),
        ...mapMutations("Tools/Routing", Object.keys(mutations)),
        addVia () {
            this.addViaToStore();
        },
        removeVia (evt) {
            const index = parseInt(evt.target.getAttribute("index"), 10);

            this.removeViaFromStore(index);
        },
        coordinatePartChanged (evt) {
            const id = evt.target.id,
                value = parseFloat(evt.target.value);

            this.setORSDCoordinatePart({id, value});

        },
        generatePayload () {
            const jobs = this.generateJobs(),
                vehicles = this.generateVehicles(),
                payload = {
                    jobs,
                    vehicles
                };

            return payload;
        },
        generateJobs () {
            const vias = this.openRouteService.vias,
                jobs = [];

            vias.forEach((via, index) => {
                const job = {
                    id: index,
                    description: via.description,
                    location: [via.x, via.y],
                    service: via.service,
                    pickup: via.pickup
                };

                jobs.push(job);
            });

            return jobs;
        },
        generateVehicles () {
            const from_x = this.openRouteService.from.x,
                from_y = this.openRouteService.from.y,
                to_x = this.openRouteService.to.x,
                to_y = this.openRouteService.to.y,
                vehicles = [];

            vehicles.push({
                id: 0,
                profile: this.profile,
                description: "FOOBAR",
                start: [from_x, from_y],
                end: [to_x, to_y],
                capacity: [80]
            });

            return vehicles;
        },
        startRouting () {
            const url = this.useProxy ? getProxyUrl(this.url) : this.url,
                apiKey = "5b3ce3597851110001cf62489a7a04728b764689a1eaf55857e43cc2",
                query = url + "/optimization",
                payload = this.generatePayload();

            axios.post(query, payload, {
                headers: {
                    Authorization: apiKey
                }
            })
                .then(response => {
                    const routes = response.data.routes;

                    console.log(response.data);
                    this.clearSource();
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
                    this.addGeoJSONToRoutingLayer(response.data);
                })
                .catch(error => {
                    console.log(error);

                });
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
        <div id="vias">
            <div
                v-for="(via, pos) in openRouteService.vias"
                :key="pos"
                class="form-group form-group-sm"
            >
                <input
                    :id="'via_'+ pos + '_x'"
                    type="number"
                    step="0.00001"
                    placeholder="Via X"
                    :value="via.x"
                    @change="coordinatePartChanged"
                />
                <input
                    :id="'via_'+ pos + '_y'"
                    type="number"
                    step="0.00001"
                    placeholder="Via Y"
                    :value="via.y"
                    @change="coordinatePartChanged"
                />
                <button
                    :index="pos"
                    class="btn btn-sm btn-gsm"
                    @click="removeVia"
                >
                    <span
                        class="glyphicon glyphicon-minus"
                        :index="pos"
                    />
                </button>
            </div>
            <button
                class="btn btn-sm btn-gsm"
                @click="addVia"
            >
                <span class="glyphicon glyphicon-plus" />
                <span>Via hinzufügen</span>
            </button>
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
    #openrouteservice-optimization {
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
