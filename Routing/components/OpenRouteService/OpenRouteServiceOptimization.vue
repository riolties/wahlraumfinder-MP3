<script>
import {mapGetters, mapMutations} from "vuex";
import getters from "../../store/gettersRouting";
import mutations from "../../store/mutationsRouting";

export default {
    name: "OpenRouteServiceOptimization",
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
        id="openrouteservice-optimization"
    >
        <!-- {{ $t("additional:modules.tools.mietspiegel.content") }} -->
        {{ routingMode }}: {{ routingType }}
    </div>
</template>

<style lang="less" scoped>
    #openrouteservice-optimization {
        background-color: grey
    }
</style>
