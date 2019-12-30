import StrassenBefahrungTemplate from "text-loader!./template.html";
import StrassenBefahrungModel from "./model";
import "./style.less";

const StrassenBefahrungView = Backbone.View.extend(/** @lends StrassenBefahrungView.prototype */{
    events: {
        "click .close": "hide",
        // "click .btn-nav": "toggleNavigation",
        "click .btn-marker": "toggleMarker"
    },

    /**
     * @class StrassenBefahrungView
     * @extends Backbone.View
     * @memberof AddOns.StrassenBefahrung
     * @listens AddOns.StrassenBefahrung#changeIsActive
     * @listens AddOns.StrassenBefahrung#InitInfra3d
     * @fires Sidebar#RadioTriggerSidebarAppend
     * @fires Sidebar#RadioTriggerSidebarToggle
     * @contructs
     */
    initialize: function () {
        this.listenTo(this.model, {
            "change:isActive": this.render,
            "initInfra3d": this.initInfra3d
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
     * @fires MapMarker#RadioTriggerMapMarkerHideMarker
     * @returns {StrassenBefahrungView} - itself
     */
    render: function (model, isActive) {
        if (isActive) {
            const attr = model.toJSON();

            this.$el.html(this.template(attr));
            Radio.trigger("Sidebar", "append", this.el);
            Radio.trigger("Sidebar", "toggle", true, "50%");
            this.addPostMessageListenser();
        }
        else {
            Radio.trigger("Sidebar", "toggle", false);
        }
        this.delegateEvents();
        return this;
    },

    /**
     * Deactivates the Tool
     * @fires MapMarker#RadioTriggerMapMarkerHideMarker
     * @returns {void}
     */
    hide: function () {
        this.model.setIsActive(false);
        Radio.trigger("MapMarker", "hideMarker");
    },

    /**
     * Initializes the infra3d via the api.
     * @param {Number[]} coord Coordinate Array.
     * @returns {void}
     */
    initInfra3d: function (coord) {
        const infra3d = window.infra3d,
            divId = "infra3d-div",
            url = "https://client-v3.infra3d.ch",
            epsgCodeString = Radio.request("MapView", "getProjection").getCode(),
            epsgCodeNumber = parseInt(epsgCodeString.split(":")[1], 10),
            options = {
                loginurl: "https://auth.infra3d.ch/api/v1/login",
                credentials: ["WOmuenchen", "6tHqJ2"],
                // easting: 11.571,
                // northing: 48.132,
                // epsg: 4326,
                easting: coord[0],
                northing: coord[1],
                epsg: epsgCodeNumber,
                lang: "de",
                map: false,
                layer: false,
                navigation: false,
                // origin: "https://localhost:9001"
                origin: window.origin
            };

        if (infra3d) {
            infra3d.init(divId, url, options, function () {
                console.error("Infra3D initialized");
                this.setOnPositionChanged();
            }, this);
        }
        else {
            console.error("Infra3D is not loaded!");
        }
        this.deactivateButton(".btn-marker");
    },
    setOnPositionChanged: function () {
        console.error("setOnPositionChanged");

        window.infra3d.setOnPositionChanged(function () {
            console.error("position changed!!!");
        }, null);
    },
    /**
     * Window listener for post message events
     * @returns {void}
     */
    addPostMessageListenser: function () {
        window.addEventListener("message", function (evt) {
            console.error(evt);
        });
    },
    // toggleNavigation: function () {
    //     const btnNav = this.$el.find(".btn-nav"),
    //         hasClass = btnNav.hasClass("btn-primary");

    //     if (hasClass) {
    //         this.deactivateButton(".btn-nav");
    //         window.infra3d.setNavigationVisibility(false);
    //         // window.infra3d.iframe.contentWindow.postMessage("setNavigationVisibility(false)", window.infra3d.origin);
    //     }
    //     else {
    //         this.activateButton(".btn-nav");
    //         window.infra3d.setNavigationVisibility(true);
    //         // window.infra3d.iframe.contentWindow.postMessage("setNavigationVisibility(true)", window.infra3d.origin);
    //     }
    // },

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
