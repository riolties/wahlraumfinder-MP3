import {expect} from "chai";
import getters from "../../../store/gettersMietspiegelGebaeudetypen";
import state from "../../../store/stateMietspiegelGebaeudetypen";


const {
    active,
    id,
    name,
    glyphicon,
    renderToWindow,
    resizableWindow,
    isVisibleInMenu,
    deactivateGFI} = getters;

describe("addons/MietspiegelWohnlage/store/gettersMietspiegelGebaeudetypen", function () {
    it("returns the active from state", function () {
        expect(active(state)).to.be.false;
    });
    it("returns the id from state", function () {
        expect(id(state)).to.equals("mietspiegel_gebaeudetypen");
    });

    describe("testing default values", function () {
        it("returns the name default value from state", function () {
            expect(name(state)).to.be.equals("Mietspiegel Gebäudetypen");
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
