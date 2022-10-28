/**
 * User type definition
 * @typedef {object} MietspiegelWohnlageState
 */
const state = {
    active: false,
    id: "mietspiegel_wohnlage",
    // defaults for config.json parameters
    name: "Mietspiegel Wohnlage",
    icon: "bi-building",
    renderToWindow: true,
    resizableWindow: true,
    isVisibleInMenu: true,
    deactivateGFI: true,
    values: [],
    postMessageUrls: [],
    address: ""
};

export default state;
