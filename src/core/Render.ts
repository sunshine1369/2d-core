/*
 * @Author: elon.chen elon.chen@dji.com
 * @Date: 2024-03-20 12:16:10
 * @LastEditors: elon.chen elon.chen@dji.com
 * @LastEditTime: 2024-03-20 14:09:31
 * @FilePath: /webgpu-origin/src/core/Render.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import vertShaderCode from '../shaders/triangle.vert.wgsl';
import fragShaderCode from '../shaders/triangle.frag.wgsl';
import { Scene } from '../scenes/Scene';
class Renderer {
    canvas: HTMLCanvasElement;
    // ⚙️ API Data Structures
    adapter: GPUAdapter;
    device: GPUDevice;
    queue: GPUQueue;
    context: GPUCanvasContext;
    pipeline: GPURenderPipeline;
    vertexBuffer: GPUBuffer;
    colorBuffer: GPUBuffer;
    commandEncoder: GPUCommandEncoder;
    renderPass: GPURenderPassEncoder;
    constructor(canvas) {
        this.canvas = canvas;
        this.start();
    }

    //  Start the rendering engine
    private async start() {
        if (await this.initializeAPI()) {
            this.initContext();
        }
    }
    // 🌟 Initialize WebGPU
    private async initializeAPI(): Promise<boolean> {
        try {
            //  Entry to WebGPU
            const entry: GPU = navigator.gpu;
            if (!entry) {
                return false;
            }
            //  Physical Device Adapter
            this.adapter = await entry.requestAdapter();
            // Logical Device
            this.device = await this.adapter.requestDevice();
            //  Queue
            this.queue = this.device.queue;
        } catch (e) {
            console.error(e);
            return false;
        }

        return true;
    }
    // ↙️ Resize swapchain, frame buffer attachments
    private initContext() {
        // ⛓️ Swapchain
        if (!this.context) {
            this.context = this.canvas.getContext('webgpu');
            const canvasConfig: GPUCanvasConfiguration = {
                device: this.device,
                format: navigator.gpu.getPreferredCanvasFormat()
            };
            this.context.configure(canvasConfig);
        }
    }

    // 渲染管线设置
    public async renderPipeline(scene: Scene) {
        // 创建GPU命令编码器对象
        if (!this.device) {
            await this.start();
        }
        this.pipeline = this.device.createRenderPipeline({
            layout: 'auto',
            vertex: {
                //顶点相关配置
                module: this.device.createShaderModule({
                    code: vertShaderCode
                }),
                entryPoint: 'main',
                buffers: [
                    {
                        arrayStride: 3 * 4, //一个顶点数据占用的字节长度，该缓冲区一个顶点包含xyz三个分量，每个数字是4字节浮点数，3*4字节长度
                        attributes: scene.getModelsPositionAttributes()
                        //arrayStride表示每组顶点数据间隔字节数，offset表示读取改组的偏差字节数，没特殊需要一般设置0
                    },
                    {
                        arrayStride: 3 * 4,
                        attributes: scene.getModelsColorAttributes()
                    }
                ]
            },
            fragment: {
                // 片元着色器
                module: this.device.createShaderModule({
                    code: fragShaderCode
                }),
                targets: [
                    {
                        format: navigator.gpu.getPreferredCanvasFormat() //和WebGPU上下文配置的颜色格式保持一致
                    }
                ]
            },
            primitive: {
                topology: 'triangle-list' //三角形绘制顶点数据
            }
        });
    }
    //渲染指令设置
    public async encodeCommands() {
        // 创建GPU命令编码器对象
        if (!this.device) {
            await this.start();
        }
        this.commandEncoder = this.device.createCommandEncoder();
        this.renderPass = this.commandEncoder.beginRenderPass({
            // 给渲染通道指定颜色缓冲区，配置指定的缓冲区
            colorAttachments: [
                {
                    // 指向用于Canvas画布的纹理视图对象(Canvas对应的颜色缓冲区)
                    // 该渲染通道renderPass输出的像素数据会存储到Canvas画布对应的颜色缓冲区(纹理视图对象)
                    view: this.context.getCurrentTexture().createView(),
                    storeOp: 'store', //像素数据写入颜色缓冲区
                    loadOp: 'clear',
                    clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 } //背景颜色
                }
            ]
        });
        this.renderPass.setPipeline(this.pipeline);
        this.renderPass.draw(3);
        this.renderPass.end();
        // 命令编码器.finish()创建命令缓冲区(生成GPU指令存入缓冲区)
        const commandBuffer = this.commandEncoder.finish();
        // 命令编码器缓冲区中命令传入GPU设备对象的命令队列.queue
        this.device.queue.submit([commandBuffer]);
    }
}

export { Renderer };
