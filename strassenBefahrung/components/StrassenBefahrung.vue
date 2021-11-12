<script>
import Tool from "../../../src/modules/tools/Tool.vue";
import {mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersStrassenBefahrung";
import mutations from "../store/mutationsStrassenBefahrung";
import Feature from "ol/Feature.js";
import Point from "ol/geom/Point.js";
import {GeoJSON} from "ol/format.js";
import LoaderOverlay from "../../../src/utils/loaderOverlay";

export default {
    name: "StrassenBefahrung",
    components: {
        Tool
    },
    computed: {
        ...mapGetters("Tools/StrassenBefahrung", Object.keys(getters)),
        ...mapGetters("Map", ["map"])
        // ...mapGetters({
        //     isMobile: "mobile"
        // })
    },
    watch: {
        active: function (newActive) {
            if (newActive === true) {
                this.setStartInitInfra3d(true);
            }
        }
    },
    created () {
        this.$on("close", this.close);
    },
    updated () {
        // needs to wait until html is loaded because infra3d api needs div to append itself.
        // so watches for change in active, then sets the flag startInitInfra3D
        if (this.startInitInfra3d) {
            this.createEnnLayer();
            this.createMarkerLayer(this.coords);
            this.hideMarker();
            this.styleFeature();
            this.initInfra3d();
            this.setStartInitInfra3d(false);
        }
    },
    /**
     * Put initialize here if mounting occurs after config parsing
     * @returns {void}
     */
    mounted () {
        this.applyTranslationKey(this.name);
        this.loadInfra3dApi();
    },
    methods: {
        ...mapMutations("Tools/StrassenBefahrung", Object.keys(mutations)),

        close () {
            this.setActive(false);

            // TODO replace trigger when Menu is migrated
            // set the backbone model to active false for changing css class in menu (menu/desktop/tool/view.toggleIsActiveClass)
            // else the menu-entry for this tool is always highlighted
            const model = Radio.request("ModelList", "getModelByAttributes", {id: this.$store.state.Tools.StrassenBefahrung.id});

            if (model) {
                model.set("isActive", false);
            }
            this.hideMarker();
        },
        loadInfra3dApi: function () {
            const script = document.createElement("script");

            script.setAttribute("src", "https://infra3d.ch/latest/api/js/infra3dapi.js");
            document.head.appendChild(script);
        },
        /**
         * Creates an Layer for the edge-node-network.
         * @fires Core#RadioRequestMapCreateLayerIfNotExists
         * @returns {void}
         */
        createEnnLayer () {
            let ennLayer;

            if (this.loadEdgeNodeNetwork) {
                ennLayer = Radio.request("Map", "createLayerIfNotExists", "strassenBefahrung_enn");
                this.setEnnLayer(ennLayer);
            }
        },

        /**
         * Creates an Layer for the marker.
         * Sets the style on the feature.
         * @param {Number[]} coords Coordinates of feature
         * @fires Core#RadioRequestMapCreateLayerIfNotExists
         * @returns {void}
         */
        createMarkerLayer (coords) {
            const layer = Radio.request("Map", "createLayerIfNotExists", "strassenBefahrung"),
                feature = new Feature({
                    geometry: new Point(coords)
                });

            if (layer) {
                layer.getSource().addFeature(feature);
            }

            this.setMarkerLayer(layer);
        },
        styleFeature () {
            const layer = this.markerLayer,
                feature = layer ? layer.getSource().getFeatures()[0] : undefined,
                oldStyle = feature ? feature.getStyle() : undefined,
                oldImage = oldStyle ? oldStyle.getImage() : null,
                rotation = oldImage ? oldImage.getRotation() : null,
                styleModel = Radio.request("StyleList", "returnModelById", this.markerStyleId);
            let newStyle,
                newImage;

            if (styleModel) {
                feature.setStyle(styleModel.createStyle(feature, false));

                if (rotation) {
                    newStyle = feature.getStyle() || null;
                    newImage = newStyle ? newStyle.getImage() : null;
                    newImage.setRotation(rotation);
                }
            }
        },
        initInfra3d: function () {
            const infra3d = window.infra3d,
                divId = "infra3d-div",
                url = "https://client-v3.infra3d.ch",
                coord = this.coords,
                options = {
                    easting: coord[0],
                    northing: coord[1],
                    epsg: this.epsg,
                    lang: "de",
                    map: false,
                    buttons: [],
                    layer: false,
                    navigation: false,
                    loginurl: "https://auth.infra3d.ch/api/v1/login"
                };

            if (this.user !== "" && this.password !== "") {
                options.credentials = [this.user, this.password];
            }
            if (infra3d) {
                this.showLoader();
                infra3d.init(divId, url, options, this.infra3dInitialized, this);
                this.setMarker(coord);
                this.hideLoader();
            }
            else {
                console.error("Infra3D is not loaded!");
            }
        },
        /**
         * Callback function if infra3d initialized. Listens to positionChanged of API.
         * @returns {void}
         */
        infra3dInitialized () {
            if (this.loadEdgeNodeNetwork) {
                this.getEnn();
            }
            this.setOnPositionChanged();
        },

        /**
         * Gets the edge-node-network and fills the ennLayer.
         * @returns {void}
         */
        getEnn () {
            // const mapView = this.map.getView(),
            //     mapSize = this.map.getSize(),
            //     currentExtent = mapView.calculateExtent(mapSize);
            // console.log(currentExtent);
            this.showLoader();
            window.infra3d.getEnn(this.epsgNumber, function (enn) {
                this.createEdgeNodeNetworkLayer(enn);
            }, this);
        },
        setOnPositionChanged () {
            window.infra3d.setOnPositionChanged(function (easting, northing, height, epsg, orientation) {
                this.showMarker([easting, northing, height], orientation);
            }, this);
        },

        /**
         * Fills the ennLayer with the features from the GeoJSON.
         * @param {JSON} json Enn as GeoJSON.
         * @returns {void}
         */
        createEdgeNodeNetworkLayer (json) {
            const layer = this.ennLayer,
                source = layer.getSource(),
                formatJSON = new GeoJSON(),
                features = formatJSON.readFeatures(json),
                styleModel = Radio.request("StyleList", "returnModelById", this.ennStyleId);

            if (styleModel) {
                layer.setStyle(styleModel.createStyle(features[0], false));
            }
            this.clearEnnLayer();
            source.addFeatures(features);
            this.hideLoader();
        },
        /**
         * Clears the edge-node-network layer.
         * @returns {void}
         */
        clearEnnLayer () {
            this.ennLayer.getSource().clear();
        },
        setMarker (coord) {
            this.showMarker(coord);
            Radio.trigger("MapView", "setCenter", coord);
            // this.removeInteraction();
        },
        showMarker (coord, orientation) {
            const layer = this.markerLayer,
                feature = layer.getSource().getFeatures()[0],
                style = feature.getStyle(),
                image = style ? style.getImage() : null;

            let rotationInRad;

            layer.setVisible(true);
            feature.getGeometry().setCoordinates(coord);
            if (orientation && image) {
                rotationInRad = orientation * Math.PI / 180;
                image.setRotation(rotationInRad);
            }
            this.setCoords(coord);
        },
        hideMarker () {
            if (this.markerLayer) {
                this.markerLayer.setVisible(false);
            }
        },
        showLoader () {
            LoaderOverlay.show();
        },
        hideLoader () {
            LoaderOverlay.hide();
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
                id="strassenbefahrung"
            >
                <!-- {{ $t("additional:modules.tools.StrassenBefahrung.content") }} -->
                <!-- <div id="infra3d-btn-list">
                    <button
                        class="btn btn-default btn-marker"
                        title="Platzieren Sie den Marker in der Karte um dort mit der Strassenbefahrung zu starten."
                    >
                        <span class="glyphicon glyphicon-map-marker" />Platziere Marker in Karte
                    </button>
                    <button
                        class="btn btn-default btn-nav"
                        title="Wechseln Sie zwischen den verfügbaren Kameras"
                    >
                        <span class="glyphicon glyphicon-list" />Kamera wechseln
                    </button>
                </div> -->
                <div
                    id="infra3d-div"
                />
            </div>
        </template>
    </Tool>
</template>

<style lang="less" scoped>
    #strassenbefahrung {
        width: 100%;
        height: 100%;
        #infra3d-btn-list {
            padding: 5px;
            .glyphicon {
                padding-left: 5px;
                padding-right: 5px;
            }
        }
        #infra3d-div {
            height: 100%;
        }
    }
</style>
