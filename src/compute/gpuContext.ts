// ─────────────────────────────────────────────────────────────────────────────
// WebGPU device context — singleton initialisation
// ─────────────────────────────────────────────────────────────────────────────

export interface GpuContext {
  device: GPUDevice;
  adapterInfo: string;
}

let cached: GpuContext | null = null;

export async function initGPU(): Promise<GpuContext | null> {
  if (cached) return cached;

  if (!navigator.gpu) {
    console.warn('[WebGPU] navigator.gpu is undefined.');
    return null;
  }

  const adapter = await navigator.gpu.requestAdapter();

  if (!adapter) {
    console.warn('[WebGPU] requestAdapter() returned null.');
    return null;
  }

  const device = await adapter.requestDevice();

  device.addEventListener('uncapturederror', (e) => {
    console.error('[WebGPU] Uncaptured error:', (e as GPUUncapturedErrorEvent).error);
  });

  // requestAdapterInfo() is deprecated in Chrome 121+ — read the synchronous
  // info property instead, with a safe fallback for older implementations.
  let adapterInfo = 'Unknown GPU';
  try {
    const info = adapter.info;
    adapterInfo = [info.vendor, info.architecture, info.device].filter(Boolean).join(' · ') || 'Unknown GPU';
  } catch {
    // info property not available — leave as 'Unknown GPU'
  }

  cached = { device, adapterInfo };
  return cached;
}

/** Destroys the cached device (e.g. on hot-reload). */
export function destroyGPU(): void {
  if (cached) {
    cached.device.destroy();
    cached = null;
  }
}
