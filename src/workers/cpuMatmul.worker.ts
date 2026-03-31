// ─────────────────────────────────────────────────────────────────────────────
// CPU Matrix Multiplication Web Worker
//
// Runs the naive O(N³) triple-loop on the CPU, intentionally unoptimised to
// maximise the contrast with the GPU's massively parallel tiled approach.
//
// Message protocol:
//   IN  → { n: number }           — matrix dimension N  (matrices are N×N)
//   OUT → { progress: number }    — 0–100, emitted once per completed row
//   OUT → { durationMs: number }  — final result, emitted after last row
// ─────────────────────────────────────────────────────────────────────────────

self.onmessage = (event: MessageEvent<{ n: number }>) => {
  const { n } = event.data;

  // Allocate N×N matrices
  const A = new Float32Array(n * n);
  const B = new Float32Array(n * n);
  const C = new Float32Array(n * n);

  // Fill with deterministic values (avoids random() overhead skewing timing)
  for (let i = 0; i < n * n; i++) {
    A[i] = (i % 7) * 0.1 + 0.1;
    B[i] = (i % 13) * 0.1 + 0.1;
  }

  const start = performance.now();

  // Naive triple-loop matmul — same semantics as the WGSL tiled shader
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      let sum = 0;
      for (let k = 0; k < n; k++) {
        sum += A[row * n + k] * B[k * n + col];
      }
      C[row * n + col] = sum;
    }

    // Emit progress after every completed row (N messages total, ≤1024)
    self.postMessage({ progress: Math.round(((row + 1) / n) * 100) });
  }

  const durationMs = performance.now() - start;

  // Prevent the compiler from dead-code-eliminating the C array
  // by reading a single element (same pattern as GPU readback)
  const _check = C[0];
  void _check;

  self.postMessage({ durationMs });
};
