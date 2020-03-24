import {expect} from "chai";
import ModelList from "@modules/core/modelList/list.js";
import Tool from "@modules/core/modelList/tool/model.js";
import initializePerformanceTesterModel from "@addons/performanceTester/model.js";

let tool,
    model;

before(function () {
    tool = new Tool({
        id: "performanceTester",
        name: "performanceTester",
        glyphicon: "glyphicon-dashboard",
        numFeatures: 1000,
        extent: [670000, 5320000, 710000, 5350000],
        height: 600,
        interval: 2000,
        movement: false
    });
    new ModelList([tool]);
    model = initializePerformanceTesterModel();
});

describe("addons/performanceTester", function () {
    describe("defaultTest", function () {
        it("initial setup test", function () {
            expect(true).to.be.true;
        });
    });
});
