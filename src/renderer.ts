import vertShaderCode from './shaders/triangle.vert.wgsl';
import fragShaderCode from './shaders/triangle.frag.wgsl';
const glMatrix = require('gl-matrix');
//  Position Vertex Buffer Data
const vertexArray = new Float32Array([
    0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0
]);
const colorArray = new Float32Array([
    1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0
]);
export default class Renderer {
    canvas: HTMLCanvasElement;

    // ⚙️ API Data Structures
    adapter: GPUAdapter;
    device: GPUDevice;
    queue: GPUQueue;
    context: GPUCanvasContext;
    bindGroup: GPUBindGroup;
    vertexBuffer: GPUBuffer;
    colorBuffer: GPUBuffer;
    mat4Buffer: GPUBuffer;
    pipeline: GPURenderPipeline;

    commandEncoder: GPUCommandEncoder;
    renderPass: GPURenderPassEncoder;

    constructor(canvas) {
        this.canvas = canvas;
    }

    //  Start the rendering engine
    async start() {
        if (await this.initializeAPI()) {
            this.initContext();
            this.initializeResources();
            this.render();
        }
    }

    // 🌟 Initialize WebGPU
    async initializeAPI(): Promise<boolean> {
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

    // Initialize resources to render triangle (buffers, shaders, pipeline)
    initializeResources() {
        this.vertexBuffer = this.device.createBuffer({
            size: vertexArray.byteLength, //顶点数据的字节长度
            //usage设置该缓冲区的用途(作为顶点缓冲区|可以写入顶点数据)
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });

        this.colorBuffer = this.device.createBuffer({
            size: colorArray.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });

        this.device.queue.writeBuffer(this.vertexBuffer, 0, vertexArray);
        this.device.queue.writeBuffer(this.colorBuffer, 0, colorArray);
        this.pipeline = this.device.createRenderPipeline({
            layout: 'auto',
            vertex: {
                //顶点相关配置
                module: this.device.createShaderModule({
                    code: vertShaderCode
                }),
                entryPoint: 'main',
                buffers: [
                    // 顶点所有的缓冲区模块设置
                    {
                        //其中一个顶点缓冲区设置

                        arrayStride: 3 * 4, //一个顶点数据占用的字节长度，该缓冲区一个顶点包含xyz三个分量，每个数字是4字节浮点数，3*4字节长度
                        attributes: [
                            {
                                // 顶点缓冲区属性
                                shaderLocation: 0, //GPU显存上顶点缓冲区标记存储位置
                                format: 'float32x3', //格式：loat32x3表示一个顶点数据包含3个32位浮点数
                                offset: 0 //arrayStride表示每组顶点数据间隔字节数，offset表示读取改组的偏差字节数，没特殊需要一般设置0
                            }
                        ]
                    },
                    {
                        arrayStride: 3 * 4,
                        attributes: [
                            {
                                // 顶点缓冲区属性
                                shaderLocation: 1, //GPU显存上顶点缓冲区标记存储位置
                                format: 'float32x3', //格式：loat32x3表示一个顶点颜色数据包含3个32位浮点数
                                offset: 0 //arrayStride表示每组顶点数据间隔字节数，offset表示读取改组的偏差字节数，没特殊需要一般设置0
                            }
                        ]
                    }
                ]
            },
            fragment: {
                // 片元着色器
                module: this.device.createShaderModule({
                    code: fragShaderCode
                }),
                entryPoint: 'main',
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

    // ↙️ Resize swapchain, frame buffer attachments
    initContext() {
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

    // ✍️ Write commands to send to the GPU
    encodeCommands() {
        // 创建GPU命令编码器对象

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
        this.renderPass.setVertexBuffer(0, this.vertexBuffer);
        this.renderPass.setVertexBuffer(1, this.colorBuffer);
        this.renderPass.draw(3);
        this.renderPass.end();
        // 命令编码器.finish()创建命令缓冲区(生成GPU指令存入缓冲区)
        const commandBuffer = this.commandEncoder.finish();
        // 命令编码器缓冲区中命令传入GPU设备对象的命令队列.queue
        this.device.queue.submit([commandBuffer]);
    }

    render = () => {
        // 📦 Write and submit commands to queue
        this.encodeCommands();

        // ➿ Refresh canvas
        requestAnimationFrame(this.render);
    };
}
