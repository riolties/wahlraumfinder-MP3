import WahllokalFinderTemplate from "text-loader!./template.html";
import WahllokalFinderModel from "./model";
import "./style.less";

const WahllokalFinderView = Backbone.View.extend(/** @lends WahllokalFinderView.prototype */{
    events: {
        "click .close": "hide",
        "click .mobile-min-max-btn": "toggle",
        "click .mobile-btn-map": "hide"
    },
    /**
     * @class WahllokalFinderView
     * @extends Backbone.View
     * @memberof AddOns.WahllokalFinder
     * @fires Sidebar#RadioTriggerSidebarAppend
     * @fires Sidebar#RadioTriggerSidebarToggle
     * @fires Searchbar#RadioTriggerSearchbarDeleteSearchString
     * @fires Core#RadioTriggerMapViewResetView
     * @listens AddOns.WahllokalFinder#show
     * @listens AddOns.WahllokalFinder#hide
     * @constructs
     */
    initialize: function () {
        this.listenTo(this.model, {
            "show": this.show,
            "hide": this.hide
        });
    },
    model: new WahllokalFinderModel(),
    className: "wahllokalfinder-muc",
    /**
     * @member WahllokalfinderTemplate
     * @description Template used to create the wahllokalfinder
     * @memberof AddOns.WahllokalFinder
     */
    template: _.template(WahllokalFinderTemplate),

    /**
     * Shows the view.
     * @fires Sidebar#RadioTriggerSidebarAppend
     * @fires Sidebar#RadioTriggerSidebarToggle
     * @returns {void}
     */
    show: function () {
        const attr = this.model.toJSON();

        this.$el.html(this.template(attr));
        Radio.trigger("Sidebar", "append", this.el);
        Radio.trigger("Sidebar", "toggle", true);
        this.delegateEvents();
    },
    /**
     * Hides the view.
     * @fires Sidebar#RadioTriggerSidebarToggle
     * @fires Searchbar#RadioTriggerSearchbarDeleteSearchString
     * @fires Core#RadioTriggerMapViewResetView
     * @returns {void}
     */
    hide: function () {
        this.resetSidebar();
    },

    /**
     * Toggles the content in mobile mode
     * @returns {void}
     */
    toggle: function () {
        const sidebarMobile = $(".sidebar-mobile"),
            maximize = sidebarMobile.hasClass("sidebar-mobile-minimized");

        if (this.model.get("isMobile")) {
            this.$el.find(".content").toggle();
            this.toggleSidebar(maximize);
        }
    },

    /**
     * Minimizes the sidebar by switches css classes.
     * @param {Boolean} maximize Flag if sidebar should be maximized.
     * @returns {void}
     */
    toggleSidebar: function (maximize) {
        const sidebarMobile = $(".sidebar-mobile");

        if (maximize) {
            sidebarMobile.removeClass("sidebar-mobile-minimized");
        }
        else {
            sidebarMobile.addClass("sidebar-mobile-minimized");
        }
        this.toggleGlyphicon(maximize);
    },

    /**
     * Toggles the glyphicon icons and titles if sidebar gets minimized or maximized in mobile mode.
     * @param {Boolean} maximize Flag if sidebar should be maximized.
     * @returns {void}
     */
    toggleGlyphicon: function (maximize) {
        const glyphicon = this.$el.find(".mobile-min-max-btn"),
            header = this.$el.find(".header");

        if (maximize) {
            glyphicon.removeClass("glyphicon-menu-up");
            glyphicon.addClass("glyphicon-menu-down");
            glyphicon.attr("title", "Minimieren");
            header.attr("title", "Minimieren");
        }
        else {
            glyphicon.addClass("glyphicon-menu-up");
            glyphicon.removeClass("glyphicon-menu-down");
            glyphicon.attr("title", "Maximieren");
            header.attr("title", "Maximieren");
        }
    },

    /**
     * Resets the sidebar by zwitches css classes.
     * @returns {void}
     */
    resetSidebar: function () {
        Radio.trigger("Sidebar", "toggle", false);
        this.toggleSidebar(true);
    }
});

export default WahllokalFinderView;
