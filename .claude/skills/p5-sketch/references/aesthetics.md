# Aesthetics Guide

Visual design principles for generative art. This file is the key to producing refined, distinctive output instead of cookie-cutter demos.

---

## Color Theory for Generative Art

### Always Use HSB

`colorMode(HSB, 360, 100, 100, 100)` — Hue/Saturation/Brightness is the native language of generative color. RGB is for computers, HSB is for artists.

### Palette Strategies

| Strategy | How | When |
|----------|-----|------|
| **Analogous** | Hue range of 30-60° (e.g., 180-240 = teals to blues) | Harmonious, calm compositions |
| **Complementary** | Two hues 180° apart, one dominant | High contrast, vibrant energy |
| **Split-Complementary** | Base hue + two hues adjacent to its complement | Rich contrast without harshness |
| **Triadic** | Three hues 120° apart | Balanced, colorful, playful |
| **Monochromatic + Accent** | Single hue varying S/B + one pop of distant hue | Sophisticated, focused |
| **Temperature Gradient** | Map value to warm→cool (0→hue 30, 1→hue 220) | Data-driven, natural feel |

### Noise-Mapped Color

Map noise output to hue for organic color variation:
```js
let h = map(noise(x * 0.01, y * 0.01, t), 0, 1, HUE_MIN, HUE_MAX);
fill(h, 80, 90, 30);
```
Constrain the hue range (30-90° span) to maintain palette cohesion.

### Temporal Color Evolution

Shift the palette over time for visual depth:
```js
let baseHue = (frameCount * 0.1) % 360;  // glacial drift
let h = baseHue + noise(i * 0.1) * 60;    // per-element variation
```

### Curated Palette Arrays

For maximum control, define explicit palettes:
```js
const PALETTE = ['#264653', '#2A9D8F', '#E9C46A', '#F4A261', '#E76F51'];
// Index by: hash, noise, modulo, or random selection
let c = color(PALETTE[floor(random(PALETTE.length))]);
```

---

## Composition

### Visual Hierarchy

Not everything should have equal visual weight. Create hierarchy through:
- **Size variation** — Larger elements draw the eye first
- **Density gradients** — Cluster elements in focal areas, sparse elsewhere
- **Contrast** — Bright against dark, saturated against muted
- **Motion** — Moving elements attract attention over static ones

### Structured Placement (Beyond Random Scatter)

| Pattern | Technique |
|---------|-----------|
| **Grid with perturbation** | Regular grid + noise displacement |
| **Poisson disk sampling** | Minimum-distance-guaranteed random placement |
| **Spiral** | Golden angle (137.5°) spacing for natural distribution |
| **Attraction basins** | Particles cluster around seed points |
| **Edge density** | More activity near edges, calm center (or inverse) |
| **Flow-guided** | Elements placed along flow field streamlines |

### Negative Space

Leave breathing room. Not every pixel needs content. Negative space creates contrast and directs focus. Use `map()` with a falloff function to fade element density toward edges or away from focal points.

### Margin and Framing

A subtle margin (5-10% of canvas) around the active area creates a "gallery frame" effect. This simple technique immediately elevates perceived quality.

---

## Motion Design

### Easing and Dynamics

Never use constant velocity. Natural motion has:
- **Acceleration** — Objects speed up gradually
- **Deceleration** — Objects slow before stopping
- **Overshoot** — Objects pass target and bounce back
- **Dampening** — Oscillations decay over time (`vel.mult(0.98)`)

```js
// Smooth approach (exponential easing)
x = lerp(x, targetX, 0.05);

// Spring dynamics
let force = (target - pos) * stiffness;
vel += force;
vel *= dampening; // 0.9-0.99
pos += vel;
```

### Multiple Time Scales

Layer motion at different speeds for visual depth:

| Scale | Speed | Controls |
|-------|-------|----------|
| **Fast** | Every frame | Individual particle position |
| **Medium** | ~1-5 seconds | Color shifts, shape morphing |
| **Slow** | ~10-30 seconds | Flow field direction, attractor params |
| **Glacial** | ~1-5 minutes | Overall palette drift, mode transitions |

