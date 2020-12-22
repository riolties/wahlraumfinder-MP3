<script>
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../../store/gettersRouting";
import mutations from "../../store/mutationsRouting";
import actions from "../../store/actionsRouting";
import axios from "axios";
import getProxyUrl from "../../../../src/utils/getProxyUrl";

export default {
    name: "OpenRouteServiceDirections",
    computed: {
        ...mapGetters("Tools/Routing", Object.keys(getters))
    },
    watch: {
        active (active) {
            console.log("active");
            if (!active) {
                this.removeRoutingLayer();
            }
        }
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
            // const from_x = this.getORSDCoordinatePart("from_x");
            const coordFrom = from_x.value + "," + from_y.value,
                coordTo = to_x.value + "," + to_y.value,
                url = this.useProxy ? getProxyUrl(this.url) : this.url,
                apiKey = "5b3ce3597851110001cf62489a7a04728b764689a1eaf55857e43cc2",
                query = url + "/" + this.profile + "?start=" + coordFrom + "&end=" + coordTo + "&api_key=" + apiKey;

            axios.get(query)
                .then(response => {
                    console.log(response);
                    this.addGeoJSONToRoutingLayer(response.data);
                })
                .catch(error => {
                    console.log(error);

                });
            // axios.post(query, data)
            //     .then(response => {
            //         console.log(response);
            //     });
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
                id="from_x"
                type="number"
                placeholder="Start X"
                value="11.570855787992599"
                @change="coordinatePartChanged"
            />
            <input
                id="from_y"
                type="number"
                placeholder="Start Y"
                value="48.1321665162355"
                @change="coordinatePartChanged"
            />
        </div>
        <div
            class="form-group form-group-sm"
        >
            <input
                id="to_x"
                type="number"
                placeholder="Ziel X"
                value="11.556272788090807"
                @change="coordinatePartChanged"
            />
            <input
                id="to_y"
                type="number"
                placeholder="Ziel Y"
                value="48.14441693714643"
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
