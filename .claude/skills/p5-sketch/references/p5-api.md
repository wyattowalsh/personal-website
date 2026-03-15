# p5.js v2.2.1 API Reference

API patterns and sandbox integration for the studio's p5.js environment. Global mode only.

---

## Execution Model

### Global Mode (Studio Standard)

The sandbox expects top-level functions attached to `window`:
```js
function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(0);
}
```

The sandbox injects user code as a `<script>` element, then calls `new p5()` which auto-discovers `setup()` and `draw()` on the global scope.

**Do NOT use:**
- `import` / `export` (no ES modules — code is injected via script tag)
- `new p5(function(p) { ... })` (instance mode — the sandbox handles instantiation)
- Arrow functions for `setup`/`draw` (must be `function` declarations for p5 to find them)

### Lifecycle

| Function | Called | Use |
|----------|--------|-----|
| `preload()` | Before setup, blocks until complete | Load assets (images, fonts, JSON) |
| `setup()` | Once after preload | Canvas creation, initial state |
| `draw()` | Every frame at `frameRate()` fps | Animation loop |
| `noLoop()` | Call in setup/draw | Stop draw loop (static sketches) |
| `loop()` | Resume after noLoop | Re-enable draw loop |
| `redraw()` | Trigger single draw call | Manual frame control |

---

## Drawing API

### Shapes
```js
point(x, y)
line(x1, y1, x2, y2)
rect(x, y, w, h, [cornerRadius])
ellipse(x, y, w, h)
circle(x, y, d)
arc(x, y, w, h, start, stop, [mode])
triangle(x1, y1, x2, y2, x3, y3)
quad(x1, y1, x2, y2, x3, y3, x4, y4)
```

### Curves and Vertices
```js
beginShape();
  vertex(x, y);           // straight edge
  curveVertex(x, y);      // Catmull-Rom spline (need 4+ points)
  bezierVertex(cx1, cy1, cx2, cy2, x, y);  // cubic Bezier
endShape([CLOSE]);

// Standalone curves
curve(x1, y1, x2, y2, x3, y3, x4, y4);
bezier(x1, y1, cx1, cy1, cx2, cy2, x2, y2);
```

### Contours (holes in shapes)
```js
beginShape();
  vertex(/* outer shape */);
  beginContour();
    vertex(/* inner hole, wound in opposite direction */);
  endContour();
endShape(CLOSE);
```

---

## Color API

### Color Mode
```js
colorMode(HSB, 360, 100, 100, 100);  // recommended
colorMode(RGB, 255, 255, 255, 255);   // default
```

### Setting Colors
```js
fill(h, s, b, [a]);
stroke(h, s, b, [a]);
noFill();
noStroke();
background(h, s, b, [a]);
```

### Color Operations
```js
let c1 = color(0, 100, 100);
let c2 = color(120, 100, 100);
let mixed = lerpColor(c1, c2, 0.5);  // interpolate

hue(c)          // extract hue
saturation(c)   // extract saturation
brightness(c)   // extract brightness
alpha(c)        // extract alpha
red(c), green(c), blue(c)  // RGB components
```

---

## Math API

### Noise
```js
noise(x, [y], [z])          // Perlin noise → [0, 1]
noiseDetail(octaves, falloff) // Default: 4 octaves, 0.5 falloff
noiseSeed(seed)              // Reproducible noise
```

### Mapping and Interpolation
```js
map(value, start1, stop1, start2, stop2, [withinBounds])
lerp(start, stop, amt)       // linear interpolation
constrain(value, min, max)
norm(value, start, stop)     // normalize to [0, 1]
```

### Trigonometry
```js
sin(angle), cos(angle), tan(angle)  // radians
asin(v), acos(v), atan2(y, x)
// Constants: PI, TWO_PI, HALF_PI, QUARTER_PI, TAU
```

### Vectors
```js
let v = createVector(x, y);
v.add(other), v.sub(other), v.mult(scalar), v.div(scalar)
v.mag(), v.magSq()           // magnitude (magSq avoids sqrt)
v.normalize(), v.limit(max)
v.heading(), v.setMag(len)
v.rotate(angle)
v.dist(other)
v.copy()

// Static methods
p5.Vector.add(a, b)          // returns new vector
p5.Vector.sub(a, b)
p5.Vector.fromAngle(angle)   // unit vector from angle
p5.Vector.random2D()         // random unit vector
p5.Vector.lerp(a, b, amt)
p5.Vector.dist(a, b)
```

### Random
```js
random([min], max)           // uniform random
random(array)                // random array element
randomGaussian(mean, sd)     // normal distribution
randomSeed(seed)             // reproducible random
```

