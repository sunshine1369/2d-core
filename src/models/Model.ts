import { Geometry } from './Geometry';

class Model {
    geometry: Geometry;
    constructor(position:number[],color:number[]) {
        let vertex=new Float32Array(position.length*2);
        for(let i=0;i<position.length/3;i++){
             vertex[i*6]=position[i*3];
             vertex[i*6+1]=position[i*3+1];
             vertex[i*6+2]=position[i*3+2];
             vertex[i*6+3]=color[i*3];
             vertex[i*6+4]=color[i*3+1];
             vertex[i*6+5]=color[i*3+2];
        }
        this.geometry = new Geometry(vertex,position.length/3);
    }
   getModelVertexArrayParam(){
    return this.geometry.getVertexArrayParm();
   }


   
}
export { Model };
