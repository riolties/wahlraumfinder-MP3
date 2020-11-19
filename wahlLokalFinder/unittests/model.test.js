import ModelList from "@modules/core/modelList/list.js";
import Model from "@addons/wahlLokalFinder/model.js";
import {expect} from "chai";

describe("AddOn/wahlLokalFinder/model", function () {
    var modelList,
        model;

    before(function () {
        modelList = new ModelList([{
            id: "wahllokalFinder",
            name: "Wahllokalfinder",
            glyphicon: "glyphicon-list",
            isVisibleInMenu: false,
            addressLayerId: "2",
            addressLayerPollingStationAttribute: "kommunalwahl",
            pollingStationLayerId: "3",
            featureAttribute: {
                wahllokal_name: "Name",
                stranam: "Straße",
                nr: "Hausnummer",
                wbz: "Stimmbezirk",
                stbz: "Stadtbezirk",
                barrierefrei: "Barrierefrei"
            },
            specialKeyName: "Eignung",
            specialKeyValue: {
                blinde: "Blinde",
                gehbehinderte: "Gehbehinderte",
                kognitiv_beeintraechtigte: "Kognitiv Beeinträchtigte",
                rollstuhlfahrende: "Rollstuhlfahrende",
                sehbeeintraechtigte: "Sehbeeinträchtigte"
            },
            type: "tool",
            parentId: "tools"
        }]);
        model = new Model();
    });

    describe("createExtent", function () {
        it("should create null extent for undefined coords", function () {
            const addressCoord = undefined,
                featureCoord = undefined;

            expect(model.createExtent(addressCoord, featureCoord)).to.deep.equal(
                [0, 0, 0, 0]
            );
        });
        it("should create null extent for undefined addressCoord", function () {
            const addressCoord = undefined,
                featureCoord = [0, 0];

            expect(model.createExtent(addressCoord, featureCoord)).to.deep.equal(
                [0, 0, 0, 0]
            );
        });
        it("should create null extent for undefined featureCoord", function () {
            const addressCoord = [0, 0],
                featureCoord = undefined;

            expect(model.createExtent(addressCoord, featureCoord)).to.deep.equal(
                [0, 0, 0, 0]
            );
        });

        it("should create null extent for coords with strings", function () {
            const addressCoord = ["5", "50"],
                featureCoord = ["10", "100"];

            expect(model.createExtent(addressCoord, featureCoord)).to.deep.equal(
                [0, 0, 0, 0]
            );
        });

        it("should create correct extent", function () {
            const addressCoord = [5, 50],
                featureCoord = [10, 100];

            expect(model.createExtent(addressCoord, featureCoord, 0)).to.deep.equal(
                [5, 50, 10, 100]
            );
        });

        it("should create correct extent with offset", function () {
            const addressCoord = [5, 50],
                featureCoord = [10, 100];

            expect(model.createExtent(addressCoord, featureCoord, 5)).to.deep.equal(
                [0, 45, 15, 105]
            );
        });
    });
    describe("isValidCoord", function () {
        it("should return false for undefined input", function () {
            expect(model.isValidCoord(undefined)).to.be.false;
        });
        it("should return false for object as input", function () {
            expect(model.isValidCoord({})).to.be.false;
        });
        it("should return false for empty array as input", function () {
            expect(model.isValidCoord([])).to.be.false;
        });
        it("should return false for string array as input", function () {
            expect(model.isValidCoord(["5", "0"])).to.be.false;
        });
        it("should return false for array with one number as input", function () {
            expect(model.isValidCoord([5])).to.be.false;
        });
        it("should return false for array with 4 numbers as input", function () {
            expect(model.isValidCoord([5, 4, 3, 2])).to.be.false;
        });
        it("should return true for coordinate with 2 values as input", function () {
            expect(model.isValidCoord([5, 4])).to.be.true;
        });
        it("should return true for coordinate with 3 values as input", function () {
            expect(model.isValidCoord([5, 4, 500])).to.be.true;
        });
    });
});