```js
let fast = frameCount * 0.05;
let medium = frameCount * 0.005;
let slow = frameCount * 0.0005;
```

### Rhythm and Pulse

Use `sin(frameCount * speed)` modulated by noise for organic rhythm:
```js
let pulse = 0.5 + 0.5 * sin(frameCount * 0.02 + noise(i) * TWO_PI);
let size = map(pulse, 0, 1, MIN_SIZE, MAX_SIZE);
```

---

## Layering and Depth

### The Feedback Trail Pattern

The most common generative art technique — don't clear the canvas fully:
```js
// Instead of background(0):
fill(0, 0, 0, 10);  // very low alpha
rect(0, 0, width, height);
```
**Variations beyond flat fade:**
- Tinted fade: `fill(0, 0, 20, 8)` — leaves a warm afterglow
- Directional fade: translate slightly before fading for motion blur
- Selective fade: Only fade certain regions using a mask

### Alpha Compositing

Layer translucent elements for depth:
- Background layer: full opacity, slow-moving, large shapes
- Mid layer: 40-60% opacity, medium motion
- Foreground: 10-30% opacity, fast, small, detailed

### Z-Ordering Through Draw Order

Draw back-to-front. Sort elements by a depth value (could be noise-based) and render in order.

---

## Texture and Materiality

### Stippling

Replace filled shapes with scattered dots:
```js
function stipple(cx, cy, radius, density) {
  for (let i = 0; i < density; i++) {
    let a = random(TWO_PI);
    let r = radius * sqrt(random()); // uniform disk
    point(cx + r * cos(a), cy + r * sin(a));
  }
}
```

### Hatching

Parallel lines with varying density for shading:
```js
function hatch(x, y, w, h, angle, spacing) {
  push();
  translate(x + w/2, y + h/2);
  rotate(angle);
  for (let i = -max(w,h); i < max(w,h); i += spacing) {
    line(i, -max(w,h), i, max(w,h));
  }
  pop();
}
```

### Grain and Noise Texture

Add organic imperfection:
```js
// Apply after main drawing
loadPixels();
for (let i = 0; i < pixels.length; i += 4) {
  let grain = random(-15, 15);
  pixels[i] += grain;
  pixels[i+1] += grain;
  pixels[i+2] += grain;
}
updatePixels();
```
**Note:** Pixel-level operations are expensive. Apply grain only on static frames or every Nth frame.

---

## Anti-Pattern Gallery

The 15 most common AI generative art clichés — and how to escape them.

| # | Cliché | Why It's Generic | Escape Route |
|---|--------|-----------------|--------------|
| 1 | Random RGB circles on black | Zero design intent | Intentional palette + structured placement |
| 2 | Single sine wave | Tutorial-level | Layer 3+ frequencies with phase offsets |
| 3 | Centered radial symmetry | Easiest possible composition | Off-center focal point + asymmetric perturbation |
| 4 | Particle explosion on click | Every demo ever | Particles that form structures, not scatter |
| 5 | Rainbow gradient (`map(x, 0, width, 0, 360)`) | Obvious, no restraint | Constrained hue range with saturation variation |
| 6 | Grid of identical shapes | No variation | Per-cell noise displacement + size/color variation |
| 7 | Basic bouncing ball | Pong, 1972 | Multiple bodies with gravitational interaction |
| 8 | White particles on black | No color thought | Even monochrome needs tonal variation |
| 9 | `random()` for everything | No coherence | Use `noise()` for spatial/temporal coherence |
| 10 | Flat shapes, no depth | Feels like clip art | Alpha layering + size gradient + blur simulation |
| 11 | Constant speed, constant size | Mechanical, lifeless | Easing, acceleration, size oscillation |
| 12 | No interaction or bad interaction | Mouse as decoration | Mouse affects system dynamics, not just position |
| 13 | Frame-1 = Frame-10000 | No evolution | Parameter drift, phase transitions, accumulation |
| 14 | Over-saturated everything | Visual fatigue | Mix saturated accents with muted base |
| 15 | Ignoring canvas edges | Elements just vanish | Wrap, bounce with dampening, or edge avoidance |

For each: **ask "what would a human artist do differently?"** — then do that.
