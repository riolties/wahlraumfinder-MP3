import {expect} from "chai";
import ModelList from "@modules/core/modelList/list.js";
import Tool from "@modules/core/modelList/tool/model.js";
import initializeStrassenBefahrungModel from "@addons/strassenBefahrung/model.js";

let tool, model;

before(function () {
    tool = new Tool({
        name: "Straßen-Befahrung",
        glyphicon: "glyphicon-road",
        styleId: "strassenBefahrung_woman",
        type: "tool",
        parentId: "tools",
        id: "strassenBefahrung"
    });
    new ModelList([tool]);
    model = initializeStrassenBefahrungModel();
});

describe("addons/strassenBefahrung", function () {
    describe("defaultTest", function () {
        it("initial setup test", function () {
            console.error(model.get("name"));
            expect(true).to.be.true;
        });
    });

    describe("getEpsgFromMap", function () {
        it("should return a number", function () {
            expect(model.getEpsgFromMap()).to.be.an("number");
        });
    });

    describe("createEnnLayer", function () {
        it("ennLayer should be created", function () {
            model.createEnnLayer();
            expect(model.get("ennLayer")).not.to.be.undefined;
        });
    });

    describe("createMarkerLayer", function () {
        it("markerLay should be created", function () {
            model.createMarkerLayer();
            expect(model.get("markerLayer")).to.be.undefined;
        });
    });

    describe("styleFeature", function () {
        it("", function () {});
    });

    describe("placeMarkerInMap", function () {
        it("", function () {
            model.placeMarkerInMap();
            expect(model.get("interaction")).should.be.an("object");
        });
    });

    describe("stopMarkerInMap", function () {
        it("", function () {});
    });

    describe("showMarker", function () {
        it("", function () {});
    });

    describe("hideMarker", function () {
        it("", function () {});
    });

    describe("clearEnnLayer", function () {
        it("", function () {});
    });

    describe("setMarker", function () {
        it("", function () {});
    });

    describe("initInfra3d", function () {
        it("", function () {});
    });

    describe("infra3dInitialized", function () {
        it("", function () {});
    });

    describe("getEnn", function () {
        it("", function () {});
    });

    describe("createEdgeNodeNetworkLayer", function () {
        it("", function () {});
    });

    describe("setOnPositionChanged", function () {
        it("", function () {});
    });

    describe("removeInteraction", function () {
        it("", function () {});
    });
});
