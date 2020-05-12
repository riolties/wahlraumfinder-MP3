import {expect} from "chai";
import Model from "@addons/animation/model.js";

let model;

before(function () {
    model = new Model({
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
});

describe("addons/Animation", function () {
    describe("defaultTest", function () {
        it("initial setup test", function () {
            console.error(model.get("name"));
            expect(true).to.be.true;
        });
    });
});
