struct VertexInput {
   @builtin(position) position:vec4<f32>,
   @location(0) vColor:vec3<f32>,
};



@vertex
fn main(@location(0) pos: vec3<f32>,@location(1) color: vec3<f32>) -> VertexInput {
    var out:VertexInput;
    out.position = vec4<f32>(pos, 1.0);
    out.vColor = color;
    return out;
}
