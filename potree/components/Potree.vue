<script>
import Tool from "../../../src/modules/tools/Tool.vue";
import {mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersPotree";
import mutations from "../store/mutationsPotree";
import getProxyUrl from "../../../src/utils/getProxyUrl";

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
        this.initialize();
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
            this.hidePotreeContainer();
        },
        hidePotreeContainer () {
            const className = document.getElementsByClassName("potree_container")[0].className;

            document.getElementsByClassName("potree_container")[0].className = className + " hidden";
        },
        showPotreeContainer () {
            const className = document.getElementsByClassName("potree_container")[0].className;

            document.getElementsByClassName("potree_container")[0].className = className.replace(" hidden", "");
        },
        initialize () {
            console.log("InitializePotree");
            this.loadExternalCssFiles();
            this.loadExternalJsFiles();
            this.createPotreeDivs();
        },
        loadExternalCssFiles () {
            this.externalCssFiles.forEach(url => {
                const proxyUrl = this.useProxy ? getProxyUrl(url) : url;

                this.loadExternalCss(proxyUrl);
            });
        },
        loadExternalCss (url) {
            const script = document.createElement("link");

            script.setAttribute("rel", "stylesheet");
            script.setAttribute("type", "text/css");
            script.setAttribute("href", url);
            document.head.appendChild(script);
        },
        loadExternalJsFiles () {
            this.externalJsFiles.forEach(url => {
                const proxyUrl = this.useProxy ? getProxyUrl(url) : url;

                this.loadExternalJs(proxyUrl);
            });
        },
        loadExternalJs (url) {
            const script = document.createElement("script");

            script.setAttribute("src", url);
            document.head.appendChild(script);
        },
        createPotreeDivs () {
            const map_wrapper = document.getElementById("map-wrapper"),
                div_potree_container = document.createElement("div"),
                div_potree_render_area = document.createElement("div");
                // div_potree_sidebar_container = document.createElement("div");

            div_potree_container.setAttribute("class", "potree_container");
            div_potree_render_area.setAttribute("id", "potree_render_area");
            // div_potree_sidebar_container.setAttribute("id", "potree_sidebar_container");

            div_potree_container.appendChild(div_potree_render_area);
            // div_potree_container.appendChild(div_potree_sidebar_container);
            map_wrapper.appendChild(div_potree_container);
        },
        startPotree () {
            console.log("StartPotree: ");
            console.log(window.Potree);
            const viewer = new window.Potree.Viewer(document.getElementById("potree_render_area"));

            this.showPotreeContainer();
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
            this.load();
        },
        async load () {
        // specify point clouds that are to be loaded and callbacks to invoke
            const pointClouds = this.pointClouds;
            let promises = [];

            pointClouds.forEach(pointCloud => {
                pointCloud.url = this.useProxy ? getProxyUrl(pointCloud.url) : pointCloud.url;
            });

            // start loading all point clouds asynchronously, get a promise for each one that resolves when it's loaded
            promises = pointClouds.map(p => window.Potree.loadPointCloud(p.url));

            for (let i = 0; i < promises.length; i++) {

                // wait until this point cloud is loaded before processing the next one
                const pointcloud = (await promises[i]).pointcloud;

                pointcloud.name = pointClouds[i].name;
                pointcloud.material = this.setPointcloudMaterial(pointcloud.material);
                console.log("Loading: ", pointcloud.name);
                window.viewer.scene.addPointCloud(pointcloud);
            }

            window.viewer.fitToScreen();
        },
        setPointcloudMaterial (material) {
            material.size = 1;
            material.pointSizeType = window.Potree.PointSizeType.ADAPTIVE;
            material.shape = window.Potree.PointShape.SQUARE;
            material.activeAttributeName = "rgba";
            return material;
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
                <!-- <div id="potree_sidebar_container" /> -->
                <div
                    class="form-group form-group-xs"
                >
                    <button
                        v-for="pointCloud in pointClouds"
                        :key="pointCloud.name"
                        class="btn btn-xs btn-block btn-active"
                    >
                        {{ pointCloud.name }}
                    </button>
                </div>
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
        #potree_sidebar_container {
            position: unset;
            width: 300px;
        }
        .hidden {
            display: none;
        }
        button {
            margin-top: 5px;
            margin-bottom: 5px;
            background-color:#e7e7e7;
            color: #00aa9b;
        }
        button:hover {
            border: 2px solid #00aa9b;
            font-weight: bold;
        }
    }
</style>
