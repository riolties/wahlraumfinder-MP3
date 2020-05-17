import PerformanceTesterTemplate from "text-loader!./template.html";
import PerformanceTesterModel from "./model";
import "./style.less";

const PerformanceTesterView = Backbone.View.extend(/** @lends PerformanceTesterView.prototype */{
    events: {
        "change #input-num-features": "setNumFeatures",
        "change #input-height": "setHeight",
        "change #input-interval": "setInterval",
        "click .create-features": "createFeatures",
        "click .delete-features": "deleteFeatures",
        "click .btn-movement-yes": "activateMovement",
        "click .btn-movement-no": "deactivateMovement"
    },
    /**
     * @class PerformanceTesterView
     * @extends Backbone.View
     * @memberof Addons.PerformanceTester
     * @listens Addons.PerformanceTester#changeIsActive
     * @contructs
     */
    initialize: function () {
        this.listenTo(this.model, {
            "change:isActive": this.render
        });

        if (this.model.get("isActive") === true) {
            this.render(this.model, this.model.get("isActive"));
        }
    },
    model: new PerformanceTesterModel(),
    /**
     * @member PerformanceTesterTemplate
     * @description Template used to create the View for PerformanceTester
     * @memberof Addons.PerformanceTester
     */
    template: _.template(PerformanceTesterTemplate),
    /**
     * Render function
     * @param {*} model The model
     * @param {Boolean} isActive Flag if model is active
     * @returns {*} - itself
     */
    render: function (model, isActive) {
        if (isActive) {
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
     * Sets the number of features to be generated.
     * @param {event} evt Event.
     * @returns {void}
     */
    setNumFeatures: function (evt) {
        const numFeatures = parseInt(evt.target.value, 10);

        this.model.setNumFeatures(numFeatures);
    },

    /**
     * Sets the height of features.
     * @param {event} evt Event.
     * @returns {void}
     */
    setHeight: function (evt) {
        const height = parseInt(evt.target.value, 10);

        this.model.setHeight(height);
    },

    /**
     * Sets the interval.
     * @param {event} evt Event.
     * @returns {void}
     */
    setInterval: function (evt) {
        const interval = parseInt(evt.target.value, 10);

        this.model.setInterval(interval);
    },

    /**
     * Starts the creation of features.
     * @returns {void}
     */
    createFeatures: function () {
        this.model.createFeatures();
    },

    /**
     * Starts the deletion of features.
     * @returns {void}
     */
    deleteFeatures: function () {
        this.model.deleteFeatures();
    },

    /**
     * Activates the movement.
     * @returns {void}
     */
    activateMovement: function () {
        this.activateButton(".btn-movement-yes");
        this.deactivateButton(".btn-movement-no");
        this.model.setMovement(true);
        this.$el.find(".interval").removeClass("hide");
    },

    /**
     * Deactivates the movement.
     * @returns {void}
     */
    deactivateMovement: function () {
        this.deactivateButton(".btn-movement-yes");
        this.activateButton(".btn-movement-no");
        this.model.setMovement(false);
        this.$el.find(".interval").addClass("hide");
    },

    /**
     * Activates the button.
     * @param {String} selector Selector.
     * @returns {void}
     */
    activateButton: function (selector) {
        this.$el.find(selector).removeClass("btn-default");
        this.$el.find(selector).addClass("btn-primary");
    },

    /**
     * Deactivates the button.
     * @param {String} selector Selector.
     * @returns {void}
     */
    deactivateButton: function (selector) {
        this.$el.find(selector).removeClass("btn-primary");
        this.$el.find(selector).addClass("btn-default");
    }
});

export default PerformanceTesterView;
