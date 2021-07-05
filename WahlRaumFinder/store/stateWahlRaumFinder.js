/**
 * User type definition
 * @typedef {object} WahlRaumFinderState
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
    id: "WahlRaumFinder",
    // defaults for config.json parameters
    name: "WahlRaumFinder",
    glyphicon: "glyphicon-screenshot",
    renderToWindow: false,
    resizableWindow: true,
    isVisibleInMenu: true,
    deactivateGFI: true,
    addressLayerId: "",
    addressLayerPollingStationAttribute: "",
    pollingStationLayerId: "",
    mailTo: "",
    featureAttributes: {},
    styleId_circle_wahlraum: "",
    styleId_circle_address: "",
    styleId_distance: "",
    // internal attributes
    addressString: "",
    featureValues: {},
    distanceString: ""
};

export default state;
