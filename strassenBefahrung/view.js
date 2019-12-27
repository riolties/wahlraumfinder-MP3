import StrassenBefahrungTemplate from "text-loader!./template.html";
import StrassenBefahrungModel from "./model";
import "./style.less";

const StrassenBefahrungView = Backbone.View.extend({
    events: {
        "click .close": "hide",
        "click .btn-nav": "toggleNavigation",
        "click .btn-listen": "startPositionChangedListener"
    },
    initialize: function () {
        this.listenTo(this.model, {
            "change:isActive": this.render
        });

        if (this.model.get("isActive") === true) {
            this.render(this.model, this.model.get("isActive"));
        }
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
            this.initInfra3d();
        }
        else {
            Radio.trigger("Sidebar", "toggle", false);
        }
        this.delegateEvents();
        return this;
    },
    hide: function () {
        this.model.setIsActive(false);
    },

    initInfra3d: function () {
        const infra3d = window.infra3d,
            divId = "infra3d-div",
            url = "https://client-v3.infra3d.ch",
            options = {
                loginurl: "https://auth.infra3d.ch/api/v1/login",
                credentials: ["WOmuenchen", "6tHqJ2"],
                easting: 11.571,
                northing: 48.132,
                epsg: 4326,
                lang: "de",
                map: false,
                layer: false,
                navigation: false,
                // origin: "https://geoportal.muenchen.de"
                origin: "https://localhost:9001"
            };

        if (infra3d) {
            infra3d.init(divId, url, options, function () {
                console.error("Infra3D initialized");
            }, null);
        }
        else {
            console.error("Infra3D is not loaded!");
        }
    },
    startPositionChangedListener: function () {
        const infra3d = window.infra3d;

        infra3d.setOnPositionChanged(function (easting) {
            console.error(easting);
        }, null);
    },
    toggleNavigation: function () {
        const btnNav = this.$el.find(".btn-nav"),
            hasClass = btnNav.hasClass("btn-primary");

        if (hasClass) {
            window.infra3d.setNavigationVisibility(false);
            // window.infra3d.iframe.contentWindow.postMessage("setNavigationVisibility(false)", window.infra3d.origin);
            btnNav.removeClass("btn-primary");
            btnNav.addClass("btn-default");
        }
        else {
            window.infra3d.setNavigationVisibility(true);
            // window.infra3d.iframe.contentWindow.postMessage("setNavigationVisibility(true)", window.infra3d.origin);
            btnNav.removeClass("btn-default");
            btnNav.addClass("btn-primary");
        }
    }
});

export default StrassenBefahrungView;
