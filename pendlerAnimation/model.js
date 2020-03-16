/**
 * TODO
 * @returns {Object} The model.
 */
function initializePendlerAnimationModel () {
    const PendlerAnimationModel = Radio.request("ModelList", "getModelByAttributes", {id: "pendlerAnimation"}),
        defaults = {
        };

    Object.assign(PendlerAnimationModel, {
        attributes: Object.assign(defaults, PendlerAnimationModel.attributes),
        initialize: function () {
            this.superInitialize();
            console.log(123);

        }
    });

    PendlerAnimationModel.initialize();
    return PendlerAnimationModel;
}
export default initializePendlerAnimationModel;
