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
    routingLayer: new VectorLayer({
        name: "routingLayer",
        source: new VectorSource(),
        visible: true,
        style: new Style()
    }),
    activeTab: 1,
    openRouteService: {
        from: {
            x: -1,
            y: -1,
            name: ""
        },
        to: {
            x: -1,
            y: -1,
            name: ""
        },
        creatingVehicle: false,
        vehicles: [],
        creatingJob: false,
        jobs: []
    }
};

export default state;
