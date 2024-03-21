interface Attributes {
    position: Iterable<GPUVertexAttribute>;
    color: Iterable<GPUVertexAttribute>;
}
class Geometry {
    attributes: Attributes;
    constructor() {
        this.attributes = {
            position: [
                {
                    // 顶点缓冲区属性
                    shaderLocation: 0, //GPU显存上顶点缓冲区标记存储位置
                    format: 'float32x3', //格式：loat32x3表示一个顶点数据包含3个32位浮点数
                    offset: 0 //arrayStride表示每组顶点数据间隔字节数，offset表示读取改组的偏差字节数，没特殊需要一般设置0
                }
            ],
            color: [
                {
                    // 顶点缓冲区属性
                    shaderLocation: 1, //GPU显存上顶点缓冲区标记存储位置
                    format: 'float32x3', //格式：loat32x3表示一个顶点颜色数据包含3个32位浮点数
                    offset: 0 //arrayStride表示每组顶点数据间隔字节数，offset表示读取改组的偏差字节数，没特殊需要一般设置0
                }
            ]
        };
    }
    getPositionAttributes() {
        return this.attributes.position;
    }
    getColorAttributes() {
        return this.attributes.color;
    }
}
export { Geometry };
