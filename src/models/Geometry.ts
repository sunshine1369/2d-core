export interface VertexArrayParam {
    vertexArray:Float32Array
    vertexCount:number;

}

class Geometry {
    vertexArrayParam:VertexArrayParam;
    constructor(vertex:Float32Array,size:number) {
        this.vertexArrayParam = {
            vertexArray: vertex,
            vertexCount: size
        };
    }

    getVertexArrayParm(){
        return this.vertexArrayParam;
    }
 
}
export { Geometry };
