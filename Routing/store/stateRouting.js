import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import {Style} from "ol/style.js";

/**
 * User type definition
 * @typedef {object} RoutingState
 */
const state = {
    active: false,
    id: "routing",
    // defaults for config.json parameters
    name: "Routing",
    glyphicon: "glyphicon-screenshot",
    renderToWindow: true,
    resizableWindow: true,
    isVisibleInMenu: true,
    deactivateGFI: true,

    routingType: "OpenRouteService",
    routingMode: "Directions",
    url: "",
    useProxy: false,
    profile: "",
    styleId: [],
    styleIdForRoute: "",
    routingLayer: new VectorLayer({
        name: "routingLayer",
        source: new VectorSource(),
        visible: true,
        style: new Style()
    }),
    vehicles: [],
    jobs: []
};

export default state;
