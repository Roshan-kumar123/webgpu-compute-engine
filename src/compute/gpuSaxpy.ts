// ─────────────────────────────────────────────────────────────────────────────
// GPU SAXPY pipeline wrapper  —  Y[i] = alpha * X[i] + Y[i]
// ─────────────────────────────────────────────────────────────────────────────

import type { BenchmarkResult } from './types';
import saxpyWgsl from '../wgsl/saxpy.wgsl?raw';

let cachedPipeline: GPUComputePipeline | null = null;
let pipelineDevice: GPUDevice | null = null;

function getPipeline(device: GPUDevice): GPUComputePipeline {
  if (cachedPipeline && pipelineDevice === device) return cachedPipeline;

  const module = device.createShaderModule({ code: saxpyWgsl });
  cachedPipeline = device.createComputePipeline({
    layout: 'auto',
    compute: { module, entryPoint: 'main' },
  });
  pipelineDevice = device;
  return cachedPipeline;
}

/**
 * Runs Y = alpha*X + Y on the GPU for Float32 arrays of the given length.
 *
 * @param device  Active GPUDevice from gpuContext
 * @param length  Number of f32 elements in each vector
 */
export async function gpuSaxpy(device: GPUDevice, length: number): Promise<BenchmarkResult> {
  const pipeline = getPipeline(device);

  const byteSize = length * Float32Array.BYTES_PER_ELEMENT;

  // ── Create and upload vectors ─────────────────────────────────────────────

  const xData = new Float32Array(length).fill(1.5);
  const yData = new Float32Array(length).fill(2.5);

  const bufX = device.createBuffer({
    size: byteSize,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
  const bufY = device.createBuffer({
    size: byteSize,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
  });

  // Uniforms: alpha (f32) + length (u32) packed into 8 bytes, padded to 16
  const uniformData = new ArrayBuffer(16);
  new Float32Array(uniformData, 0, 1)[0] = 3.0;       // alpha
  new Uint32Array(uniformData, 4, 1)[0] = length;      // length

  const bufUniforms = device.createBuffer({
    size: 16,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  device.queue.writeBuffer(bufX, 0, xData);
  device.queue.writeBuffer(bufY, 0, yData);
  device.queue.writeBuffer(bufUniforms, 0, uniformData);

  // ── Bind group ────────────────────────────────────────────────────────────

  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: bufX } },
      { binding: 1, resource: { buffer: bufY } },
      { binding: 2, resource: { buffer: bufUniforms } },
    ],
  });

  // ── Dispatch ──────────────────────────────────────────────────────────────

  const WORKGROUP_SIZE = 256;
  const workgroups = Math.ceil(length / WORKGROUP_SIZE);

  const encoder = device.createCommandEncoder();
  const pass = encoder.beginComputePass();
  pass.setPipeline(pipeline);
  pass.setBindGroup(0, bindGroup);
  pass.dispatchWorkgroups(workgroups);
  pass.end();

  // ── Readback buffer (forces GPU→CPU sync) ─────────────────────────────────

  const readBuf = device.createBuffer({
    size: Float32Array.BYTES_PER_ELEMENT,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  });
  encoder.copyBufferToBuffer(bufY, 0, readBuf, 0, Float32Array.BYTES_PER_ELEMENT);

  // ── Submit and measure ────────────────────────────────────────────────────

  const t0 = performance.now();
  device.queue.submit([encoder.finish()]);
  await device.queue.onSubmittedWorkDone();
  const durationMs = performance.now() - t0;

  await readBuf.mapAsync(GPUMapMode.READ);
  readBuf.unmap();

  // ── Cleanup ───────────────────────────────────────────────────────────────
  bufX.destroy();
  bufY.destroy();
  bufUniforms.destroy();
  readBuf.destroy();

  return { durationMs };
}
