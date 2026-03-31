// ─────────────────────────────────────────────────────────────────────────────
// CPU SAXPY Web Worker  —  Y[i] = alpha * X[i] + Y[i]
//
// Linear O(N) loop over large Float32Arrays.  Reports progress every 1% of
// elements to keep the UI reactive without flooding the message channel.
//
// Message protocol:
//   IN  → { length: number }      — array length
//   OUT → { progress: number }    — 0–100, emitted every ~1% of elements
//   OUT → { durationMs: number }  — final result
// ─────────────────────────────────────────────────────────────────────────────

self.onmessage = (event: MessageEvent<{ length: number }>) => {
  const { length } = event.data;
  const alpha = 3.0;

  const X = new Float32Array(length).fill(1.5);
  const Y = new Float32Array(length).fill(2.5);

  // Emit progress every 1% — clamp to minimum 1 element gap
  const reportInterval = Math.max(1, Math.floor(length / 100));
  let nextReport = reportInterval;

  const start = performance.now();

  for (let i = 0; i < length; i++) {
    Y[i] = alpha * X[i] + Y[i];

    if (i >= nextReport) {
      self.postMessage({ progress: Math.round((i / length) * 100) });
      nextReport += reportInterval;
    }
  }

  const durationMs = performance.now() - start;

  // Prevent dead-code elimination
  const _check = Y[0];
  void _check;

  self.postMessage({ durationMs });
};
