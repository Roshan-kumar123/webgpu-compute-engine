# 🚀 WebGPU vs CPU Compute Arena

[![Live Demo](https://img.shields.io/badge/Live_Demo-Play_Now-000000?style=for-the-badge&logo=vercel)](YOUR_LIVE_VERCEL_LINK_HERE)

An enterprise-grade, browser-native parallel computing benchmark. This application visually demonstrates the raw architectural power of WebGPU's massively parallel execution model versus single-threaded CPU computation—the exact foundational technology that powers local AI model inference in the browser.

## ✨ Features

- **Bare-Metal GPU Access:** Custom `WGSL` (WebGPU Shading Language) compute shaders execute massive mathematical workloads directly on the user's graphics card.
- **Off-Main-Thread Architecture:** CPU baselines are executed inside dedicated Web Workers, ensuring the React UI remains buttery smooth at 60fps even during billion-operation mathematical loops.
- **Asynchronous State Management:** Utilizes a custom functional-update `Zustand` store to perfectly handle race conditions when the GPU and CPU compute concurrently.
- **Live Telemetry:** Features real-time Web Worker progress tracking, interactive Recharts data visualization, and an intelligent gracefully-degrading fallback for unsupported browsers.

---

## 🧠 Under the Hood: The Benchmarks

This application tests two fundamentally different hardware bottlenecks using classic computer science algorithms:

### 1. Matrix Multiplication (MatMul) - The Compute Test

Matrix Multiplication is the mathematical heartbeat of modern Artificial Intelligence and Neural Networks. It is a strictly **compute-bound** operation (O(N³)).

- **The Result:** At maximum complexity (N=1024), the CPU must loop through over 1 Billion calculations, taking several seconds. The WebGPU implementation uses highly optimized `var<workgroup>` shared memory tiling to crush the same math in milliseconds, regularly achieving **50x to 100x speedups**.

### 2. SAXPY - The Memory Bandwidth Test

SAXPY (Single-Precision A·X + Y) is a fundamental Level 1 BLAS operation. It is a strictly **memory-bound** operation (O(N)).

- **The Result:** The math here is trivial. This benchmark actually tests how fast the system can fetch massive arrays (up to 50 Million floats) from RAM, push them to the processor, and write them back. At lower sizes, the CPU often wins because the overhead of transferring data across the PCIe bus to the GPU outweighs the compute time!

---

## 🎮 How to Use the App

1. **Select an Operation:** Choose between MatMul (Heavy Compute) or SAXPY (Heavy Memory).
2. **Set the Load:** Use the complexity slider to select a dataset size (Light, Medium, or Heavy).
3. **Run CPU Baseline:** Click `RUN CPU`. Watch the progress bar as the Web Worker calculates the math off the main thread.
4. **Run WebGPU:** Click `RUN GPU` to execute the exact same math natively on your graphics card.
5. **Race Both:** Click `RACE BOTH` to trigger both pipelines concurrently. The dashboard will automatically calculate the speedup multiplier and render the results on the live Recharts dashboard.

---

## 🛠️ Local Development

Ensure you are using a modern browser with WebGPU support (Chrome 113+ or Edge 113+).

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
