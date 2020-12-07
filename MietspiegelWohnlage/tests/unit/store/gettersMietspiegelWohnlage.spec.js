import {expect} from "chai";
import getters from "../../../store/gettersMietspiegelWohnlage";
import stateMietspiegelWohnlage from "../../../store/stateMietspiegelWohnlage";


const {
    active,
    id,
    name,
    glyphicon,
    renderToWindow,
    resizableWindow,
    isVisibleInMenu,
    deactivateGFI} = getters;

describe("addons/MietspiegelWohnlage/store/gettersMietspiegelWohnlage", function () {
    it("returns the active from state", function () {
        expect(active(stateMietspiegelWohnlage)).to.be.false;
    });
    it("returns the id from state", function () {
        expect(id(stateMietspiegelWohnlage)).to.equals("mietspiegel_wohnlage");
    });

    describe("testing default values", function () {
        it("returns the name default value from state", function () {
            expect(name(stateMietspiegelWohnlage)).to.be.equals("Mietspiegel Wohnlage");
        });
        it("returns the glyphicon default value from state", function () {
            expect(glyphicon(stateMietspiegelWohnlage)).to.equals("glyphicon-screenshot");
        });
        it("returns the renderToWindow default value from state", function () {
            expect(renderToWindow(stateMietspiegelWohnlage)).to.be.true;
        });
        it("returns the resizableWindow default value from state", function () {
            expect(resizableWindow(stateMietspiegelWohnlage)).to.be.true;
        });
        it("returns the isVisibleInMenu default value from state", function () {
            expect(isVisibleInMenu(stateMietspiegelWohnlage)).to.be.true;
        });
        it("returns the deactivateGFI default value from state", function () {
            expect(deactivateGFI(stateMietspiegelWohnlage)).to.be.true;
        });

    });
});
