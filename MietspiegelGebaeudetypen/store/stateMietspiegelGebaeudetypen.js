/**
 * User type definition
 * @typedef {object} MietspiegelWohnlageState
 */
const state = {
    active: false,
    id: "mietspiegel_gebaeudetypen",
    // defaults for config.json parameters
    name: "Mietspiegel Gebäudetypen",
    glyphicon: "glyphicon-screenshot",
    renderToWindow: true,
    resizableWindow: true,
    isVisibleInMenu: true,
    deactivateGFI: true,
    values: [],
    postMessageUrls: [],
    address: ""
};

export default state;
