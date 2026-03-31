// ─────────────────────────────────────────────────────────────────────────────
// GPU Matrix Multiplication pipeline wrapper
// ─────────────────────────────────────────────────────────────────────────────

import type { BenchmarkResult } from './types';
import matmulWgsl from '../wgsl/matmul.wgsl';

// Cache the compiled pipeline so repeated runs don't pay shader compilation cost
let cachedPipeline: GPUComputePipeline | null = null;
let pipelineDevice: GPUDevice | null = null;

function getPipeline(device: GPUDevice): GPUComputePipeline {
  // Invalidate cache if the device changed (e.g. after page hot-reload)
  if (cachedPipeline && pipelineDevice === device) return cachedPipeline;

  const module = device.createShaderModule({ code: matmulWgsl });

  cachedPipeline = device.createComputePipeline({
    layout: 'auto',
    compute: { module, entryPoint: 'main' },
  });
  pipelineDevice = device;
  return cachedPipeline;
}

/**
 * Runs C = A × B on the GPU for N×N matrices of random f32 values.
 *
 * Timing strategy:
 *   1. Record `performance.now()` immediately before `queue.submit()`
 *   2. Await `queue.onSubmittedWorkDone()` — this resolves only after the GPU
 *      has finished executing the submitted commands, giving us an accurate
 *      wall-clock measurement that includes actual GPU execution time.
 *   3. A small readback of one result byte forces a full GPU → CPU sync and
 *      prevents any deferred execution from escaping the measurement window.
 *
 * @param device  Active GPUDevice from gpuContext
 * @param n       Matrix dimension  (N×N matrices)
 */
export async function gpuMatmul(device: GPUDevice, n: number): Promise<BenchmarkResult> {
  const pipeline = getPipeline(device);

  const byteSize = n * n * Float32Array.BYTES_PER_ELEMENT;

  // ── Create and upload buffers ─────────────────────────────────────────────

  // Matrix A — random data
  const aData = new Float32Array(n * n);
  for (let i = 0; i < aData.length; i++) aData[i] = Math.random();

  // Matrix B — random data
  const bData = new Float32Array(n * n);
  for (let i = 0; i < bData.length; i++) bData[i] = Math.random();

  const bufA = device.createBuffer({
    size: byteSize,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
  const bufB = device.createBuffer({
    size: byteSize,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
  const bufC = device.createBuffer({
    size: byteSize,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
  });

  // Uniform: matrix dimension N
  const uniformData = new Uint32Array([n]);
  const bufUniforms = device.createBuffer({
    size: 16, // min uniform binding size per WebGPU spec
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  device.queue.writeBuffer(bufA, 0, aData);
  device.queue.writeBuffer(bufB, 0, bData);
  device.queue.writeBuffer(bufUniforms, 0, uniformData);

  // ── Bind group ────────────────────────────────────────────────────────────

  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: bufA } },
      { binding: 1, resource: { buffer: bufB } },
      { binding: 2, resource: { buffer: bufC } },
      { binding: 3, resource: { buffer: bufUniforms } },
    ],
  });

  // ── Dispatch ──────────────────────────────────────────────────────────────

  const TILE = 16;
  const workgroups = Math.ceil(n / TILE);

  const encoder = device.createCommandEncoder();
  const pass = encoder.beginComputePass();
  pass.setPipeline(pipeline);
  pass.setBindGroup(0, bindGroup);
  pass.dispatchWorkgroups(workgroups, workgroups);
  pass.end();

  // ── Readback buffer (forces GPU→CPU sync) ─────────────────────────────────

  const readBuf = device.createBuffer({
    size: Float32Array.BYTES_PER_ELEMENT,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  });
  encoder.copyBufferToBuffer(bufC, 0, readBuf, 0, Float32Array.BYTES_PER_ELEMENT);

  // ── Submit and measure ────────────────────────────────────────────────────

  const t0 = performance.now();
  device.queue.submit([encoder.finish()]);
  await device.queue.onSubmittedWorkDone();
  const durationMs = performance.now() - t0;

  // Force sync read (validates result reached CPU memory)
  await readBuf.mapAsync(GPUMapMode.READ);
  readBuf.unmap();

  // ── Cleanup ───────────────────────────────────────────────────────────────
  bufA.destroy();
  bufB.destroy();
  bufC.destroy();
  bufUniforms.destroy();
  readBuf.destroy();

  return { durationMs };
}
