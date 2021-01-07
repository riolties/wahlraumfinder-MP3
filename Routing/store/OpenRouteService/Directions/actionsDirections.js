const actions = {
    setCoordinatePart: function ({commit}, val) {
        const id = val.id,
            value = parseFloat(val.value);

        if (id === "from_x") {
            commit("setFromX", value);
        }
        if (id === "from_y") {
            commit("setFromY", value);
        }
        if (id === "to_x") {
            commit("setToX", value);
        }
        if (id === "to_y") {
            commit("setToY", value);
        }
    }
};

export default actions;
