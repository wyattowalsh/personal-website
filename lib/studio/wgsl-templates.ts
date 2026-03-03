import type { SketchTemplate } from './types'

export const wgslTemplates: SketchTemplate[] = [
  {
    id: 'wgsl-gradient',
    name: 'Gradient',
    category: 'basic',
    description: 'A simple animated gradient using a compute shader.',
    engine: 'webgpu',
    code: `struct Uniforms {
  time: f32,
  width: f32,
  height: f32,
  _pad: f32,
}

@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(1) var output: texture_storage_2d<rgba8unorm, write>;

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let dims = textureDimensions(output);
  if (id.x >= dims.x || id.y >= dims.y) { return; }
  let uv = vec2f(f32(id.x) / f32(dims.x), f32(id.y) / f32(dims.y));
  let col = vec3f(uv.x, uv.y, 0.5 + 0.5 * sin(u.time));
  textureStore(output, id.xy, vec4f(col, 1.0));
}`,
  },
  {
    id: 'wgsl-mandelbrot',
    name: 'Mandelbrot',
    category: 'generative',
    description: 'An animated Mandelbrot fractal computed on the GPU.',
    engine: 'webgpu',
    code: `struct Uniforms {
  time: f32,
  width: f32,
  height: f32,
  _pad: f32,
}

@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(1) var output: texture_storage_2d<rgba8unorm, write>;

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let dims = textureDimensions(output);
  if (id.x >= dims.x || id.y >= dims.y) { return; }
  let uv = (vec2f(f32(id.x), f32(id.y)) * 2.0 - vec2f(f32(dims.x), f32(dims.y))) / f32(dims.y);
  let zoom = 2.0 + sin(u.time * 0.2) * 1.5;
  let c = uv / zoom + vec2f(-0.5, 0.0);
  var z = vec2f(0.0);
  var iter = 0u;
  let maxIter = 128u;
  for (var i = 0u; i < maxIter; i++) {
    z = vec2f(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
    if (dot(z, z) > 4.0) { break; }
    iter++;
  }
  var col = vec3f(0.0);
  if (iter < maxIter) {
    let t = f32(iter) / f32(maxIter);
    col = 0.5 + 0.5 * cos(6.28318 * (t + vec3f(0.0, 0.33, 0.67)));
  }
  textureStore(output, id.xy, vec4f(col, 1.0));
}`,
  },
  {
    id: 'wgsl-game-of-life',
    name: 'Game of Life',
    category: 'generative',
    description: "Conway's Game of Life running as a compute shader.",
    engine: 'webgpu',
    code: `struct Uniforms {
  time: f32,
  width: f32,
  height: f32,
  frame: f32,
}

@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(1) var<storage, read> cellsIn: array<u32>;
@group(0) @binding(2) var<storage, read_write> cellsOut: array<u32>;
@group(0) @binding(3) var output: texture_storage_2d<rgba8unorm, write>;

fn cellIndex(x: u32, y: u32, w: u32, h: u32) -> u32 {
  return (y % h) * w + (x % w);
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let w = u32(u.width);
  let h = u32(u.height);
  if (id.x >= w || id.y >= h) { return; }

  var neighbors = 0u;
  for (var dy = 0u; dy < 3u; dy++) {
    for (var dx = 0u; dx < 3u; dx++) {
      if (dx == 1u && dy == 1u) { continue; }
      let nx = (id.x + dx + w - 1u) % w;
      let ny = (id.y + dy + h - 1u) % h;
      neighbors += cellsIn[cellIndex(nx, ny, w, h)];
    }
  }

  let idx = cellIndex(id.x, id.y, w, h);
  let alive = cellsIn[idx];
  var next = 0u;
  if (alive == 1u && (neighbors == 2u || neighbors == 3u)) { next = 1u; }
  if (alive == 0u && neighbors == 3u) { next = 1u; }
  cellsOut[idx] = next;

  let col = select(vec3f(0.05, 0.05, 0.1), vec3f(0.3, 0.8, 0.5), next == 1u);
  textureStore(output, id.xy, vec4f(col, 1.0));
}`,
  },
  {
    id: 'wgsl-particles',
    name: '1M Particle Sim',
    category: 'generative',
    description: 'One million particles updated via compute shader.',
    engine: 'webgpu',
    code: `struct Particle {
  pos: vec2f,
  vel: vec2f,
}

struct Uniforms {
  time: f32,
  delta: f32,
  width: f32,
  height: f32,
}

@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(1) var<storage, read_write> particles: array<Particle>;

fn hash(p: f32) -> f32 {
  return fract(sin(p * 127.1) * 43758.5453);
}

@compute @workgroup_size(256)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let idx = id.x;
  if (idx >= arrayLength(&particles)) { return; }

  var p = particles[idx];

  // Attractor at center
  let center = vec2f(u.width * 0.5, u.height * 0.5);
  let toCenter = center - p.pos;
  let dist = max(length(toCenter), 1.0);
  let force = normalize(toCenter) * (50.0 / dist);

  // Curl noise for swirl
  let angle = u.time * 0.5 + hash(f32(idx)) * 6.28;
  let curl = vec2f(cos(angle), sin(angle)) * 20.0;

  p.vel += (force + curl) * u.delta;
  p.vel *= 0.99;
  p.pos += p.vel * u.delta;

  // Wrap around
  p.pos = ((p.pos % vec2f(u.width, u.height)) + vec2f(u.width, u.height)) % vec2f(u.width, u.height);

  particles[idx] = p;
}`,
  },
  {
    id: 'wgsl-fluid',
    name: '2D Fluid',
    category: 'generative',
    description: 'Simple 2D fluid simulation using Jacobi iteration.',
    engine: 'webgpu',
    code: `struct Uniforms {
  time: f32,
  width: f32,
  height: f32,
  _pad: f32,
}

@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(1) var<storage, read> velIn: array<vec2f>;
@group(0) @binding(2) var<storage, read_write> velOut: array<vec2f>;
@group(0) @binding(3) var output: texture_storage_2d<rgba8unorm, write>;

fn idx(x: u32, y: u32) -> u32 {
  let w = u32(u.width);
  return (y % u32(u.height)) * w + (x % w);
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let w = u32(u.width);
  let h = u32(u.height);
  if (id.x >= w || id.y >= h) { return; }

  let l = velIn[idx(id.x - 1u, id.y)];
  let r = velIn[idx(id.x + 1u, id.y)];
  let t = velIn[idx(id.x, id.y - 1u)];
  let b = velIn[idx(id.x, id.y + 1u)];
  let c = velIn[idx(id.x, id.y)];

  // Diffusion
  var v = (l + r + t + b) * 0.25;

  // Add force at center
  let center = vec2f(f32(w) * 0.5, f32(h) * 0.5);
  let pos = vec2f(f32(id.x), f32(id.y));
  let d = length(pos - center);
  if (d < 20.0) {
    v += vec2f(cos(u.time * 2.0), sin(u.time * 2.0)) * 0.1;
  }

  v *= 0.999;
  velOut[idx(id.x, id.y)] = v;

  let speed = length(v);
  let col = vec3f(
    smoothstep(0.0, 0.5, speed),
    smoothstep(0.1, 0.3, speed) * 0.7,
    smoothstep(0.0, 0.1, speed)
  );
  textureStore(output, id.xy, vec4f(col, 1.0));
}`,
  },
  {
    id: 'wgsl-reaction-diffusion',
    name: 'Reaction-Diffusion',
    category: 'generative',
    description: 'Gray-Scott reaction-diffusion model on the GPU.',
    engine: 'webgpu',
    code: `struct Uniforms {
  time: f32,
  width: f32,
  height: f32,
  _pad: f32,
}

struct Cell {
  a: f32,
  b: f32,
}

@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(1) var<storage, read> gridIn: array<Cell>;
@group(0) @binding(2) var<storage, read_write> gridOut: array<Cell>;
@group(0) @binding(3) var output: texture_storage_2d<rgba8unorm, write>;

fn idx(x: u32, y: u32) -> u32 {
  let w = u32(u.width);
  return (y % u32(u.height)) * w + (x % w);
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let w = u32(u.width);
  let h = u32(u.height);
  if (id.x >= w || id.y >= h) { return; }

  let dA = 1.0;
  let dB = 0.5;
  let feed = 0.055;
  let kill = 0.062;
  let dt = 1.0;

  let c = gridIn[idx(id.x, id.y)];
  let l = gridIn[idx(id.x - 1u, id.y)];
  let r = gridIn[idx(id.x + 1u, id.y)];
  let t = gridIn[idx(id.x, id.y - 1u)];
  let b = gridIn[idx(id.x, id.y + 1u)];

  let lapA = l.a + r.a + t.a + b.a - 4.0 * c.a;
  let lapB = l.b + r.b + t.b + b.b - 4.0 * c.b;
  let abb = c.a * c.b * c.b;

  var newA = c.a + (dA * lapA - abb + feed * (1.0 - c.a)) * dt;
  var newB = c.b + (dB * lapB + abb - (kill + feed) * c.b) * dt;
  newA = clamp(newA, 0.0, 1.0);
  newB = clamp(newB, 0.0, 1.0);
  gridOut[idx(id.x, id.y)] = Cell(newA, newB);

  let col = vec3f(
    1.0 - newA,
    1.0 - newA - newB,
    newB
  );
  textureStore(output, id.xy, vec4f(clamp(col, vec3f(0.0), vec3f(1.0)), 1.0));
}`,
  },
]
