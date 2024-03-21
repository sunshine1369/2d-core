/*
 * @Author: elon.chen elon.chen@dji.com
 * @Date: 2024-03-20 12:13:09
 * @LastEditors: elon.chen elon.chen@dji.com
 * @LastEditTime: 2024-03-20 15:14:50
 * @FilePath: /webgpu-origin/src/Viewer.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Renderer } from './core/Render';
import { Scene } from './scenes/Scene';
class Viewer {
    canvas: HTMLCanvasElement;
    renderer: Renderer;
    scene: Scene;
    constructor(canvas) {
        this.canvas = canvas;
        this.renderer = new Renderer(canvas);
        this.scene = new Scene();
    }

    render() {
        this.renderer.renderPipeline(this.scene);
        this.renderer.encodeCommands();
    }
}

export { Viewer };
