# Generative Art Algorithms

Algorithm catalog for p5.js v2.2.1 global mode. Each section includes the core concept, key parameters, and a minimal code pattern.

---

## Noise-Based Systems

### Perlin Noise Fundamentals

`noise(x, y, z)` returns smooth pseudo-random values in [0, 1]. Control character via `noiseDetail(octaves, falloff)`.

**1D noise — organic motion:**
```js
let x = noise(frameCount * 0.01) * width;
```

**2D noise — terrain / texture:**
```js
for (let x = 0; x < width; x += STEP) {
  for (let y = 0; y < height; y += STEP) {
    let v = noise(x * SCALE, y * SCALE);
    // map v to color, size, or displacement
  }
}
```

**3D noise — animated fields:**
Add `frameCount * speed` as the z-dimension to animate 2D fields smoothly.

**4D noise (simulated):** Use `noise(x, y, cos(t), sin(t))` for seamlessly looping animations.

### Fractal Brownian Motion (fBm)

Layer multiple noise octaves for natural-looking complexity:
```js
function fbm(x, y, octaves, lacunarity, gain) {
  let value = 0, amplitude = 1, frequency = 1, total = 0;
  for (let i = 0; i < octaves; i++) {
    value += amplitude * noise(x * frequency, y * frequency);
    total += amplitude;
    amplitude *= gain;    // typically 0.5
    frequency *= lacunarity; // typically 2.0
  }
  return value / total;
}
```

### Domain Warping

Feed noise into itself for organic, fluid distortions:
```js
let qx = fbm(x, y, 4, 2, 0.5);
let qy = fbm(x + 5.2, y + 1.3, 4, 2, 0.5);
let v = fbm(x + 4 * qx, y + 4 * qy, 4, 2, 0.5);
```
Stack 2-3 warping layers for increasingly alien patterns.

### Curl Noise

Divergence-free noise for fluid-like motion. Derive velocity from the curl of a noise potential:
```js
function curlNoise(x, y, eps) {
  let dx = (noise(x, y + eps) - noise(x, y - eps)) / (2 * eps);
  let dy = (noise(x + eps, y) - noise(x - eps, y)) / (2 * eps);
  return createVector(dx, -dy); // perpendicular = incompressible
}
```

### Flow Fields

Grid of direction vectors that particles follow:
```js
// Build field
let cols = floor(width / CELL);
let rows = floor(height / CELL);
let field = new Array(cols * rows);

function updateField() {
  let zoff = frameCount * 0.003;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let angle = noise(x * 0.1, y * 0.1, zoff) * TWO_PI * 2;
      field[x + y * cols] = p5.Vector.fromAngle(angle);
    }
  }
}

// Follow field
function followField(pos, vel) {
  let col = floor(pos.x / CELL);
  let row = floor(pos.y / CELL);
  let desired = field[col + row * cols];
  vel.add(desired.copy().mult(0.1));
  vel.limit(MAX_SPEED);
}
```

---

## Particle Systems

### Euler Integration (Simple)
```js
class Particle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(1, 3));
    this.acc = createVector(0, 0);
    this.life = 255;
  }
  applyForce(f) { this.acc.add(f); }
  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.life -= 2;
  }
}
```

### Verlet Integration (Stable physics)

Better for constraints (springs, cloth, chains):
```js
// Store previous position instead of velocity
update() {
  let temp = this.pos.copy();
  let vel = p5.Vector.sub(this.pos, this.prev);
  this.pos.add(vel);
  this.pos.add(this.acc);
  this.prev = temp;
  this.acc.mult(0);
}
```

### Boids Flocking

Three rules create emergent swarm behavior:
```js
function flock(boid, others, perception) {
  let sep = createVector(), ali = createVector(), coh = createVector();
  let count = 0;
  for (let other of others) {
    let d = dist(boid.pos.x, boid.pos.y, other.pos.x, other.pos.y);
    if (d > 0 && d < perception) {
      // Separation: steer away from neighbors
      let diff = p5.Vector.sub(boid.pos, other.pos).div(d * d);
      sep.add(diff);
      // Alignment: match heading
      ali.add(other.vel);
      // Cohesion: steer toward center
      coh.add(other.pos);
      count++;
    }
  }
  if (count > 0) {
    sep.div(count); ali.div(count); coh.div(count);
    coh.sub(boid.pos); // steer toward center of mass
  }
  // Weight and apply
  boid.acc.add(sep.mult(1.5));
  boid.acc.add(ali.mult(1.0));
  boid.acc.add(coh.mult(1.0));
}
```

---

## Fractals and Recursion

### L-Systems

Grammar-based growth:
```js
let axiom = 'F';
let rules = { 'F': 'FF+[+F-F-F]-[-F+F+F]' };

function generate(str, iterations) {
  for (let i = 0; i < iterations; i++) {
    let next = '';
    for (let ch of str) next += rules[ch] || ch;
    str = next;
  }
  return str;
}

function renderLSystem(str, len, angle) {
  for (let ch of str) {
    if (ch === 'F') { line(0, 0, 0, -len); translate(0, -len); }
    else if (ch === '+') rotate(angle);
    else if (ch === '-') rotate(-angle);
    else if (ch === '[') push();
    else if (ch === ']') pop();
  }
}
```
Keep iterations ≤5 to stay within loop budget.

### Recursive Subdivision

