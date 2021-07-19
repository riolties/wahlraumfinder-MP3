<script>
import Tool from "../../../src/modules/tools/Tool.vue";
import {mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersPotree";
import mutations from "../store/mutationsPotree";

export default {
    name: "Potree",
    components: {
        Tool
    },
    computed: {
        ...mapGetters("Tools/Potree", Object.keys(getters))
    },
    watch: {
        active: function (newActive) {
            if (newActive === true) {
                this.startPotree();
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
        // this.initialize();
    },
    methods: {
        ...mapMutations("Tools/Potree", Object.keys(mutations)),

        close () {
            this.setActive(false);

            // TODO replace trigger when Menu is migrated
            // set the backbone model to active false for changing css class in menu (menu/desktop/tool/view.toggleIsActiveClass)
            // else the menu-entry for this tool is always highlighted
            const model = Radio.request("ModelList", "getModelByAttributes", {id: this.$store.state.Tools.Potree.id});

            if (model) {
                model.set("isActive", false);
            }
        },
        initialize () {
            console.log("InitializePotree");
            this.loadExternalJs("http://muenchen3d.de/potree/libs/jquery/jquery-3.1.1.min.js");
            this.loadExternalJs("http://muenchen3d.de/potree/libs/proj4/proj4.js");
            this.loadExternalJs("http://muenchen3d.de/potree/libs/potree/potree.js");
            this.createPotreeDivs();
        },
        createPotreeDivs () {
            const map_wrapper = document.getElementById("map-wrapper"),
                div_potree_container = document.createElement("div"),
                div_potree_render_area = document.createElement("div"),
                div_potree_sidebar_container = document.createElement("div");

            div_potree_container.setAttribute("class", "potree_container");
            div_potree_render_area.setAttribute("id", "potree_render_area");
            div_potree_sidebar_container.setAttribute("id", "potree_sidebar_container");

            div_potree_container.appendChild(div_potree_render_area);
            div_potree_container.appendChild(div_potree_sidebar_container);
            map_wrapper.appendChild(div_potree_container);
        },
        startPotree () {
            console.log("StartPotree");
            this.initialize();
            const viewer = new window.Potree.Viewer(document.getElementById("potree_render_area"));

            viewer.setEDLEnabled(true);
            viewer.setFOV(60);
            viewer.setPointBudget(2_000_000);
            // INCLUDE SETTINGS HERE
            viewer.loadSettingsFromURL();
            viewer.setDescription("");
            viewer.loadGUI(() => {
                viewer.setLanguage("en");
                $("#menu_appearance").next().show();
                $("#menu_tools").next().show();
                $("#menu_clipping").next().show();
                viewer.toggleSidebar();
            });
            window.viewer = viewer;
        },
        loadExternalJs (url) {
            const script = document.createElement("script");

            script.setAttribute("src", url);
            document.head.appendChild(script);
        },
        async load () {
        // specify point clouds that are to be loaded and callbacks to invoke 
            const pointclouds = [
                {
                    url: "http://muenchen3d.de/potree/pointclouds/Koppstrasse_Luft_01/metadata.json",
                    callback: (pointcloud) => {
                        pointcloud.name = "Koppstrasse_Luft_01";
                        console.log("Loading: ", pointcloud.name);

                        const material = pointcloud.material;

                        material.size = 1;
                        material.pointSizeType = window.Potree.PointSizeType.ADAPTIVE;
                        material.shape = window.Potree.PointShape.SQUARE;
                        material.activeAttributeName = "rgba";
                    }
                }
            ];

            // start loading all point clouds asynchronously, get a promise for each one that resolves when it's loaded
            let promises = pointclouds.map(p => window.Potree.loadPointCloud(p.url));

            // now iterate over all promises in order
            for (let i = 0; i < promises.length; i++) {

                // wait until this point cloud is loaded before processing the next one
                let pointcloud = (await promises[i]).pointcloud;

                pointclouds[i].callback(pointcloud);
                window.viewer.scene.addPointCloud(pointcloud);
            }


            window.viewer.fitToScreen();

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
                id="potree"
            >
                FOOBAR
            </div>
        </template>
    </Tool>
</template>

<style lang="less" scoped>
    #potree {
        // .potree_container {
        //     position: absolute;
        //     width: 100%;
        //     height: 100%;
        //     left: 0px;
        //     top:0px;
        // }
    }
</style>
