# Performance Guide

Sandbox constraints, frame budgets, and optimization patterns for the studio's p5.js environment.

---

## Sandbox Constraints

| Constraint | Value | Source |
|------------|-------|--------|
| Loop iteration limit | 100,000 per loop | `STUDIO_LOOP_LIMIT` |
| Watchdog timeout | 5,000ms | `STUDIO_WATCHDOG_TIMEOUT_MS` |
| Heartbeat interval | 2,000ms | `STUDIO_HEARTBEAT_INTERVAL_MS` |
| Max code size | 100,000 bytes (100KB) | `STUDIO_MAX_CODE_SIZE` |
| Default canvas | 400 x 400 px | `STUDIO_DEFAULT_CONFIG` |
| Default FPS | 60 | `STUDIO_DEFAULT_CONFIG` |
| Default pixel density | 1 | `STUDIO_DEFAULT_CONFIG` |
| Canvas presets | 400x400, 800x600, 1920x1080 | `STUDIO_CANVAS_PRESETS` |

---

## Frame Budget

At 60fps, each frame has **~16.6ms** of CPU time. Exceeding this causes frame drops.

### Iteration Budget per Frame

The loop guard counts iterations across the *entire frame*, including all nested loops.

| Pattern | Iterations | Safe? |
|---------|-----------|-------|
| Single loop, 400 items | 400 | Yes |
| Nested loop, 20 x 20 | 400 | Yes |
| Nested loop, 100 x 100 | 10,000 | Yes |
| Particle system, 500 particles | 500 | Yes |
| Pixel loop, 400x400 | 160,000 | **No** — exceeds 100K |
| Pixel loop, 200x200 | 40,000 | Yes |
| Particle + neighbor check, 200 x 200 | 40,000 | Marginal |

### Safe Design Target

**Stay under 50,000 iterations per frame** — this provides a 2x safety margin against the 100K limit and leaves headroom for p5.js internal loops.

---

## Particle Count Guidelines

For a 400x400 canvas at 60fps:

| Particle Type | Safe Count | Notes |
|---------------|-----------|-------|
| Points (`point()`) | 1,000-2,000 | Minimal per-particle computation |
| Circles (`ellipse()`) | 500-1,000 | Simple fill + stroke |
| Physics (pos + vel + acc) | 200-500 | Euler integration per particle |
| Physics + neighbor query | 100-200 | O(n²) without spatial hashing |
| Complex render (vertex shapes) | 50-100 | Multiple draw calls per particle |
| Boids (3-rule flocking) | 80-150 | Each checks all others by default |

### Scaling Particles

If you need more particles:
1. Use spatial hashing to reduce neighbor queries from O(n²) to ~O(n)
2. Skip physics on off-screen particles
3. Use `point()` instead of `ellipse()` for distant/small particles
4. Process physics in batches across frames

---

## Memory Patterns

### Bounded Arrays (Mandatory for `draw()`)

Any array that grows per frame MUST have a cap:
```js
const MAX_TRAIL = 200;
trail.push(createVector(x, y));
if (trail.length > MAX_TRAIL) trail.shift();
```

Or use a circular buffer for better performance:
```js
const BUF_SIZE = 200;
let buf = new Array(BUF_SIZE);
let head = 0;

function addPoint(x, y) {
  buf[head] = { x, y };
  head = (head + 1) % BUF_SIZE;
}
```

### Object Pooling

Pre-allocate particles and recycle dead ones:
```js
const POOL_SIZE = 500;
let pool = Array.from({ length: POOL_SIZE }, () => new Particle());
let activeCount = 0;

function spawn() {
  if (activeCount < POOL_SIZE) {
    pool[activeCount].reset(mouseX, mouseY);
    activeCount++;
  }
}

function removeAt(i) {
  [pool[i], pool[activeCount - 1]] = [pool[activeCount - 1], pool[i]];
  activeCount--;
}
```

### Typed Arrays for Heavy Computation

For pixel manipulation or large numeric buffers:
```js
let data = new Float32Array(width * height);
// 4x more memory efficient than regular arrays for numbers
// Faster iteration in tight loops
```

---

## Common Performance Killers

| Problem | Why It's Slow | Fix |
|---------|--------------|-----|
| `get(x, y)` in nested loop | Creates color object per pixel | Use `pixels[]` array |
| `text()` every frame | Font rendering is expensive | Cache text in `createGraphics()` |
| `Array.push()` without cap | Unbounded growth → GC pauses → crash | Circular buffer or `.shift()` with max |
| Deep `push()`/`pop()` nesting | Stack operations add up | Flatten transform hierarchy |
| String concatenation in `draw()` | Creates garbage every frame | Pre-compute strings in `setup()` |
| `color()` in inner loops | Object allocation per call | Cache color objects |
| Excessive transparency layers | Each layer requires compositing | Limit to 3-4 translucent layers |
| `createVector()` in inner loop | GC pressure from many short-lived objects | Reuse vectors with `.set()` |
| Large `strokeWeight()` on many shapes | Thick strokes are expensive to render | Use `noStroke()` when possible |
| `filter(BLUR)` | Full-canvas convolution | Fake blur with alpha feedback |

---

## Distributed Computation

For operations that exceed the frame budget, spread work across frames:

```js
let currentRow = 0;
const ROWS_PER_FRAME = 10;

function draw() {
  for (let y = currentRow; y < min(currentRow + ROWS_PER_FRAME, height); y++) {
    for (let x = 0; x < width; x++) {
      // heavy per-pixel computation
    }
  }
  currentRow += ROWS_PER_FRAME;
  if (currentRow >= height) currentRow = 0; // loop or noLoop()
}
```

This keeps each frame well under the loop budget while progressively building the image.

---

## Profiling in the Studio

The studio console captures `console.log()` output. Use frame timing to identify bottlenecks:
```js
function draw() {
  let t0 = millis();
  // ... sketch code ...
  let elapsed = millis() - t0;
  if (elapsed > 16) console.warn('Frame budget exceeded:', elapsed.toFixed(1) + 'ms');
}
```

Check `frameRate()` periodically:
```js
if (frameCount % 60 === 0) console.log('FPS:', frameRate().toFixed(1));
```
