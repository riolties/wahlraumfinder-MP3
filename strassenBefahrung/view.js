import StrassenBefahrungTemplate from "text-loader!./template.html";
import StrassenBefahrungModel from "./model";

const StrassenBefahrungView = Backbone.View.extend({
    initialize: function () {
        this.listenTo(this.model, {
            "change:isActive": this.render
        });
    },
    model: new StrassenBefahrungModel(),
    className: "strassen-befahrung",
    template: _.template(StrassenBefahrungTemplate),
    render: function (model, isActive) {
        if (isActive) {
            const attr = model.toJSON();

            this.$el.html(this.template(attr));
            Radio.trigger("Sidebar", "append", this.el);
            Radio.trigger("Sidebar", "toggle", true, "50%");
        }
        else {
            this.hide();
            Radio.trigger("Sidebar", "toggle", false);
        }
        return this;
    }
});

export default StrassenBefahrungView;
