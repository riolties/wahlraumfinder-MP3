import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import {Style} from "ol/style.js";

/**
 * User type definition
 * @typedef {object} RoutingState
 */
const state = {
    creatingVehicle: false,
    vehicles: [],
    creatingJob: false,
    jobs: []
};

export default state;
