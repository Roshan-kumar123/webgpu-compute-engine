// ─────────────────────────────────────────────────────────────────────────────
// SAXPY — Single-precision  Y[i] = alpha * X[i] + Y[i]
//
// This is the canonical BLAS Level-1 memory-bandwidth benchmark.  Unlike
// matrix multiplication (compute-bound), SAXPY is *bandwidth-bound*: each
// element is read once and written once with almost no arithmetic.  On the GPU
// every thread handles exactly one element, saturating the memory bus.
//
// Workgroup size: 256 threads along X.  The global dispatch covers the full
// array with ceil(length / 256) workgroups.  An out-of-bounds guard ensures
// safety when array length is not a multiple of 256.
// ─────────────────────────────────────────────────────────────────────────────

struct Uniforms {
  alpha  : f32,
  length : u32,
}

@group(0) @binding(0) var<storage, read>       vecX     : array<f32>;
@group(0) @binding(1) var<storage, read_write> vecY     : array<f32>;
@group(0) @binding(2) var<uniform>             uniforms : Uniforms;

@compute @workgroup_size(256)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let idx = gid.x;
  if (idx >= uniforms.length) { return; }
  vecY[idx] = uniforms.alpha * vecX[idx] + vecY[idx];
}
