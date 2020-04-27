import AnimationTemplate from "text-loader!./template.html";
import AnimationModel from "./model.js";
import "./style.less";

const AnimationView = Backbone.View.extend(/** @lends AnimationView.prototype */{
    events: {
        "change .select-drop-down": "selectDropDownAtIndex",
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
    model: new AnimationModel(),
    id: "animationAddOn",
    /**
     * @member AnimationTemplate
     * @description Template used to create the View for Animation
     * @memberof Addons.Animation
     */
    template: _.template(AnimationTemplate),

    /**
     * Render function.
     * @param {Object} model Model.
     * @param {Boolean} value Flag if model "isActive".
     * @returns {Object} - itself.
     */
    render: function (model) {
        if (model.get("isActive")) {
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(this.template(model.toJSON()));
            this.delegateEvents();
        }
        else {
            this.undelegateEvents();
        }
        return this;
    },
    selectDropDownAtIndex: function (evt) {
        const value = evt.target.value,
            index = parseInt(evt.target.attributes.index.value, 10);

        this.model.selectDropDownAtIndex(index, value);
    },
    selectTopMost: function (evt) {
        const value = parseInt(evt.target.value, 10);

        this.model.selectTopMost(value);
    }
});

export default AnimationView;
