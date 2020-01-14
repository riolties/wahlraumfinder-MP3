import {expect} from "chai";
import ModelList from "@modules/core/modelList/list.js";
import Model from "@addons/strassenBefahrung/model.js";

let modelList,
    model;

before(function () {
    modelList = new ModelList([{
        name: "Straßen-Befahrung",
        glyphicon: "glyphicon-road",
        styleId: "strassenBefahrung_woman",
        type: "tool",
        parentId: "tools",
        id: "strassenBefahrung"
    }]);
    model = new Model();
});

describe("addons/strassenBefahrung", function () {
    describe("foobar", function () {
        it("BARFOO", function () {
            expect(true).to.be.true;
        });
    });
});
