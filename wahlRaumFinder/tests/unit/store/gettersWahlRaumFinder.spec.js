import {expect} from "chai";
import getters from "../../../store/gettersWahlRaumFinder";
import stateWahlRaumFinder from "../../../store/stateWahlRaumFinder";


const {
    active,
    id,
    name,
    glyphicon,
    renderToWindow,
    resizableWindow,
    isVisibleInMenu,
    deactivateGFI} = getters;

describe("addons/WahlRaumFinder/store/gettersWahlRaumFinder", function () {
    it("returns the active from state", function () {
        expect(active(stateWahlRaumFinder)).to.be.false;
    });
    it("returns the id from state", function () {
        expect(id(stateWahlRaumFinder)).to.equals("WahlRaumFinder");
    });

    describe("testing default values", function () {
        it("returns the name default value from state", function () {
            expect(name(stateWahlRaumFinder)).to.be.equals("WahlRaumFinder");
        });
        it("returns the glyphicon default value from state", function () {
            expect(glyphicon(stateWahlRaumFinder)).to.equals("glyphicon-screenshot");
        });
        it("returns the renderToWindow default value from state", function () {
            expect(renderToWindow(stateWahlRaumFinder)).to.be.false;
        });
        it("returns the resizableWindow default value from state", function () {
            expect(resizableWindow(stateWahlRaumFinder)).to.be.true;
        });
        it("returns the isVisibleInMenu default value from state", function () {
            expect(isVisibleInMenu(stateWahlRaumFinder)).to.be.true;
        });
        it("returns the deactivateGFI default value from state", function () {
            expect(deactivateGFI(stateWahlRaumFinder)).to.be.true;
        });

    });
});
