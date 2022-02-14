<script>
import {mapGetters} from "vuex";
import Directions from "./Directions/DirectionsTool.vue";
import Optimization from "./Optimization/OptimizationTool.vue";

export default {
    name: "OpenRouteServiceTool",
    components: {
        Directions,
        Optimization
    },
    computed: {
        ...mapGetters("Tools/Routing", ["routingMode"])
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
            <Directions />
        </div>
        <div
            v-if="routingMode==='Optimization'"
        >
            <Optimization />
        </div>
    </div>
</template>

<style lang="scss" scoped>
    // #openrouteservice {}
</style>
