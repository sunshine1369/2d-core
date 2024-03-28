/*
 * @Author: elon.chen elon.chen@dji.com
 * @Date: 2024-03-20 15:19:36
 * @LastEditors: elon.chen elon.chen@dji.com
 * @LastEditTime: 2024-03-20 16:21:42
 * @FilePath: /webgpu-origin/src/scenes/Scene.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Model } from '../models/Model';
import { VertexArrayParam } from '../models/Geometry';
class Scene {
    models: Model[];
    constructor() {
        this.models = [];
    }
    add(model:Model) {
        if (this.contains(model)) return;

        this.models.push(model);
    }

    contains(model:Model) {
        return this.models.indexOf(model) !== -1;
    }

    getModelParam(){
   
        let totalSize=0;
        this.models.forEach((model:Model)=>{
           totalSize+=model.getModelVertexArrayParam().vertexCount*3*2;
      
        })

        let concatenatedArray = new Float32Array(totalSize);
        let offset = 0;
        this.models.forEach((model:Model)=>{

            concatenatedArray.set(model.getModelVertexArrayParam().vertexArray,offset);
            offset+=model.getModelVertexArrayParam().vertexArray.length;
         })
        
        let vertexArray:VertexArrayParam={
            vertexArray:concatenatedArray,
            vertexCount:totalSize/6
        }
        return vertexArray;
    }  

    remove(model:Model) {
        const index = this.models.indexOf(model);
        if (index !== -1) {
            this.models.splice(index, 1);

            return true;
        }

        return false;
    }
}
export { Scene };
