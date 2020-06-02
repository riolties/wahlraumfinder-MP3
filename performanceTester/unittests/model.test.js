import {expect} from "chai";
import Model from "@addons/performanceTester/model.js";

let model;

before(function () {
    model = new Model();
});

describe("addons/performanceTester", function () {
    describe("defaultTest", function () {
        it("initial setup test", function () {
            console.error(model.get("name"));
            expect(true).to.be.true;
        });
    });
});