### Other Math
```js
dist(x1, y1, x2, y2)
abs(n), ceil(n), floor(n), round(n)
min(a, b), max(a, b)
pow(base, exp), sqrt(n), sq(n), log(n), exp(n)
```

---

## Transform API

```js
push()              // save transform + style state
pop()               // restore

translate(x, y)     // move origin
rotate(angle)       // rotate around origin (radians)
scale(s)            // uniform scale
scale(sx, sy)       // non-uniform scale
shearX(angle)       // shear along X
shearY(angle)       // shear along Y

// Always wrap transforms in push()/pop():
push();
  translate(cx, cy);
  rotate(angle);
  rect(-w/2, -h/2, w, h);  // draw centered
pop();
```

---

## Pixel API

### Direct Pixel Access
```js
pixelDensity(1);    // MUST set in setup() for predictable pixel indexing
loadPixels();
// pixels[] is a flat array: [r, g, b, a, r, g, b, a, ...]
let i = (x + y * width) * 4;
pixels[i]     = red;
pixels[i + 1] = green;
pixels[i + 2] = blue;
pixels[i + 3] = alpha;
updatePixels();
```

### Avoid in Draw Loop
```js
get(x, y)     // SLOW — reads single pixel, returns color object
set(x, y, c)  // SLOW — writes single pixel
// Use pixels[] array for bulk operations
```

---

## Interaction API

### Mouse
```js
mouseX, mouseY           // current position
pmouseX, pmouseY         // previous frame position
mouseIsPressed           // boolean
mouseButton              // LEFT, RIGHT, CENTER

// Event handlers (declare as global functions)
function mousePressed() { }
function mouseReleased() { }
function mouseMoved() { }
function mouseDragged() { }
function mouseWheel(event) { event.delta }  // scroll amount
```

### Keyboard
```js
keyIsPressed             // boolean
key                      // last key as string
keyCode                  // numeric code (UP_ARROW, etc.)

function keyPressed() { }
function keyReleased() { }
function keyTyped() { }

// Arrow keys: UP_ARROW, DOWN_ARROW, LEFT_ARROW, RIGHT_ARROW
// Modifiers: SHIFT, CONTROL, ALT
```

### Touch (mobile)
```js
touches[]                // array of {x, y, id}
function touchStarted() { }
function touchMoved() { }
function touchEnded() { }
```

---

## Rendering

### Blend Modes
```js
blendMode(BLEND)         // default
blendMode(ADD)           // additive (bright glows)
blendMode(MULTIPLY)      // darken
blendMode(SCREEN)        // lighten
blendMode(DIFFERENCE)    // psychedelic inversions
blendMode(EXCLUSION)     // softer difference
```

### Graphics Buffers (Off-Screen)
```js
let pg = createGraphics(400, 400);
pg.background(0);
pg.fill(255);
pg.ellipse(200, 200, 100);
image(pg, 0, 0);  // draw buffer to main canvas
```
Useful for: feedback effects, compositing layers, masks.

---

## Typography
```js
textSize(size)
textAlign(CENTER, CENTER)  // horizontal, vertical
textFont('monospace')       // web-safe fonts only (no loading in sandbox)
text('string', x, y, [maxWidth, maxHeight])
textWidth('string')        // measure text width
```

---

## Sandbox-Specific Notes

### What Works
- All global-mode p5.js functions
- Multiple `function` declarations (setup, draw, mousePressed, etc.)
- Global variables
- ES6+ syntax (const, let, arrow functions, classes, destructuring, template literals)
- `console.log/warn/error/info` (captured and sent to parent)

### What Does NOT Work
- `import` / `export` / `require` — no module system
- `fetch()` / `XMLHttpRequest` — no network access from sandbox
- DOM manipulation (`document.createElement`, `querySelector`) — sandbox restricts this
- `eval()` / `new Function()` — CSP blocks dynamic code execution
- Loading external images/fonts/JSON — `preload()` won't work across origins
- `alert()` / `confirm()` / `prompt()` — blocks the sandbox
- `localStorage` / `sessionStorage` — may be restricted by sandbox policy

### Loop Protection

The sandbox injects iteration counters into every loop. After 100,000 total iterations per loop, execution throws. Design accordingly:
- Nested loops multiply: `for(400) { for(400) }` = 160,000 → will throw
- Distribute heavy computation across frames
- Use `pixelDensity(1)` to halve pixel iteration count on retina displays

### Canvas Size

Default: 400x400 at 60fps. User can configure other sizes. Always call `createCanvas()` in `setup()`. Available presets: 400x400, 800x600, 1920x1080.
