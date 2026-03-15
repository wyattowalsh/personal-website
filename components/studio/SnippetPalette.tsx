'use client'

import * as React from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { Code2, Search, X } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import type { EngineType } from '@/lib/studio/types'

interface Snippet {
  name: string
  description: string
  code: string
  category: string
}

interface SnippetPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  engine: EngineType
  onInsert: (code: string) => void
}

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

// ---------------------------------------------------------------------------
// Snippet data
// ---------------------------------------------------------------------------

const P5_SNIPPETS: Snippet[] = [
  // Setup
  {
    name: 'Basic Setup',
    description: 'Minimal canvas with draw loop',
    category: 'Setup',
    code: `function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
}`,
  },
  {
    name: 'Fullscreen Canvas',
    description: 'Responsive canvas that fills the window',
    category: 'Setup',
    code: `function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(0);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}`,
  },
  // Shapes
  {
    name: 'Circle Pattern',
    description: 'Grid of circles with varying sizes',
    category: 'Shapes',
    code: `let spacing = 40;
for (let x = spacing; x < width - spacing; x += spacing) {
  for (let y = spacing; y < height - spacing; y += spacing) {
    let d = dist(x, y, mouseX, mouseY);
    let s = map(d, 0, 300, 30, 4);
    ellipse(x, y, s, s);
  }
}`,
  },
  {
    name: 'Random Rectangles',
    description: 'Randomly placed and colored rectangles',
    category: 'Shapes',
    code: `noStroke();
for (let i = 0; i < 20; i++) {
  fill(random(255), random(255), random(255), 150);
  let x = random(width);
  let y = random(height);
  let w = random(20, 100);
  let h = random(20, 100);
  rect(x, y, w, h);
}`,
  },
  // Animation
  {
    name: 'Sine Wave',
    description: 'Animated sine wave with smooth stroke',
    category: 'Animation',
    code: `background(20);
stroke(100, 200, 255);
strokeWeight(2);
noFill();
beginShape();
for (let x = 0; x < width; x += 4) {
  let y = height / 2 + sin(x * 0.02 + frameCount * 0.05) * 100;
  vertex(x, y);
}
endShape();`,
  },
  {
    name: 'Particle System',
    description: 'Basic particle class with gravity',
    category: 'Animation',
    code: `class Particle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(1, 3));
    this.life = 255;
  }
  update() {
    this.vel.y += 0.05;
    this.pos.add(this.vel);
    this.life -= 3;
  }
  show() {
    noStroke();
    fill(255, this.life);
    ellipse(this.pos.x, this.pos.y, 6);
  }
  isDead() { return this.life <= 0; }
}`,
  },
  // Interaction
  {
    name: 'Mouse Follower',
    description: 'Smooth circle that follows the cursor',
    category: 'Interaction',
    code: `let px = 0, py = 0;

function draw() {
  background(20, 20);
  px = lerp(px, mouseX, 0.08);
  py = lerp(py, mouseY, 0.08);
  noStroke();
  fill(100, 200, 255);
  ellipse(px, py, 40, 40);
}`,
  },
  {
    name: 'Keyboard Input',
    description: 'Template for keyboard event handling',
    category: 'Interaction',
    code: `let x, y;

function setup() {
  createCanvas(400, 400);
  x = width / 2;
  y = height / 2;
}

function keyPressed() {
  if (key === 'ArrowUp') y -= 10;
  if (key === 'ArrowDown') y += 10;
  if (key === 'ArrowLeft') x -= 10;
  if (key === 'ArrowRight') x += 10;
}`,
  },
  // Noise
  {
    name: 'Perlin Noise Field',
    description: 'Flow field driven by Perlin noise',
    category: 'Noise',
    code: `let scale = 0.005;
background(0);
stroke(255, 40);
for (let i = 0; i < 1000; i++) {
  let x = random(width);
  let y = random(height);
  let angle = noise(x * scale, y * scale, frameCount * 0.005) * TAU * 2;
  let len = 10;
  line(x, y, x + cos(angle) * len, y + sin(angle) * len);
}`,
  },
  {
    name: 'Noise Terrain',
    description: '2D noise-based landscape',
    category: 'Noise',
    code: `background(20);
noFill();
stroke(100, 200, 255, 80);
let yOff = frameCount * 0.01;
for (let y = 0; y < height; y += 8) {
  beginShape();
  for (let x = 0; x < width; x += 4) {
    let n = noise(x * 0.005, y * 0.01 + yOff);
    vertex(x, y + n * 40 - 20);
  }
  endShape();
}`,
  },
]

