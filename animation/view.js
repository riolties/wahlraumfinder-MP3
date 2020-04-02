import AnimationTemplate from "text-loader!./template.html";
import AnimationModel from "./model.js";
import "./style.less";

const AnimationView = Backbone.View.extend(/** @lends AnimationView.prototype */{
    events: {
        "change #select-class": "selectClass",
        "change .select-level": "selectLevel",
        "change .select-top-most": "selectTopMost",
        "click .start": "start",
        "click .reset": "reset",
        "click .stop": "stop",
        "click .glyphicon-question-sign": "showHelp"
    },
    /**
     * @class AnimationView
     * @extends Backbone.View
     * @memberof Addons.Animation
     * @listens Addons.Animation#changeIsActive
     * @listens Addons.Animation#render
     * @contructs
     */
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

    /**
     * Selects a class.
     * @param {event} evt Event.
     * @returns {void}
     */
    selectClass: function (evt) {
        const value = evt.target.value;

        this.model.selectClass(value);
    },

    /**
     * Selects a level.
     * @param {event} evt Event.
     * @returns {void}
     */
    selectLevel: function (evt) {
        const value = evt.target.value,
            level = parseInt(evt.target.attributes.level.value, 10);

        this.model.selectLevel(level, value);
    },

    /**
     * Selects the top most.
     * @param {event} evt Event.
     * @returns {void}
     */
    selectTopMost: function (evt) {
        const value = parseInt(evt.target.value, 10);

        this.model.selectTopMost(value);
    },

    /**
     * Starts the animation
     * @returns {void}
     */
    start: function () {
        this.model.startAnimation();
    },

    /**
     * Resets the animation
     * @returns {void}
     */
    reset: function () {
        this.model.stopAnimation();
    },

    /**
     * Stops the animation
     * @returns {void}
     */
    stop: function () {
        this.model.pauseAnimation();
    },

    showHelp: function (evt) {
        const target = evt.currentTarget,
            helpText = target.getAttribute("title"),
            alertObj = {
                text: helpText,
                fadeOut: 2000
            };

        Radio.trigger("Alert", "alert", alertObj);
    }
});

export default AnimationView;
