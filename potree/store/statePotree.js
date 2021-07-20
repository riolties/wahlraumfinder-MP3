/**
 * User type definition
 * @typedef {object} PotreeState
 * @property {boolean} active if true, Potree will rendered
 * @property {string} id id of the Potree component
 * @property {string} name displayed as title (config-param)
 * @property {string} glyphicon icon next to title (config-param)
 * @property {boolean} renderToWindow if true, tool is rendered in a window, else in sidebar (config-param)
 * @property {boolean} resizableWindow if true, window is resizable (config-param)
 * @property {boolean} isVisibleInMenu if true, tool is selectable in menu (config-param)
 * @property {boolean} deactivateGFI flag if tool should deactivate gfi (config-param)
 */
const state = {
    active: false,
    id: "Potree",
    // defaults for config.json parameters
    name: "Potree",
    glyphicon: "glyphicon-screenshot",
    renderToWindow: false,
    resizableWindow: true,
    isVisibleInMenu: true,
    deactivateGFI: true,
    // tool specific attributes
    useProxy: true,
    externalCssFiles: [],
    externalJsFiles: [],
    pointClouds: []
    // internal attributes
};

export default state;
