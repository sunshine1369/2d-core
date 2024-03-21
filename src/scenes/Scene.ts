/*
 * @Author: elon.chen elon.chen@dji.com
 * @Date: 2024-03-20 15:19:36
 * @LastEditors: elon.chen elon.chen@dji.com
 * @LastEditTime: 2024-03-20 16:21:42
 * @FilePath: /webgpu-origin/src/scenes/Scene.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Model } from '../models/Model';

class Scene {
    models: Model[];
    constructor() {
        this.models = [];
    }
    add(model) {
        if (this.contains(model)) return;

        this.models.push(model);
    }

    contains(model) {
        return this.models.indexOf(model) !== -1;
    }

    getModelsPositionAttributes() {
        let attributes: Iterable<GPUVertexAttribute> = [];
        const iterator = this.models[Symbol.iterator]();

        // 遍历 attributes，并将 this.models 中的值赋给每个属性
        for (let attribute of attributes) {
            const nextModel = iterator.next();
            if (nextModel.done) {
                break; // 如果 this.models 的长度小于 attributes 的长度，退出循环
            }

            // 假设 GPUVertexAttribute 类型有一个属性 value，用于存储值
            attribute = nextModel.value.getPositionAttributes();
        }

        // 确保所有值都已赋值
        if (!iterator.next().done) {
            console.error('this.models 的长度大于 attributes 的长度');
        }
        return attributes;
    }

    getModelsColorAttributes() {
        let attributes: Iterable<GPUVertexAttribute> = [];
        const iterator = this.models[Symbol.iterator]();

        // 遍历 attributes，并将 this.models 中的值赋给每个属性
        for (let attribute of attributes) {
            const nextModel = iterator.next();
            if (nextModel.done) {
                break; // 如果 this.models 的长度小于 attributes 的长度，退出循环
            }

            // 假设 GPUVertexAttribute 类型有一个属性 value，用于存储值
            attribute = nextModel.value.getColorAttributes();
        }

        // 确保所有值都已赋值
        if (!iterator.next().done) {
            console.error('this.models 的长度大于 attributes 的长度');
        }
        return attributes;
    }

    remove(model) {
        const index = this.models.indexOf(model);
        if (index !== -1) {
            this.models.splice(index, 1);

            return true;
        }

        return false;
    }
}
export { Scene };
