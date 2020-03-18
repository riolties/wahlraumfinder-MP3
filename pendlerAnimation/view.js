import PendlerAnimationTemplate from "text-loader!./template.html";
import PendlerAnimationModel from "./model.js";
import "./style.less";

const PendlerAnimationView = Backbone.View.extend({
    events: {
        "change #select-class": "selectClass",
        "change .select-level": "selectLevel",
        "change .select-top-most": "selectTopMost"
    },

    initialize: function () {
        this.listenTo(this.model, {
            // ändert sich der Fensterstatus wird neu gezeichnet
            "change:isActive": this.render,
            // ändert sich eins dieser Attribute wird neu gezeichnet
            "render": this.render
        });
    },
    model: new PendlerAnimationModel(),
    id: "pendler-animation",
    template: _.template(PendlerAnimationTemplate),
    render: function (model, value) {
        if (value) {
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(this.template(model.toJSON()));
            this.delegateEvents();
        }
        else {
            this.undelegateEvents();
        }
        return this;
    },
    selectClass: function (evt) {
        const value = evt.target.value;

        this.model.selectClass(value);
    },
    selectLevel: function (evt) {
        const value = evt.target.value,
            level = parseInt(evt.target.attributes.level.value, 10);

        this.model.selectLevel(level, value);
    },
    selectTopMost: function (evt) {
        const value = parseInt(evt.target.value, 10);

        this.model.selectTopMost(value);
    }
});

export default PendlerAnimationView;
