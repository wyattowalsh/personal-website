---
name: p5-sketch
description: >-
  Generate, refine, critique, and explain p5.js v2.2.1 sketches for a sandboxed
  generative art studio. Six modes: create complete sketches from natural language
  descriptions, refine existing code, generate variations, critique visual quality,
  explain techniques, and fix errors. Encodes generative art algorithms (noise fields,
  particle systems, fractals, attractors, cellular automata, reaction-diffusion),
  performance constraints (100K loop limit, 5s watchdog), and anti-slop aesthetic rules
  that prevent cookie-cutter output. Use when creating, editing, optimizing, or analyzing
  p5.js sketches for the studio. NOT for GLSL shaders, WGSL compute shaders, general
  JavaScript, React components, or non-p5 canvas code.
argument-hint: "<mode> [description or code]"
model: opus
license: MIT
metadata:
  author: wyattowalsh
  version: "1.0.0"
---

# p5-sketch

Generate refined, creative p5.js sketches for the studio's sandboxed environment. Every sketch must be genuinely interesting — not a tutorial demo.

**Scope:** p5.js v2.2.1 global mode only. The studio sandbox loads p5 via CDN and executes code in an isolated iframe with loop protection and a watchdog timer.

## Dispatch

| $ARGUMENTS | Mode | Example |
|------------|------|---------|
| Natural language visual description | **Create** | `a swarm of fireflies in a dark forest` |
| `create <description>` / `new <description>` | **Create** | `create perlin flow field with HSB color mapping` |
| `refine` / `improve` / `enhance` / `polish` | **Refine** | `refine` (with code in context) |
| `variations [N]` / `vary` / `alternate` | **Variations** | `variations 5` |
| `critique` / `review` / `analyze` | **Critique** | `critique` (with code in context) |
| `explain` / `teach` / `how does this work` | **Explain** | `explain` (with code in context) |
| `fix` + error message or code | **Fix** | `fix "Cannot read property of undefined"` |
| Code block (no mode keyword) | Auto-detect | Ask: refine, critique, or explain? |
| `shader` / `GLSL` / `WGSL` / `WebGPU` | **Refuse** | Redirect to appropriate engine |
| Empty | **Gallery** | Mode menu + example prompts |

### Auto-Detection Heuristic

1. Contains `function setup()` or `function draw()` without mode keyword → ask: "Refine, critique, or explain?"
2. Contains error text ("Error", "undefined", "is not a function", line numbers) → **Fix**
3. Contains modification verb (improve, enhance, polish, optimize, add, change) + code → **Refine**
4. Contains question word (how, why, what does) + code → **Explain**
5. Contains "variation", "alternate", "different version" → **Variations**
6. Pure visual description (no code, no keyword) → **Create**
7. "shader", "GLSL", "WGSL", "WebGPU", "fragment" → refuse, redirect
8. Ambiguous → ask the user

## Gallery (Empty Arguments)

Present the mode menu and three inspiring prompts:

> **Modes:** `create` · `refine` · `variations` · `critique` · `explain` · `fix`
>
> **Try:**
> - `bioluminescent deep-sea organisms pulsing in synchronized waves`
> - `wind erosion carving sand dunes, viewed from above with shifting light`
> - `synaptic cascade across a neural network, signals branching and fading`

---

## Mode: Create

Generate a complete, original p5.js sketch from a natural language description.

**Load:** `references/algorithms.md`, `references/aesthetics.md`, `references/p5-api.md`

**Workflow:**

1. **Parse intent** — Extract: visual concept, interaction model (passive/mouse/keyboard/none), complexity level, aesthetic direction. If ambiguous, ask one clarifying question.

2. **Select algorithmic foundation** — Choose the technique(s) that best serve the artistic intent from the algorithms reference. Never default to the simplest approach. If a user says "particles", consider flocking, curl noise, or attractor-based motion — not just random dots.

3. **Design composition** — Before writing code, decide:
   - Color strategy (palette, mapping, evolution)
   - Spatial layout (structured vs organic vs hybrid)
   - Motion dynamics (time scales, easing, feedback)
   - Layering (background treatment, depth, trails)

4. **Implement** — Write complete p5.js global-mode code:
   - `function setup()` with `createCanvas(400, 400)` (unless user specifies size)
   - `function draw()` (or `noLoop()` for static)
   - Named constants at top, no magic numbers
   - Variables named for purpose (`flowAngle`, not `a`)
   - Comments only for non-obvious algorithmic choices

5. **Run Originality Check** — Before outputting, answer these five questions. If any answer is "yes", modify the sketch:
   - Does it match any of the 10 built-in templates? → Add a differentiating element
   - Does it use only one generative technique? → Layer a second
   - Is the color scheme random RGB, single-hue, or just black-and-white? → Design an intentional palette
   - Is the only animation a single variable incrementing? → Add a second time scale
   - Would frame 100 look identical to frame 10,000? → Add temporal evolution

6. **Output** — Complete JavaScript code block. Optionally include a 1-2 sentence description of the visual result.

---

## Mode: Refine

Improve existing p5.js code — make it more visually sophisticated, performant, or interactive.

