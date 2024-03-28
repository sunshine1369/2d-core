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
export enum renderMode {
    triangle='triangle-list',
    line='line-strip',
    point='line-list'
}
class Renderer {
    canvas: HTMLCanvasElement;
    adapter: GPUAdapter;
    device: GPUDevice;
    queue: GPUQueue;
    context: GPUCanvasContext;
    pipeline: GPURenderPipeline;
    vertexBuffer: GPUBuffer;
    commandEncoder: GPUCommandEncoder;
    renderPass: GPURenderPassEncoder;
    presentationFormat:GPUTextureFormat;
    canvasToSizeMap:WeakMap<object, any>;
    constructor(canvas) {
        this.canvas = canvas;
        this.start();
        this.presentationFormat=navigator.gpu.getPreferredCanvasFormat();
        this.canvasToSizeMap=new WeakMap();
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
                format: this.presentationFormat
            };
            this.context.configure(canvasConfig);
        }

        
    }

   

     resizeCanvasToDisplaySize(canvas:HTMLCanvasElement) {
      // Get the canvas's current display size
      let { width, height } = this.canvasToSizeMap.get(canvas) || canvas;
  
      // Make sure it's valid for WebGPU
      width = Math.max(1, Math.min(width, this.device.limits.maxTextureDimension2D));
      height = Math.max(1, Math.min(height, this.device.limits.maxTextureDimension2D));
  
      // Only if the size is different, set the canvas size
      const needResize = canvas.width !== width || canvas.height !== height;
      if (needResize) {
        canvas.width = width;
        canvas.height = height;
      }
      return needResize;
    }

    public async render(scene:Scene,mode:renderMode){
        if (!this.device) {
            await this.start();
        }
        let vertexArrayParam=scene.getModelParam();
        let vertexArray=vertexArrayParam.vertexArray;
        this.vertexBuffer=this.device.createBuffer({
            size:vertexArray.byteLength,
            usage:GPUBufferUsage.VERTEX,
            mappedAtCreation: true,
          })
          new Float32Array(this.vertexBuffer.getMappedRange()).set( vertexArray);
          this.vertexBuffer.unmap();

          this.pipeline = this.device.createRenderPipeline({
            layout: 'auto',
            vertex: {
                //顶点相关配置
                module: this.device.createShaderModule({
                    code: vertShaderCode
                }),
                buffers: [
                    {
                      arrayStride:4*6,
                      attributes: [
                        {
                          // position
                          shaderLocation: 0,
                          offset: 0,
                          format: 'float32x4',
                        },
                        {
                          // color
                          shaderLocation: 1,
                          offset: 3*4,
                          format: 'float32x2',
                        },
                      ],
                    },
                  ],
            },
            fragment: {
                // 片元着色器
                module: this.device.createShaderModule({
                    code: fragShaderCode
                }),
                targets: [
                    {
                        format: this.presentationFormat //和WebGPU上下文配置的颜色格式保持一致
                    }
                ]
            },
            primitive: {
                topology: mode 
            }
        });
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
        this.renderPass.setVertexBuffer(0,this.vertexBuffer);
        this.renderPass.draw(vertexArrayParam.vertexCount);
        this.renderPass.end();
        // 命令编码器.finish()创建命令缓冲区(生成GPU指令存入缓冲区)
        const commandBuffer = this.commandEncoder.finish();
        // 命令编码器缓冲区中命令传入GPU设备对象的命令队列.queue
        this.device.queue.submit([commandBuffer]);
        const observer = new ResizeObserver(entries => {
            for (const entry of entries) {
              this.canvasToSizeMap.set(entry.target, {
                 width: entry.contentBoxSize[0].inlineSize,
                 height: entry.contentBoxSize[0].blockSize,
              });
            }
            this.render(scene,mode);
          });
          observer.observe(this.canvas);
    }



}

export { Renderer };
