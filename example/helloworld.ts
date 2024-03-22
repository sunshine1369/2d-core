/*
 * @Author: elon.chen elon.chen@dji.com
 * @Date: 2024-03-20 11:39:13
 * @LastEditors: elon.chen elon.chen@dji.com
 * @LastEditTime: 2024-03-20 16:49:15
 * @FilePath: /webgpu-origin/example/main.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Viewer } from '../src/Viewer';
import { Model } from '../src/models/Model';
import { renderMode } from '../src/core/Render';
const canvas = document.getElementById('gfx') as HTMLCanvasElement;
canvas.width = canvas.height = 640;
const viewer = new Viewer(canvas);
let model1=new Model([0,0,1,1,0,1,0,1,1],[0,0,1,0,1,0,0,0,1]);
let model2=new Model([0,0,1,-1,0,1,0,-1,1],[1,0,0,0,1,0,0,0,1]);
let model3=new Model([-1,0,1,-1,1,1,0,1,1],[1,0,0,1,0,0,1,0,0]);
viewer.scene.add(model1);
viewer.scene.add(model2);
viewer.scene.add(model3);
viewer.render(renderMode.triangle);
