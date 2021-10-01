/**
 * User type definition
 * @typedef {object} StrassenBefahrungState
 * @property {boolean} active if true, WahlRaumFinder will rendered
 * @property {string} id id of the WahlRaumFinder component
 * @property {string} name displayed as title (config-param)
 * @property {string} glyphicon icon next to title (config-param)
 * @property {boolean} renderToWindow if true, tool is rendered in a window, else in sidebar (config-param)
 * @property {boolean} resizableWindow if true, window is resizable (config-param)
 * @property {boolean} isVisibleInMenu if true, tool is selectable in menu (config-param)
 * @property {boolean} deactivateGFI flag if tool should deactivate gfi (config-param)
 */
const state = {
    active: false,
    id: "StrassenBefahrung",
    // defaults for config.json parameters
    name: "StraßenBefahrung",
    glyphicon: "glyphicon-screenshot",
    renderToWindow: false,
    resizableWindow: true,
    isVisibleInMenu: true,
    deactivateGFI: true,
    // tool specific attributes
    styleId: [],
    markerStyleId: "",
    ennStyleId: "",
    coords: [691604, 5334760],
    epsgNumber: "25832",
    user: "",
    password: "",
    loadEdgeNodeNetwork: true,
    // internal attributes
    ennLayer: {},
    markerLayer: {},
    startInitInfra3d: false
};

export default state;
