// ─────────────────────────────────────────────────────────────────────────────
// Tiled Matrix Multiplication — C = A × B  (square matrices, N×N f32)
//
// Algorithm: classic tiled / blocked matmul using shared workgroup memory.
// Each workgroup computes one TILE_SIZE×TILE_SIZE output tile of C by
// iterating over K/TILE_SIZE tiles of the A row and B column, accumulating
// partial dot products in registers.  The workgroup tile of A and B is loaded
// into fast on-chip `var<workgroup>` memory (analogous to GPU shared memory /
// L1 scratch-pad) to avoid redundant global memory reads.
//
// Workgroup size: 16×16 = 256 threads  (fits within the 256-invocation limit
// required by the WebGPU spec minimum, and is a good tile size for most GPUs).
// ─────────────────────────────────────────────────────────────────────────────

const TILE: u32 = 16u;

// ── Bindings ─────────────────────────────────────────────────────────────────

struct Uniforms {
  dim: u32,   // N  (matrices are N×N)
}

@group(0) @binding(0) var<storage, read>       matA     : array<f32>;
@group(0) @binding(1) var<storage, read>       matB     : array<f32>;
@group(0) @binding(2) var<storage, read_write> matC     : array<f32>;
@group(0) @binding(3) var<uniform>             uniforms : Uniforms;

// ── Workgroup shared tiles ────────────────────────────────────────────────────

var<workgroup> tileA: array<array<f32, TILE>, TILE>;  // [row][col]
var<workgroup> tileB: array<array<f32, TILE>, TILE>;

// ── Entry point ───────────────────────────────────────────────────────────────

@compute @workgroup_size(TILE, TILE)
fn main(
  @builtin(global_invocation_id)   gid  : vec3<u32>,
  @builtin(local_invocation_id)    lid  : vec3<u32>,
  @builtin(workgroup_id)           wgid : vec3<u32>,
) {
  let N    = uniforms.dim;
  let row  = gid.y;   // global output row
  let col  = gid.x;   // global output col
  let lRow = lid.y;   // local row within tile
  let lCol = lid.x;   // local col within tile

  var acc: f32 = 0.0;

  // Number of tile iterations along the K (inner) dimension
  let numTiles = (N + TILE - 1u) / TILE;

  for (var t: u32 = 0u; t < numTiles; t++) {
    // ── Load tile of A ───────────────────────────────────────────────────────
    // Each thread loads one element: A[row, t*TILE + lCol]
    let aCol = t * TILE + lCol;
    if (row < N && aCol < N) {
      tileA[lRow][lCol] = matA[row * N + aCol];
    } else {
      tileA[lRow][lCol] = 0.0;
    }

    // ── Load tile of B ───────────────────────────────────────────────────────
    // Each thread loads one element: B[t*TILE + lRow, col]
    let bRow = t * TILE + lRow;
    if (bRow < N && col < N) {
      tileB[lRow][lCol] = matB[bRow * N + col];
    } else {
      tileB[lRow][lCol] = 0.0;
    }

    // ── Synchronise: ensure all threads finished loading before computing ────
    workgroupBarrier();

    // ── Compute partial dot product for this tile ────────────────────────────
    for (var k: u32 = 0u; k < TILE; k++) {
      acc += tileA[lRow][k] * tileB[k][lCol];
    }

    // ── Synchronise before loading the next tile ─────────────────────────────
    workgroupBarrier();
  }

  // Write result — guard against out-of-bounds threads on non-TILE-multiple N
  if (row < N && col < N) {
    matC[row * N + col] = acc;
  }
}
