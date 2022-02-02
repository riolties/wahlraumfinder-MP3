<script>
import Tool from "../../../src/modules/tools/Tool.vue";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersRouting";
import OpenRouteService from "./OpenRouteService/OpenRouteService.vue";

export default {
    name: "Routing",
    components: {
        Tool,
        OpenRouteService
    },
    computed: {
        ...mapGetters("Tools/Routing", Object.keys(getters))
    },
    watch: {
        active (active) {
            if (active) {
                this.addRoutingLayer();
                // this.initiallyAddFeatures();
            }
            else {
                this.removeRoutingLayer();
            }
        }
    },
    created () {
        this.$on("close", this.close);
    },
    /**
     * Put initialize here if mounting occurs after config parsing
     * @returns {void}
     */
    mounted () {
        this.applyTranslationKey(this.name);
    },
    methods: {
        ...mapActions("Tools/Routing", ["addRoutingLayer", "removeRoutingLayer", "initiallyAddFeatures"]),
        ...mapMutations("Tools/Routing", ["applyTranslationKey"]),

        /**
         * Closes this tool window by setting active to false
         * @returns {void}
         */
        close () {
            this.setActive(false);

            // TODO replace trigger when Menu is migrated
            // set the backbone model to active false for changing css class in menu (menu/desktop/tool/view.toggleIsActiveClass)
            // else the menu-entry for this tool is always highlighted
            const model = Radio.request("ModelList", "getModelByAttributes", {id: this.$store.state.Tools.Routing.id});

            if (model) {
                model.set("isActive", false);
            }
        }
    }
};
</script>

<template lang="html">
    <Tool
        :title="$t(name)"
        :icon="glyphicon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivate-gfi="deactivateGFI"
    >
        <template #toolBody>
            <div
                v-if="active"
                id="routing"
            >
                <!-- {{ $t("additional:modules.tools.mietspiegel.content") }} -->
                <OpenRouteService
                    v-if="routingType==='OpenRouteService'"
                />
            </div>
        </template>
    </Tool>
</template>

<style lang="less" scoped>
    #routing {}
</style>
