<script>
import {mapGetters} from "vuex";
import Directions from "./Directions/Directions.vue";
import Optimization from "./Optimization/Optimization.vue";

export default {
    name: "OpenRouteService",
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

<style lang="less" scoped>
    #openrouteservice {}
</style>