Split space into irregular regions:
```js
function subdivide(x, y, w, h, depth) {
  if (depth <= 0 || w * h < MIN_AREA) {
    rect(x, y, w, h);
    return;
  }
  if (w > h) {
    let split = w * random(0.3, 0.7);
    subdivide(x, y, split, h, depth - 1);
    subdivide(x + split, y, w - split, h, depth - 1);
  } else {
    let split = h * random(0.3, 0.7);
    subdivide(x, y, w, split, depth - 1);
    subdivide(x, y + split, w, h - split, depth - 1);
  }
}
```

---

## Cellular Automata

### 2D Cellular Automata Pattern
```js
let grid, next;
const CELL = 4;
let cols, rows;

function setup() {
  createCanvas(400, 400);
  cols = floor(width / CELL);
  rows = floor(height / CELL);
  grid = Array.from({ length: cols }, () =>
    Array.from({ length: rows }, () => random() > 0.5 ? 1 : 0)
  );
  next = Array.from({ length: cols }, () => new Array(rows).fill(0));
}

function step() {
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      let neighbors = countNeighbors(x, y);
      // Apply rules here (GoL, custom, etc.)
      next[x][y] = applyRule(grid[x][y], neighbors);
    }
  }
  [grid, next] = [next, grid]; // swap buffers
}
```

### Continuous CA

Use float values [0, 1] instead of binary states. Average neighbors with weighted kernels. Produces organic, lava-lamp-like evolution.

### Multi-State Systems

3+ states with transition rules create richer patterns: rock-paper-scissors dynamics, predator-prey, or cyclic automata.

---

## Reaction-Diffusion

### Gray-Scott Model
```js
// Two chemicals A and B on a grid
// dA/dt = Da * laplacian(A) - A*B*B + f*(1-A)
// dB/dt = Db * laplacian(B) + A*B*B - (k+f)*B
// Interesting regions: f ∈ [0.01, 0.06], k ∈ [0.045, 0.07]
// Da = 1.0, Db = 0.5 (B diffuses slower)
```
Use two Float32Arrays for each chemical. Compute Laplacian with 3x3 convolution. Process a band of rows per frame to stay within loop budget.

---

## Strange Attractors

### Clifford Attractor
```js
// x' = sin(a*y) + c*cos(a*x)
// y' = sin(b*x) + d*cos(b*y)
// Good params: a=-1.4, b=1.6, c=1.0, d=0.7
function clifford(x, y, a, b, c, d) {
  return {
    x: sin(a * y) + c * cos(a * x),
    y: sin(b * x) + d * cos(b * y)
  };
}
```

### De Jong Attractor
```js
// x' = sin(a*y) - cos(b*x)
// y' = sin(c*x) - cos(d*y)
```

### Lorenz System
```js
// dx = sigma * (y - x)
// dy = x * (rho - z) - y
// dz = x * y - beta * z
// Classic: sigma=10, rho=28, beta=8/3
```

Render by accumulating points into a density map (2D array), then mapping density to color. Iterate 100-500 points per frame to build up gradually.

---

## Trigonometric and Parametric

### Lissajous Curves
```js
let x = A * sin(a * t + delta);
let y = B * sin(b * t);
// a:b ratio determines the pattern. Irrational ratios → never-closing curves
```

### Rose Curves
```js
let r = cos(k * theta);
// k integer → k or 2k petals. k rational → complex rosettes
```

### Harmonograph (Damped Pendulum)
```js
function harmonograph(t, f1, f2, p1, p2, d1, d2) {
  let x = sin(f1 * t + p1) * exp(-d1 * t);
  let y = sin(f2 * t + p2) * exp(-d2 * t);
  return { x, y };
}
```

### Fourier Series Drawing
Approximate any closed curve by summing rotating circles (epicycles). Pre-compute coefficients from a path, then animate the sum.

---

## Physics Simulation

### Spring Systems
```js
function springForce(anchor, pos, restLength, k) {
  let dir = p5.Vector.sub(anchor, pos);
  let stretch = dir.mag() - restLength;
  dir.normalize();
  return dir.mult(k * stretch);
}
```

### Soft Body / Cloth
Connect particles in a grid with springs. Use Verlet integration with multiple constraint-satisfaction passes per frame (2-3 passes is enough).

---

## Pixel Manipulation

### Direct Pixel Access Pattern
```js
loadPixels();
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    let i = (x + y * width) * 4;
    pixels[i] = r;     // red
    pixels[i+1] = g;   // green
    pixels[i+2] = b;   // blue
    pixels[i+3] = 255; // alpha
  }
}
updatePixels();
```
**Performance:** Always use `pixelDensity(1)` in setup. The nested loop on 400x400 = 160,000 iterations — close to the loop budget. Process a stripe per frame for larger canvases.

### Feedback Loops
Draw to canvas, read it back, transform, draw again. Creates trails, echoes, ghosting. Combine with slight translation/rotation for hypnotic drifting effects.

---

## Voronoi and Spatial Partitioning

### Brute-Force Voronoi
```js
// For each pixel, find nearest seed point
// Color by distance or seed identity
// Use squared distance (skip sqrt) for speed
```
Pre-compute for static layouts; animate by moving seed points with noise.

### Spatial Hashing
Divide space into cells, assign particles to cells, only check neighbors in adjacent cells. Reduces O(n²) to ~O(n) for proximity queries.
