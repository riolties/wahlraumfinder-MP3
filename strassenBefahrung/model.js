import Tool from "../../modules/core/modelList/tool/model";

const StrassenBefahrungModel = Tool.extend({
    defaults: Object.assign({}, Tool.prototype.defaults, {
        id: "strassenBefahrung",
        name: "StraßenBefahrung",
        glyphicon: "glyphicon-pencil",
        renderToWindow: false
    }),
    initialize: function () {
        this.superInitialize();
        console.log("strassenBefahrungModel");
        this.listenTo(this, {
            "change:isActive": function () {
                console.log("changeIsActive");
            }
        });
    }
});

export default StrassenBefahrungModel;
