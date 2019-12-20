import Tool from "../../modules/core/modelList/tool/model";

const StrassenBefahrungModel = Tool.extend({
    defaults: Object.assign({}, Tool.prototype.defaults, {
        id: "strassenBefahrung",
        name: "Straßen-Befahrung",
        glyphicon: "glyphicon-pencil",
        renderToWindow: false
    }),
    initialize: function () {
        this.superInitialize();
    }
});

export default StrassenBefahrungModel;
