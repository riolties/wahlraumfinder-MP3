import AnimationTemplate from "text-loader!./template.html";
import AnimationModel from "./model.js";
import "./style.less";

const AnimationView = Backbone.View.extend({
    events: {
        "change #select-class": "selectClass",
        "change .select-level": "selectLevel",
        "change .select-top-most": "selectTopMost",
        "click .start": "start",
        "click .reset": "reset",
        "click .stop": "stop"
    },

    initialize: function () {
        this.listenTo(this.model, {
            // ändert sich der Fensterstatus wird neu gezeichnet
            "change:isActive": this.render,
            // ändert sich eins dieser Attribute wird neu gezeichnet
            "render": this.render
        });
    },
    model: new AnimationModel(),
    id: "animationAddOn",
    template: _.template(AnimationTemplate),
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
    },
    start: function () {
        this.model.startAnimation();
    },
    reset: function () {
        this.model.stopAnimation();
    },
    stop: function () {
        this.model.pauseAnimation();
    }
});

export default AnimationView;
