import StrassenBefahrungTemplate from "text-loader!./template.html";
import StrassenBefahrungModel from "./model";
import "./style.less";
import "./infra3dapi";

const StrassenBefahrungView = Backbone.View.extend(/** @lends StrassenBefahrungView.prototype */{
    events: {
        "click .close": "hide",
        "click .btn-nav": "toggleNavigation",
        "click .btn-marker": "toggleMarker"
    },

    /**
     * @class StrassenBefahrungView
     * @extends Backbone.View
     * @memberof AddOns.StrassenBefahrung
     * @listens AddOns.StrassenBefahrung#changeIsActive
     * @listens AddOns.StrassenBefahrung#deactivateButton
     * @fires Sidebar#RadioTriggerSidebarAppend
     * @fires Sidebar#RadioTriggerSidebarToggle
     * @contructs
     */
    initialize: function () {
        this.listenTo(this.model, {
            "change:isActive": this.render,
            "deactivateButton": this.deactivateButton
        });

        if (this.model.get("isActive") === true) {
            this.render(this.model, this.model.get("isActive"));
        }
    },
    model: new StrassenBefahrungModel(),
    className: "strassen-befahrung",
    /**
     * @member StrassenBefahrungTemplate
     * @description Template used to create the View for StrassenBefahrung
     * @memberof AddOns.StrassenBefahrung
     */
    template: _.template(StrassenBefahrungTemplate),

    /**
     * Render function. Opens the sidebar and renders itself in it.
     * @param {StrassenBefahrungModel} model The views model.
     * @param {Boolean} isActive Flag if model is active.
     * @fires Sidebar#RadioTriggerSidebarAppend
     * @fires Sidebar#RadioTriggerSidebarToggle
     * @returns {StrassenBefahrungView} - itself
     */
    render: function (model, isActive) {
        if (isActive) {
            const attr = model.toJSON();

            this.$el.html(this.template(attr));
            Radio.trigger("Sidebar", "append", this.el);
            Radio.trigger("Sidebar", "toggle", true, "50%");
            this.model.initInfra3d();
        }
        else {
            Radio.trigger("Sidebar", "toggle", false);
        }
        this.delegateEvents();
        return this;
    },

    /**
     * Resets the model
     * @returns {void}
     */
    hide: function () {
        this.model.reset();
    },

    /**
     * Toggles the navigation button. and its visibility via the infra3dAPI.
     * @returns {void}
     */
    toggleNavigation: function () {
        const btnNav = this.$el.find(".btn-nav"),
            hasClass = btnNav.hasClass("btn-primary");

        if (hasClass) {
            this.deactivateButton(".btn-nav");
            window.infra3d.setNavigationVisibility(false);
        }
        else {
            this.activateButton(".btn-nav");
            window.infra3d.setNavigationVisibility(true);
        }
    },

    /**
     * Toggles the ability to set a marker on the map.
     * @returns {void}
     */
    toggleMarker: function () {
        const btnNav = this.$el.find(".btn-marker"),
            hasClass = btnNav.hasClass("btn-primary");

        if (hasClass) {
            this.deactivateButton(".btn-marker");
            this.model.stopMarkerInMap();
        }
        else {
            this.activateButton(".btn-marker");
            this.model.placeMarkerInMap();
        }
    },

    /**
     * Activates a button in its content based on the class name.
     * @param {String} className Classname of button.
     * @returns {void}
     */
    activateButton: function (className) {
        const btn = this.$el.find(className);

        btn.removeClass("btn-default");
        btn.addClass("btn-primary");
    },

    /**
     * Deactivates a button in its content based on the class name.
     * @param {String} className Classname of button.
     * @returns {void}
     */
    deactivateButton: function (className) {
        const btn = this.$el.find(className);

        btn.removeClass("btn-primary");
        btn.addClass("btn-default");
    }
});

export default StrassenBefahrungView;