**Load:** `references/p5-api.md`, `references/performance.md`

**Workflow:**

1. **Analyze** — Identify what the sketch does, what techniques it uses, and where it falls short (visual quality, performance, interactivity, code quality, sandbox safety).

2. **Propose** — Present 2-4 specific improvements ranked by visual impact. **Wait for user approval before implementing.**
   - Each proposal: one sentence description + expected visual effect
   - Flag any changes that alter the sketch's fundamental character

3. **Implement** — Apply approved improvements surgically. Keep the sketch's identity intact. Do not rewrite from scratch unless explicitly asked.

4. **Verify** — Confirm: loop budget safe, no unbounded arrays, no broken behavior.

---

## Mode: Variations

Generate N distinct variations of an existing sketch, each meaningfully different.

**Load:** `references/algorithms.md`, `references/aesthetics.md`

**Workflow:**

1. **Identify variation axes** — Determine which aspects can be meaningfully varied:
   - Color palette / mapping strategy
   - Spatial arrangement / composition
   - Motion dynamics / speed / easing
   - Noise parameters / seed / scale
   - Interaction model
   - Particle count / behavior / shape
   - Algorithm substitution (e.g., Euler → Verlet, grid → spiral)

2. **Generate N variations** (default 3) — Each MUST differ on at least 2 axes. A color change alone is not a variation. Each should feel like a different artistic interpretation of the same concept.

3. **Present** — Output each variation as a complete code block with a 1-line label describing what makes it distinct (e.g., "Variation 2: spiral placement + warm monochrome palette").

---

## Mode: Critique

Read-only analysis of a p5.js sketch. **Never modify code in this mode.**

**Load:** `references/performance.md`

**Workflow:**

1. **Visual analysis** — Assess composition, color harmony, motion quality, emergent complexity. Is this visually compelling or generic?

2. **Technical analysis** — Performance (frame budget at 60fps on 400x400), sandbox safety (loop risk, memory growth), code idioms (magic numbers, naming, structure).

3. **Anti-Slop Score** — Rate on the Anti-Slop Scale:

   | Score | Label | Description |
   |-------|-------|-------------|
   | 1 | **Tutorial** | Found in any "Getting Started with p5.js" tutorial |
   | 2 | **Template** | Matches a built-in studio template |
   | 3 | **Competent** | Combines 2+ techniques but predictably |
   | 4 | **Refined** | Intentional design, considered color/composition, layered complexity |
   | 5 | **Distinctive** | Would stand out on OpenProcessing — unique, memorable, emergent |

4. **Report** — Structured output: Strengths, Weaknesses, Suggestions (each suggestion includes "use `refine` to apply").

---

## Mode: Explain

Explain the generative art techniques and p5.js patterns used in a sketch, suitable for learning.

**Load:** `references/algorithms.md`

**Workflow:**

1. **Decompose** — Identify every technique: noise, trigonometric motion, particle physics, recursion, pixel manipulation, etc.

2. **Explain each** — Plain language with mathematical/visual intuition. What does this code produce visually and why? Reference the underlying concept (Perlin noise, Boids, etc.) without jargon-dumping.

3. **Contextualize** — Where does this technique fit in generative art? What are related techniques to explore next? Suggest 1-2 modifications the learner could try.

---

## Mode: Fix

Diagnose and fix errors in p5.js code — runtime errors, visual bugs, or sandbox violations.

**Load:** `references/p5-api.md`, `references/performance.md`

**Workflow:**

1. **Diagnose** — Parse error messages if provided. If no error text, read the code and identify: infinite loops, off-screen rendering, missing `setup()`/`draw()`, p5 v2 API misuse, sandbox violations, unbounded memory growth.

2. **Fix** — Apply minimal targeted fixes. Explain each fix with a brief comment. Do not refactor or improve beyond fixing the bug.

3. **Verify** — Confirm the fix addresses root cause and does not introduce new issues (especially loop budget violations).

4. **Output** — Complete corrected code block.

---

## Anti-Slop Strategy

Every Create output must score **≥4 (Refined)** on the Anti-Slop Scale. These rules enforce that:

1. **No random RGB as primary color** — Use HSB with constrained hue ranges, intentional palettes, or noise-mapped color. `fill(random(255), random(255), random(255))` is banned as the main color strategy.

2. **No uniform random as sole visual interest** — Layer `random()` with `noise()`, trigonometric functions, or structured placement.

3. **Meaningful interaction** — Mouse/keyboard must affect system dynamics (force, attraction, field direction), not just spawn particles at a position.

4. **Dark backgrounds with intention** — The studio default is `#000000`. Vary with low-alpha fading, subtle gradients, tinted feedback, or textured backgrounds. Flat black is fine only if the foreground is rich.

5. **No symmetry-as-laziness** — If using radial symmetry, add asymmetric perturbation, drift, or evolution. Centered circles radiating outward is the lowest-effort composition.

6. **Multiple time scales** — Layer fast motion (per frame) + slow evolution (seconds) + glacial drift (minutes). Single-speed animation feels mechanical.

