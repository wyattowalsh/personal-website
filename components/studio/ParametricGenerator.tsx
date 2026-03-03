'use client'

import * as React from 'react'
import { Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'

interface ParametricParam {
  id: string
  label: string
  min: number
  max: number
  default: number
  step: number
}

interface ParametricStyle {
  id: string
  name: string
  description: string
  params: ParametricParam[]
}

const STYLES: ParametricStyle[] = [
  {
    id: 'flow-field',
    name: 'Flow Field',
    description: 'Particles following Perlin noise',
    params: [
      { id: 'particles', label: 'Particles', min: 100, max: 5000, default: 1000, step: 100 },
      { id: 'noiseScale', label: 'Noise Scale', min: 0.001, max: 0.05, default: 0.01, step: 0.001 },
      { id: 'speed', label: 'Speed', min: 0.5, max: 5, default: 2, step: 0.5 },
      { id: 'fadeAlpha', label: 'Trail Length', min: 1, max: 50, default: 10, step: 1 },
    ],
  },
  {
    id: 'spirograph',
    name: 'Spirograph',
    description: 'Mathematical spirograph patterns',
    params: [
      { id: 'R', label: 'Outer Radius', min: 50, max: 200, default: 150, step: 10 },
      { id: 'r', label: 'Inner Radius', min: 10, max: 100, default: 45, step: 5 },
      { id: 'd', label: 'Pen Distance', min: 10, max: 150, default: 80, step: 5 },
      { id: 'speed', label: 'Speed', min: 0.01, max: 0.1, default: 0.03, step: 0.01 },
    ],
  },
  {
    id: 'reaction-diffusion',
    name: 'Reaction-Diffusion',
    description: 'Gray-Scott reaction-diffusion simulation',
    params: [
      { id: 'feed', label: 'Feed Rate', min: 0.01, max: 0.1, default: 0.055, step: 0.005 },
      { id: 'kill', label: 'Kill Rate', min: 0.01, max: 0.1, default: 0.062, step: 0.002 },
      { id: 'diffA', label: 'Diffusion A', min: 0.5, max: 1.5, default: 1, step: 0.1 },
      { id: 'diffB', label: 'Diffusion B', min: 0.1, max: 0.8, default: 0.5, step: 0.05 },
    ],
  },
]

function generateCode(style: ParametricStyle, values: Record<string, number>): string {
  switch (style.id) {
    case 'flow-field':
      return `let particles = [];
const NUM = ${values.particles};
const NOISE_SCALE = ${values.noiseScale};
const SPEED = ${values.speed};
const FADE = ${values.fadeAlpha};

function setup() {
  createCanvas(400, 400);
  for (let i = 0; i < NUM; i++) {
    particles.push(createVector(random(width), random(height)));
  }
  background(0);
}

function draw() {
  background(0, FADE);
  stroke(255, 50);
  strokeWeight(1);
  for (let p of particles) {
    let angle = noise(p.x * NOISE_SCALE, p.y * NOISE_SCALE, frameCount * 0.005) * TWO_PI * 2;
    p.x += cos(angle) * SPEED;
    p.y += sin(angle) * SPEED;
    point(p.x, p.y);
    if (p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
      p.x = random(width);
      p.y = random(height);
    }
  }
}`
    case 'spirograph':
      return `let t = 0;
const R = ${values.R};
const r = ${values.r};
const d = ${values.d};
const SPEED = ${values.speed};

function setup() {
  createCanvas(400, 400);
  background(0);
  translate(width / 2, height / 2);
}

function draw() {
  translate(width / 2, height / 2);
  for (let i = 0; i < 10; i++) {
    let x = (R - r) * cos(t) + d * cos((R - r) / r * t);
    let y = (R - r) * sin(t) - d * sin((R - r) / r * t);
    let hue = (t * 10) % 360;
    colorMode(HSB);
    stroke(hue, 80, 100, 30);
    strokeWeight(1);
    point(x, y);
    t += SPEED;
  }
}`
    case 'reaction-diffusion':
      return `const FEED = ${values.feed};
const KILL = ${values.kill};
const DA = ${values.diffA};
const DB = ${values.diffB};
let grid, next;

function setup() {
  createCanvas(200, 200);
  pixelDensity(1);
  grid = [];
  next = [];
  for (let x = 0; x < width; x++) {
    grid[x] = [];
    next[x] = [];
    for (let y = 0; y < height; y++) {
      grid[x][y] = { a: 1, b: 0 };
      next[x][y] = { a: 1, b: 0 };
    }
  }
  for (let i = 0; i < 10; i++) {
    let cx = floor(random(20, width - 20));
    let cy = floor(random(20, height - 20));
    for (let dx = -5; dx <= 5; dx++)
      for (let dy = -5; dy <= 5; dy++)
        if (cx+dx >= 0 && cx+dx < width && cy+dy >= 0 && cy+dy < height)
          grid[cx+dx][cy+dy].b = 1;
  }
}

function draw() {
  for (let x = 1; x < width - 1; x++) {
    for (let y = 1; y < height - 1; y++) {
      let a = grid[x][y].a, b = grid[x][y].b;
      let la = -a + 0.2*(grid[x-1][y].a+grid[x+1][y].a+grid[x][y-1].a+grid[x][y+1].a) + 0.05*(grid[x-1][y-1].a+grid[x+1][y-1].a+grid[x-1][y+1].a+grid[x+1][y+1].a);
      let lb = -b + 0.2*(grid[x-1][y].b+grid[x+1][y].b+grid[x][y-1].b+grid[x][y+1].b) + 0.05*(grid[x-1][y-1].b+grid[x+1][y-1].b+grid[x-1][y+1].b+grid[x+1][y+1].b);
      next[x][y].a = a + (DA * la - a * b * b + FEED * (1 - a));
      next[x][y].b = b + (DB * lb + a * b * b - (KILL + FEED) * b);
      next[x][y].a = constrain(next[x][y].a, 0, 1);
      next[x][y].b = constrain(next[x][y].b, 0, 1);
    }
  }
  [grid, next] = [next, grid];
  loadPixels();
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let idx = (x + y * width) * 4;
      let v = floor((grid[x][y].a - grid[x][y].b) * 255);
      v = constrain(v, 0, 255);
      pixels[idx] = v;
      pixels[idx+1] = v;
      pixels[idx+2] = v;
      pixels[idx+3] = 255;
    }
  }
  updatePixels();
}`
    default:
      return '// Unknown style'
  }
}

interface ParametricGeneratorProps {
  onGenerate: (code: string) => void
}

export function ParametricGenerator({ onGenerate }: ParametricGeneratorProps) {
  const [selectedStyle, setSelectedStyle] = React.useState<ParametricStyle>(
    STYLES[0]
  )
  const [values, setValues] = React.useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {}
    for (const p of STYLES[0].params) initial[p.id] = p.default
    return initial
  })

  const selectStyle = (style: ParametricStyle) => {
    setSelectedStyle(style)
    const initial: Record<string, number> = {}
    for (const p of style.params) initial[p.id] = p.default
    setValues(initial)
  }

  const handleGenerate = () => {
    const code = generateCode(selectedStyle, values)
    onGenerate(code)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {STYLES.map((style) => (
          <button
            key={style.id}
            type="button"
            onClick={() => selectStyle(style)}
            className={`rounded-lg border p-3 text-left text-sm transition-colors ${
              selectedStyle.id === style.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <span className="font-medium">{style.name}</span>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {style.description}
            </p>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {selectedStyle.params.map((param) => (
          <div key={param.id} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs">{param.label}</Label>
              <span className="font-mono text-xs text-muted-foreground">
                {values[param.id]}
              </span>
            </div>
            <Slider
              value={[values[param.id]]}
              onValueChange={([v]) =>
                setValues((prev) => ({ ...prev, [param.id]: v }))
              }
              min={param.min}
              max={param.max}
              step={param.step}
            />
          </div>
        ))}
      </div>

      <Button onClick={handleGenerate} className="w-full gap-1.5">
        <Wand2 className="h-3.5 w-3.5" />
        Generate {selectedStyle.name}
      </Button>
    </div>
  )
}
