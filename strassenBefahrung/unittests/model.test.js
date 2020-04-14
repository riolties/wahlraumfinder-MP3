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
    describe("defaultTest", function () {
        it("initial setup test", function () {
            console.error(model.get("name"));
            expect(true).to.be.true;
        });
    });
});
