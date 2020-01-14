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
    initialize: function () {
        this.listenTo(this.model, {
            "change:isActive": this.render
        });

        if (this.model.get("isActive") === true) {
            this.render(this.model, this.model.get("isActive"));
        }
    },
    model: new PerformanceTesterModel(),
    template: _.template(PerformanceTesterTemplate),

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
    setNumFeatures: function (evt) {
        const numFeatures = parseInt(evt.target.value, 10);

        this.model.setNumFeatures(numFeatures);
    },
    setHeight: function (evt) {
        const height = parseInt(evt.target.value, 10);

        this.model.setHeight(height);
    },

    setInterval: function (evt) {
        const interval = parseInt(evt.target.value, 10);

        this.model.setInterval(interval);
    },
    createFeatures: function () {
        this.model.createFeatures();
    },
    deleteFeatures: function () {
        this.model.deleteFeatures();
    },
    activateMovement: function () {
        this.activateButton(".btn-movement-yes");
        this.deactivateButton(".btn-movement-no");
        this.model.setMovement(true);
        this.$el.find(".interval").removeClass("hide");
    },
    deactivateMovement: function () {
        this.deactivateButton(".btn-movement-yes");
        this.activateButton(".btn-movement-no");
        this.model.setMovement(false);
        this.$el.find(".interval").addClass("hide");
    },
    activateButton: function (selector) {
        this.$el.find(selector).removeClass("btn-default");
        this.$el.find(selector).addClass("btn-primary");
    },
    deactivateButton: function (selector) {
        this.$el.find(selector).removeClass("btn-primary");
        this.$el.find(selector).addClass("btn-default");
    }
});

export default PerformanceTesterView;