const GLSL_SNIPPETS: Snippet[] = [
  // Basics
  {
    name: 'Gradient',
    description: 'Basic UV-based color gradient',
    category: 'Basics',
    code: `void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    vec3 col = vec3(uv.x, uv.y, 0.5 + 0.5 * sin(iTime));
    fragColor = vec4(col, 1.0);
}`,
  },
  {
    name: 'Circle SDF',
    description: 'Signed distance function circle',
    category: 'Basics',
    code: `float sdCircle(vec2 p, float r) {
    return length(p) - r;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
    float d = sdCircle(uv, 0.5);
    vec3 col = vec3(1.0 - smoothstep(0.0, 0.01, d));
    fragColor = vec4(col, 1.0);
}`,
  },
  // Noise
  {
    name: 'Simple Noise',
    description: 'Hash-based pseudo-random noise',
    category: 'Noise',
    code: `float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1, 0));
    float c = hash(i + vec2(0, 1));
    float d = hash(i + vec2(1, 1));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}`,
  },
  {
    name: 'FBM',
    description: 'Fractal Brownian motion for organic textures',
    category: 'Noise',
    code: `float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 6; i++) {
        value += amplitude * noise(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}`,
  },
  // Effects
  {
    name: 'Glow',
    description: 'Radial glow effect from center',
    category: 'Effects',
    code: `void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
    float glow = 0.02 / length(uv);
    vec3 col = glow * vec3(0.3, 0.6, 1.0);
    fragColor = vec4(col, 1.0);
}`,
  },
  {
    name: 'Color Palette',
    description: 'Cosine-based procedural color palette',
    category: 'Effects',
    code: `vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
    return a + b * cos(6.28318 * (c * t + d));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
    float t = length(uv) + iTime * 0.3;
    vec3 col = palette(t, vec3(0.5), vec3(0.5),
        vec3(1.0, 1.0, 1.0), vec3(0.0, 0.33, 0.67));
    fragColor = vec4(col, 1.0);
}`,
  },
  // Shapes
  {
    name: 'Box SDF',
    description: '2D box signed distance function',
    category: 'Shapes',
    code: `float sdBox(vec2 p, vec2 b) {
    vec2 d = abs(p) - b;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
    float d = sdBox(uv, vec2(0.4, 0.25));
    vec3 col = vec3(1.0 - smoothstep(0.0, 0.01, d));
    fragColor = vec4(col, 1.0);
}`,
  },
  {
    name: 'Smooth Union',
    description: 'Smooth minimum for combining SDFs',
    category: 'Shapes',
    code: `float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
    float d1 = length(uv - vec2(-0.3, 0.0)) - 0.3;
    float d2 = length(uv - vec2(0.3, 0.0)) - 0.3;
    float d = smin(d1, d2, 0.2);
    vec3 col = vec3(1.0 - smoothstep(0.0, 0.01, d));
    fragColor = vec4(col, 1.0);
}`,
  },
]

