import Point from "ol/geom/Point.js";

const actions = {
    addVehicleToRoutingLayer ({state}, obj) {
        const cbFunction = obj.cbFunction,
            vehicle = obj.vehicle,
            start = vehicle.start,
            end = vehicle.end;

        vehicle.geometry = new Point(start);
        cbFunction(vehicle);
        // if start or end coordinates are not the same, add a second feature for the end coordinates
        if (start[0] !== end[0] || start[1] !== end[1]) {
            vehicle.geometry = new Point(end);
            cbFunction(vehicle);
        }
    },
    addJobToRoutingLayer ({state}, obj) {
        const cbFunction = obj.cbFunction,
            job = obj.job;

        job.geometry = new Point(job.location);
        cbFunction(job);
    },
};

export default actions;
