import { Geometry } from './Geometry';

class Model {
    geometry: Geometry;
    constructor() {
        this.geometry = new Geometry();
    }
    getPositionAttributes() {
        return this.geometry.getPositionAttributes();
    }
    getColorAttributes() {
        return this.geometry.getColorAttributes();
    }
}
export { Model };
