import StrassenBefahrungTemplate from "text-loader!./template.html";
import StrassenBefahrungModel from "./model";
import "./style.less";

const StrassenBefahrungView = Backbone.View.extend({
    events: {
        "click .close": "hide"
    },
    initialize: function () {
        this.listenTo(this.model, {
            "change:isActive": this.render
        });
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
                // "loginurl": "",
                // "credentials": ["username", "password"],
                "easting": 8.3078,
                "northing": 47.0471,
                "epsg": 4326,
                "lang": "de",
                "map": false,
                "layer": false,
                "navigation": false
            };

        console.log(infra3d);
        console.log(url);
        
        
        if (infra3d) {
            infra3d.init(divId, url, options);
        }
    }
});

export default StrassenBefahrungView;
