import {expect} from "chai";
import ModelList from "@modules/core/modelList/list.js";
import Tool from "@modules/core/modelList/tool/model.js";
import initializeAnimationModel from "@addons/animation/model.js";

let tool,
    model;

before(function () {
    tool = new Tool({
        id: "animationAddOn",
        name: "AddOn:Animation",
        glyphicon: "glyphicon-play-circle",
        dataType: "GeoJSON",
        classes: [
            {
                name: "Wohnort",
                levels: [
                    {
                        title: "Kreis auswählen",
                        attr: "wohnort_kreis"
                    },
                    {
                        title: "Gemeinde auswählen",
                        attr: "wohnort"
                    }
                ]
            },
            {
                name: "Arbeitsort",
                levels: [
                    {
                        title: "Kreis auswählen",
                        attr: "arbeitsort_kreis"
                    },
                    {
                        title: "Gemeinde auswählen",
                        attr: "arbeitsort"
                    }
                ]
            }
        ],
        topMost: [3, 5, 10],
        sort: "desc",
        colors: [],
        attrCount: "anzahl_pendler",
        steps: 50,
        minPx: 5,
        maxPx: 20,
        showLineStringLayer: true
    });
    new ModelList([tool]);
    model = initializeAnimationModel();
});

describe("addons/Animation", function () {
    describe("defaultTest", function () {
        it("initial setup test", function () {
            expect(true).to.be.true;
        });
    });
});
