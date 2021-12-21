import AnimationTemplate from "text-loader!./template.html";
import AnimationModel from "./model.js";
import "./style.scss";

const AnimationView = Backbone.View.extend(/** @lends AnimationView.prototype */{
    events: {
        "change .select-drop-down": "selectDropDownAtIndex",
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
     * @fires Alerting#RadioTriggerAlertAlert
     * @contructs
     */
    initialize: function () {
        this.model = new AnimationModel();
        this.listenTo(this.model, {
            // ändert sich der Fensterstatus wird neu gezeichnet
            "change:isActive": this.render,
            // ändert sich eins dieser Attribute wird neu gezeichnet
            "render": this.render
        });
    },
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
     * Selects the dropdown at the given index.
     * @param {event} evt Change event of select.
     * @returns {void}
     */
    selectDropDownAtIndex: function (evt) {
        const value = evt.target.value,
            index = parseInt(evt.target.attributes.index.value, 10);

        this.model.selectDropDownAtIndex(index, value);
    },

    /**
     * Selects the topmost dropdown.
     * @param {event} evt Chang event of dropdown select.
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

    /**
     * Shows the help
     * @param {event} evt Klick event on the questionmark.
     * @fires Alerting#RadioTriggerAlertAlert
     * @returns {void}
     */
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
