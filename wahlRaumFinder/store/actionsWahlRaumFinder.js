/**
 * Actions for WahlRaumFinder tool.
 * Actions handle asynchronous operations and complex mutations.
 */
export default {
    /**
     * Initialize the tool - called when the module is registered
     * If configured as active, activate it in the menu
     * @param {Object} context - Vuex action context
     * @returns {void}
     */
    initialize ({state, commit, dispatch, rootState}) {
        console.log("WahlRaumFinder: initialize action called, active:", state.active);

        // Map styleId array to individual style properties
        // Config format: styleId: ["address_style", "wahlraum_style", "distance_style"]
        if (Array.isArray(state.styleId) && state.styleId.length >= 3) {
            commit("setStyleId_circle_address", state.styleId[0]);
            commit("setStyleId_circle_wahlraum", state.styleId[1]);
            commit("setStyleId_distance", state.styleId[2]);
            console.log("WahlRaumFinder: Mapped styleId array:", state.styleId);
        }

        if (state.active) {
            const side = state.renderToWindow ? null : "secondaryMenu";

            if (side) {
                console.log("WahlRaumFinder: Auto-activating in", side);
                // Activate this tool in the menu
                dispatch("Menu/changeCurrentComponent", {
                    type: "wahlRaumFinder",
                    side: side,
                    props: {
                        name: state.name
                    }
                }, {root: true});

                // Ensure the secondary menu is expanded
                dispatch("Menu/toggleMenu", side, {root: true}).then(() => {
                    console.log("WahlRaumFinder: Menu toggled");
                });
            }
        }
    },
    /**
     * Process search result from SearchBar
     * This action is triggered by the search result onClick event
     * @param {Object} context - Vuex action context
     * @param {Object} searchResult - Search result object with coordinate and name
     * @returns {Promise<void>}
     */
    async processSearchResult ({dispatch, rootState, rootGetters}, searchResult) {
        console.log("WahlRaumFinder: processSearchResult action called with:", searchResult);

        // Trigger the component's search processing
        // We'll emit this via the root store so the component can listen
        await dispatch("Modules/WahlRaumFinder/handleSearchResult", searchResult, {root: true});
    },

    /**
     * Handle search result - to be called from component
     * @param {Object} context - Vuex action context
     * @param {Object} searchResult - Search result with coordinate and name
     * @returns {Promise<void>}
     */
    async handleSearchResult ({commit, dispatch}, searchResult) {
        console.log("WahlRaumFinder: handleSearchResult called:", searchResult);
        // This will be picked up by the component via a store.subscribe
        commit("setSearchTrigger", searchResult);
    }
};