7. **Emergent over explicit** — Prefer systems where complex behavior emerges from simple rules (flocking, CA, reaction-diffusion) over hand-choreographed animation sequences.

---

## Quality Framework

A **Refined** sketch (score 4+) demonstrates:

**Visual Design:**
- Intentional color palette — not random, not monochrome-by-default
- Considered spatial composition — visual hierarchy, not uniform scatter
- Dynamic motion — acceleration, easing, dampening, not constant velocity
- Multiple visual layers that interact or complement each other

**Technical Quality:**
- Named constants, no magic numbers
- Loop budget under 50,000 iterations/frame (2x safety margin)
- No unbounded array growth in `draw()`
- Maintains 60fps on 400x400
- Clean code: purpose-named variables, functions for reuse

**Interactivity (when present):**
- Mouse/keyboard affects system behavior, not just appearance
- Works meaningfully in autonomous mode (without interaction)

---

## Scope Boundaries

| | |
|---|---|
| **IS for** | p5.js v2.2.1 sketches in global mode for the studio sandbox |
| **NOT for** | GLSL fragment/vertex shaders (use shader editor) |
| **NOT for** | WGSL / WebGPU compute (use WebGPU editor) |
| **NOT for** | React components, Next.js pages, or general JavaScript |
| **NOT for** | Server-side code, API routes, or database queries |
| **NOT for** | p5.js instance mode (`new p5(function(p) { ... })`) |

---

## Reference File Index

| File | Content | Load During |
|------|---------|-------------|
| `references/algorithms.md` | Generative art algorithms: noise, particles, fractals, CA, reaction-diffusion, attractors, parametric curves, physics, pixels, tiling | Create, Variations, Explain |
| `references/aesthetics.md` | Color theory, composition, motion design, layering, texture, anti-pattern gallery | Create, Variations, Critique |
| `references/p5-api.md` | p5.js v2.2.1 global-mode API, sandbox integration, what works/doesn't work | Create, Refine, Fix |
| `references/performance.md` | Sandbox constraints, frame budgets, particle counts, memory patterns, common killers | Refine, Critique, Fix |

---

## Critical Rules

1. **Output ONLY valid JavaScript using p5.js global mode** — `function setup()`, `function draw()`, global functions. No ES module imports, no instance mode.
2. **p5.js version is 2.2.1** — Do not use deprecated v1 APIs or APIs from newer versions.
3. **Always call `createCanvas()` in `setup()`** — Default 400x400 unless user specifies otherwise.
4. **Loop budget: stay under 50,000 iterations per frame** — 2x safety margin against the 100K sandbox limit.
5. **No unbounded array growth in `draw()`** — Every growing array must have a max size with `shift()`, splice, or circular buffer.
6. **Code must be under 100KB** — `STUDIO_MAX_CODE_SIZE` limit. Generative art is about elegant rules, not verbose code.
7. **No external dependencies** — Only p5.js global functions. No libraries, no `fetch()`, no DOM manipulation beyond p5.
8. **No `eval()`, `Function()`, or dynamic code execution** — Sandbox CSP restricts this.
9. **Anti-Slop: every Create output must score ≥4 on the Anti-Slop Scale** — Run the Originality Check before outputting.
10. **Never duplicate built-in templates** — Random circles, bouncing ball, wave pattern, mouse trail, click particles, flow field, L-system tree, Mandelbrot, cellular automata — produce something meaningfully different.
11. **Color: use intentional palettes** — HSB with constrained ranges, complementary schemes, noise-mapped, or curated arrays. Never random RGB as primary strategy.
12. **Critique mode is read-only** — Never modify code when critiquing.
13. **Refine preserves identity** — Improvements keep the sketch recognizable. Propose before rewriting.
14. **Variations differ on ≥2 axes** — Color change alone is not a variation.
15. **Explain builds intuition** — No jargon-dumping. Explain *why* the math creates the visual, not just *what* API it calls.
16. **Use `pixelDensity(1)` when accessing `pixels[]`** — Required for predictable pixel indexing.

---

## Canonical Vocabulary

| Term | Meaning | Do Not Use |
|------|---------|------------|
| **sketch** | A self-contained p5.js program with `setup()` and optionally `draw()` | "script", "program", "app" |
| **global mode** | p5.js execution where functions attach to `window` | "instance mode" |
| **canvas** | The HTML5 Canvas created by `createCanvas()` | "viewport", "screen" |
| **frame** | A single execution of `draw()` | "tick", "step", "cycle" |
| **noise field** | Continuous values sampled from Perlin noise | "random field" |
| **flow field** | Grid of direction vectors, typically from noise | "vector field" |
| **particle** | Lightweight visual entity with position and velocity | "agent", "object" |
| **attractor** | Point or system exerting force on particles | "gravity point" |
| **feedback** | Drawing without fully clearing canvas — creates trails | "persistence" |
| **fBm** | Fractal Brownian motion: layered noise octaves | "layered noise" |
| **sandbox** | The isolated iframe executing p5.js code | "runtime", "environment" |
| **watchdog** | 5-second timeout killing unresponsive sketches | "timeout" |
| **loop guard** | Injected counter throwing after 100K iterations | "loop protection" |
