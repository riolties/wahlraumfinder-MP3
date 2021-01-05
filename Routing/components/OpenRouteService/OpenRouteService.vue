<script>
import {mapGetters, mapMutations} from "vuex";
import getters from "../../store/gettersRouting";
import mutations from "../../store/mutationsRouting";
import OpenRouteServiceDirections from "./Directions/Directions.vue";
import OpenRouteServiceOptimization from "./Optimization/Optimization.vue";

export default {
    name: "OpenRouteService",
    components: {
        OpenRouteServiceDirections,
        OpenRouteServiceOptimization
    },
    computed: {
        ...mapGetters("Tools/Routing", Object.keys(getters))
    },
    methods: {
        ...mapMutations("Tools/Routing", Object.keys(mutations))
    }
};
</script>

<template lang="html">
    <div
        id="openrouteservice"
    >
        <!-- {{ $t("additional:modules.tools.mietspiegel.content") }} -->
        <div
            v-if="routingMode==='Directions'"
        >
            <OpenRouteServiceDirections />
        </div>
        <div
            v-if="routingMode==='Optimization'"
        >
            <OpenRouteServiceOptimization />
        </div>
    </div>
</template>

<style lang="less" scoped>
    #openrouteservice {}
</style>