const WGSL_SNIPPETS: Snippet[] = [
  // Compute
  {
    name: 'Basic Compute',
    description: 'Minimal compute shader with workgroup',
    category: 'Compute',
    code: `@group(0) @binding(0) var<storage, read_write> data: array<f32>;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) id: vec3u) {
    let i = id.x;
    if (i >= arrayLength(&data)) { return; }
    data[i] = data[i] * 2.0;
}`,
  },
  {
    name: 'Image Processing',
    description: 'Read/write storage texture template',
    category: 'Compute',
    code: `@group(0) @binding(0) var inputTex: texture_2d<f32>;
@group(0) @binding(1) var outputTex: texture_storage_2d<rgba8unorm, write>;

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3u) {
    let dims = textureDimensions(inputTex);
    if (id.x >= dims.x || id.y >= dims.y) { return; }
    let color = textureLoad(inputTex, id.xy, 0);
    let gray = dot(color.rgb, vec3f(0.299, 0.587, 0.114));
    textureStore(outputTex, id.xy, vec4f(gray, gray, gray, 1.0));
}`,
  },
  // Rendering
  {
    name: 'Vertex/Fragment',
    description: 'Basic vertex and fragment shader pipeline',
    category: 'Rendering',
    code: `struct VertexOutput {
    @builtin(position) pos: vec4f,
    @location(0) color: vec4f,
};

@vertex
fn vs(@builtin(vertex_index) i: u32) -> VertexOutput {
    var positions = array<vec2f, 3>(
        vec2f( 0.0,  0.5),
        vec2f(-0.5, -0.5),
        vec2f( 0.5, -0.5),
    );
    var colors = array<vec4f, 3>(
        vec4f(1, 0, 0, 1),
        vec4f(0, 1, 0, 1),
        vec4f(0, 0, 1, 1),
    );
    var out: VertexOutput;
    out.pos = vec4f(positions[i], 0.0, 1.0);
    out.color = colors[i];
    return out;
}

@fragment
fn fs(in: VertexOutput) -> @location(0) vec4f {
    return in.color;
}`,
  },
  {
    name: 'Fullscreen Quad',
    description: 'Fullscreen triangle technique',
    category: 'Rendering',
    code: `struct VertexOutput {
    @builtin(position) pos: vec4f,
    @location(0) uv: vec2f,
};

@vertex
fn vs(@builtin(vertex_index) i: u32) -> VertexOutput {
    // Fullscreen triangle (3 vertices cover the screen)
    var out: VertexOutput;
    out.uv = vec2f(f32((i << 1u) & 2u), f32(i & 2u));
    out.pos = vec4f(out.uv * 2.0 - 1.0, 0.0, 1.0);
    out.uv.y = 1.0 - out.uv.y; // flip Y
    return out;
}

@fragment
fn fs(in: VertexOutput) -> @location(0) vec4f {
    return vec4f(in.uv, 0.5 + 0.5 * sin(in.uv.x * 6.28), 1.0);
}`,
  },
  // Math
  {
    name: 'Noise',
    description: 'WGSL pseudo-random noise function',
    category: 'Math',
    code: `fn hash(p: vec2f) -> f32 {
    var p3 = fract(vec3f(p.xyx) * 0.13);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

fn noise(p: vec2f) -> f32 {
    let i = floor(p);
    let f = fract(p);
    let u = f * f * (3.0 - 2.0 * f);
    return mix(
        mix(hash(i), hash(i + vec2f(1.0, 0.0)), u.x),
        mix(hash(i + vec2f(0.0, 1.0)), hash(i + vec2f(1.0, 1.0)), u.x),
        u.y
    );
}`,
  },
  {
    name: 'SDF Primitives',
    description: 'Common SDF helper functions for WGSL',
    category: 'Math',
    code: `fn sdCircle(p: vec2f, r: f32) -> f32 {
    return length(p) - r;
}

fn sdBox(p: vec2f, b: vec2f) -> f32 {
    let d = abs(p) - b;
    return length(max(d, vec2f(0.0))) + min(max(d.x, d.y), 0.0);
}

fn sdSegment(p: vec2f, a: vec2f, b: vec2f) -> f32 {
    let pa = p - a;
    let ba = b - a;
    let h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
}

fn smin(a: f32, b: f32, k: f32) -> f32 {
    let h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
}`,
  },
]

function getSnippets(engine: EngineType): Snippet[] {
  switch (engine) {
    case 'p5js':
      return P5_SNIPPETS
    case 'glsl':
      return GLSL_SNIPPETS
    case 'webgpu':
      return WGSL_SNIPPETS
    default: {
      const _exhaustive: never = engine
      return _exhaustive
    }
  }
}

function getCategories(snippets: Snippet[]): string[] {
  const seen = new Set<string>()
  const cats: string[] = []
  for (const s of snippets) {
    if (!seen.has(s.category)) {
      seen.add(s.category)
      cats.push(s.category)
    }
  }
  return cats
}

