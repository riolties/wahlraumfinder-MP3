import {expect} from "chai";
import getters from "../../../store/gettersRouting";
import state from "../../../store/stateRouting";


const {
    active,
    id,
    name,
    glyphicon,
    renderToWindow,
    resizableWindow,
    isVisibleInMenu,
    deactivateGFI} = getters;

describe("addons/Routing/store/gettersRouting", function () {
    it("returns the active from state", function () {
        expect(active(state)).to.be.false;
    });
    it("returns the id from state", function () {
        expect(id(state)).to.equals("routing");
    });

    describe("testing default values", function () {
        it("returns the name default value from state", function () {
            expect(name(state)).to.be.equals("Routing");
        });
        it("returns the glyphicon default value from state", function () {
            expect(glyphicon(state)).to.equals("glyphicon-screenshot");
        });
        it("returns the renderToWindow default value from state", function () {
            expect(renderToWindow(state)).to.be.true;
        });
        it("returns the resizableWindow default value from state", function () {
            expect(resizableWindow(state)).to.be.true;
        });
        it("returns the isVisibleInMenu default value from state", function () {
            expect(isVisibleInMenu(state)).to.be.true;
        });
        it("returns the deactivateGFI default value from state", function () {
            expect(deactivateGFI(state)).to.be.true;
        });

    });
});
