import {expect} from "chai";
import ModelList from "@modules/core/modelList/list.js";
import Tool from "@modules/core/modelList/tool/model.js";
import initializeStrassenBefahrungModel from "@addons/strassenBefahrung/model.js";

let tool,
    model;

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
    describe("setCoords", function () {
        it("BARFOO", function () {
            model.setCoords([1, 2]);

            expect(model.get("coords")).to.deep.equal([1, 2]);
        });
    });
});