function engineLabel(engine: EngineType): string {
  switch (engine) {
    case 'p5js':
      return 'p5.js'
    case 'glsl':
      return 'GLSL'
    case 'webgpu':
      return 'WGSL'
    default: {
      const _exhaustive: never = engine
      return _exhaustive
    }
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SnippetPalette({
  open,
  onOpenChange,
  engine,
  onInsert,
}: SnippetPaletteProps) {
  const [query, setQuery] = React.useState('')
  const inputRef = React.useRef<HTMLInputElement>(null)
  const dialogRef = React.useRef<HTMLDivElement>(null)
  const previousFocusRef = React.useRef<HTMLElement | null>(null)
  const prefersReducedMotion = useReducedMotion()

  const snippets = React.useMemo(() => getSnippets(engine), [engine])
  const categories = React.useMemo(() => getCategories(snippets), [snippets])

  const [activeTab, setActiveTab] = React.useState<string>(() => categories[0] ?? '')

  // Reset state when opening
  React.useEffect(() => {
    if (open) {
      setQuery('')
      setActiveTab(categories[0] ?? '')
      requestAnimationFrame(() => {
        inputRef.current?.focus()
      })
    }
  }, [open, categories])

  // Update active tab when engine changes
  React.useEffect(() => {
    setActiveTab(categories[0] ?? '')
  }, [categories])

  // Save and restore focus around dialog lifecycle
  React.useEffect(() => {
    if (open) {
      previousFocusRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null
      return
    }
    previousFocusRef.current?.focus()
  }, [open])

  const filtered = React.useMemo(() => {
    if (!query.trim()) return snippets
    const q = query.toLowerCase()
    return snippets.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    )
  }, [snippets, query])

  const filteredCategories = React.useMemo(() => {
    const cats = new Set(filtered.map((s) => s.category))
    return categories.filter((c) => cats.has(c))
  }, [filtered, categories])

  const handleInsert = React.useCallback(
    (code: string) => {
      onInsert(code)
      onOpenChange(false)
    },
    [onInsert, onOpenChange]
  )

  const handleDialogKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onOpenChange(false)
        return
      }
      if (e.key !== 'Tab') return

      const root = dialogRef.current
      if (!root) return
      const focusable = Array.from(
        root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    },
    [onOpenChange]
  )

  // Ensure activeTab is valid among filtered categories
  const effectiveTab = filteredCategories.includes(activeTab)
    ? activeTab
    : filteredCategories[0] ?? ''

  const snippetsForTab = React.useMemo(
    () => filtered.filter((s) => s.category === effectiveTab),
    [filtered, effectiveTab]
  )

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.1 }}
            onClick={() => onOpenChange(false)}
            aria-hidden="true"
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh]">
            <motion.div
              ref={dialogRef}
              className="mx-4 flex w-full max-w-xl flex-col overflow-hidden rounded-xl border border-border/80 bg-card/95 text-card-foreground shadow-[0_32px_80px_-32px_rgba(0,0,0,0.85)] backdrop-blur-xl"
              initial={prefersReducedMotion ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.95, y: -10 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.15, ease: 'easeOut' }}
              style={{ maxHeight: '70vh' }}
              onKeyDown={handleDialogKeyDown}
              role="dialog"
              aria-modal="true"
              aria-labelledby="snippet-palette-title"
              aria-describedby="snippet-palette-help"
            >
              {/* Title bar */}
              <div className="flex shrink-0 items-center gap-3 border-b border-border/70 px-4 py-3">
                <Code2 className="h-4 w-4 text-primary" />
                <span id="snippet-palette-title" className="text-sm font-medium">
                  Insert Snippet
                </span>
                <span className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                  {engineLabel(engine)}
                </span>
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="rounded-md p-1 text-muted-foreground/60 transition-colors hover:bg-accent/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Search */}
              <div className="flex shrink-0 items-center gap-3 border-b border-border/70 px-4 py-2.5 transition-colors focus-within:bg-muted/20">
                <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                <label htmlFor="snippet-palette-search" className="sr-only">
                  Search snippets
                </label>
                <input
                  id="snippet-palette-search"
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search snippets..."
                  className="flex-1 rounded-sm bg-transparent px-1 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>

              {/* Category tabs + snippets */}
              {filteredCategories.length === 0 ? (
                <div className="px-4 py-12 text-center text-sm text-muted-foreground/60">
                  No matching snippets
                </div>
              ) : (
                <Tabs
                  value={effectiveTab}
                  onValueChange={setActiveTab}
                  className="flex min-h-0 flex-1 flex-col"
                >
                  <div className="shrink-0 overflow-x-auto border-b border-border/60 px-4">
                    <TabsList className="h-8 bg-transparent p-0">
                      {filteredCategories.map((cat) => (
                        <TabsTrigger
                          key={cat}
                          value={cat}
                          className="rounded-none border-b-2 border-transparent px-3 py-1.5 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
                        >
                          {cat}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>

                  {filteredCategories.map((cat) => (
                    <TabsContent
                      key={cat}
                      value={cat}
                      className="mt-0 min-h-0 flex-1 overflow-y-auto p-3"
                    >
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {(cat === effectiveTab ? snippetsForTab : []).map(
                          (snippet) => (
                            <button
                              key={snippet.name}
                              type="button"
                              onClick={() => handleInsert(snippet.code)}
                              className="group cursor-pointer rounded-lg border border-border/70 bg-muted/20 p-3 text-left transition-colors hover:border-border hover:bg-muted/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
                            >
                              <div className="text-sm font-medium text-foreground">
                                {snippet.name}
                              </div>
                              <div className="mt-0.5 text-xs text-muted-foreground">
                                {snippet.description}
                              </div>
                              <div className="mt-2 line-clamp-2 rounded bg-background/70 px-2 py-1 font-mono text-[10px] leading-relaxed text-muted-foreground/70">
                                {snippet.code}
                              </div>
                            </button>
                          )
                        )}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              )}

              {/* Footer */}
              <div
                id="snippet-palette-help"
                className="shrink-0 border-t border-border/60 px-4 py-2 text-[10px] text-muted-foreground/50"
              >
                <span className="select-none">
                  Click to insert at cursor
                </span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
