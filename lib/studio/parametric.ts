export interface ParametricParam {
  id: string
  label: string
  min: number
  max: number
  default: number
  step: number
}

export interface ParametricStyle {
  id: string
  name: string
  description: string
  params: ParametricParam[]
}

const styles: ParametricStyle[] = [
  {
    id: 'flow-field',
    name: 'Flow Field',
    description: 'Particles tracing a Perlin noise flow field.',
    params: [
      { id: 'particles', label: 'Particles', min: 50, max: 1000, default: 300, step: 50 },
      { id: 'noiseScale', label: 'Noise Scale', min: 0.001, max: 0.05, default: 0.01, step: 0.001 },
      { id: 'speed', label: 'Speed', min: 0.5, max: 5, default: 1, step: 0.5 },
      { id: 'strokeAlpha', label: 'Stroke Alpha', min: 1, max: 50, default: 5, step: 1 },
      { id: 'zSpeed', label: 'Z Evolution', min: 0, max: 0.01, default: 0.002, step: 0.001 },
    ],
  },
  {
    id: 'particles',
    name: 'Particles',
    description: 'Orbiting particles with gravitational attraction.',
    params: [
      { id: 'count', label: 'Count', min: 10, max: 500, default: 100, step: 10 },
      { id: 'gravity', label: 'Gravity', min: 0.1, max: 5, default: 1, step: 0.1 },
      { id: 'size', label: 'Size', min: 1, max: 20, default: 4, step: 1 },
      { id: 'damping', label: 'Damping', min: 0.9, max: 1, default: 0.99, step: 0.005 },
      { id: 'trailAlpha', label: 'Trail Alpha', min: 5, max: 50, default: 15, step: 5 },
    ],
  },
  {
    id: 'fractal',
    name: 'Fractal',
    description: 'Recursive fractal tree with adjustable parameters.',
    params: [
      { id: 'depth', label: 'Depth', min: 2, max: 12, default: 8, step: 1 },
      { id: 'angle', label: 'Branch Angle', min: 10, max: 60, default: 25, step: 1 },
      { id: 'shrink', label: 'Shrink Factor', min: 0.5, max: 0.9, default: 0.67, step: 0.01 },
      { id: 'startLen', label: 'Start Length', min: 50, max: 200, default: 120, step: 10 },
    ],
  },
  {
    id: 'waves',
    name: 'Waves',
    description: 'Layered sine wave patterns.',
    params: [
      { id: 'layers', label: 'Layers', min: 1, max: 10, default: 5, step: 1 },
      { id: 'amplitude', label: 'Amplitude', min: 20, max: 150, default: 80, step: 10 },
      { id: 'frequency', label: 'Frequency', min: 0.005, max: 0.05, default: 0.02, step: 0.005 },
      { id: 'speed', label: 'Speed', min: 0.5, max: 5, default: 2, step: 0.5 },
      { id: 'strokeWeight', label: 'Stroke Weight', min: 1, max: 5, default: 2, step: 0.5 },
    ],
  },
  {
    id: 'geometry',
    name: 'Geometry',
    description: 'Rotating polygons with parametric spacing.',
    params: [
      { id: 'sides', label: 'Sides', min: 3, max: 12, default: 6, step: 1 },
      { id: 'rings', label: 'Rings', min: 3, max: 30, default: 12, step: 1 },
      { id: 'rotationSpeed', label: 'Rotation Speed', min: 0.001, max: 0.05, default: 0.01, step: 0.001 },
      { id: 'spacing', label: 'Spacing', min: 10, max: 40, default: 20, step: 2 },
      { id: 'hueShift', label: 'Hue Shift', min: 0, max: 360, default: 30, step: 10 },
    ],
  },
]

export function getStyles(): ParametricStyle[] {
  return styles
}

export function generateFromParams(
  styleId: string,
  params: Record<string, number>,
): string {
  switch (styleId) {
    case 'flow-field':
      return generateFlowField(params)
    case 'particles':
      return generateParticles(params)
    case 'fractal':
      return generateFractal(params)
    case 'waves':
      return generateWaves(params)
    case 'geometry':
      return generateGeometry(params)
    default:
      return '// Unknown style'
  }
}

function generateFlowField(p: Record<string, number>): string {
  return `let particles = [];
let zoff = 0;

function setup() {
  createCanvas(400, 400);
  for (let i = 0; i < ${p.particles ?? 300}; i++) {
    particles.push(createVector(random(width), random(height)));
  }
  background(0);
}

function draw() {
  for (let p of particles) {
    let angle = noise(p.x * ${p.noiseScale ?? 0.01}, p.y * ${p.noiseScale ?? 0.01}, zoff) * TWO_PI * 2;
    let v = p5.Vector.fromAngle(angle);
    v.setMag(${p.speed ?? 1});
    p.add(v);
    stroke(255, ${p.strokeAlpha ?? 5});
    strokeWeight(1);
    point(p.x, p.y);
    if (p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
      p.x = random(width);
      p.y = random(height);
    }
  }
  zoff += ${p.zSpeed ?? 0.002};
}`
}

function generateParticles(p: Record<string, number>): string {
  return `let particles = [];

function setup() {
  createCanvas(400, 400);
  for (let i = 0; i < ${p.count ?? 100}; i++) {
    particles.push({
      x: random(width), y: random(height),
      vx: random(-1, 1), vy: random(-1, 1)
    });
  }
}

function draw() {
  background(0, ${p.trailAlpha ?? 15});
  let cx = width / 2, cy = height / 2;
  for (let p of particles) {
    let dx = cx - p.x, dy = cy - p.y;
    let d = max(sqrt(dx * dx + dy * dy), 1);
    let f = ${p.gravity ?? 1} / d;
    p.vx += (dx / d) * f;
    p.vy += (dy / d) * f;
    p.vx *= ${p.damping ?? 0.99};
    p.vy *= ${p.damping ?? 0.99};
    p.x += p.vx;
    p.y += p.vy;
    noStroke();
    fill(map(d, 0, 200, 255, 100), 150, 255);
    circle(p.x, p.y, ${p.size ?? 4});
  }
}`
}

function generateFractal(p: Record<string, number>): string {
  return `function setup() {
  createCanvas(400, 400);
  background(0);
  stroke(100, 200, 100);
  strokeWeight(1);
  translate(width / 2, height);
  branch(${p.startLen ?? 120}, ${p.depth ?? 8});
  noLoop();
}

function branch(len, depth) {
  if (depth <= 0) return;
  line(0, 0, 0, -len);
  translate(0, -len);
  push();
  rotate(radians(${p.angle ?? 25}));
  branch(len * ${p.shrink ?? 0.67}, depth - 1);
  pop();
  push();
  rotate(radians(-${p.angle ?? 25}));
  branch(len * ${p.shrink ?? 0.67}, depth - 1);
  pop();
}`
}

function generateWaves(p: Record<string, number>): string {
  return `function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(0, 25);
  noFill();
  for (let j = 0; j < ${p.layers ?? 5}; j++) {
    stroke(100 + j * 30, 150 + j * 20, 255, 200);
    strokeWeight(${p.strokeWeight ?? 2});
    beginShape();
    for (let i = 0; i < width; i += 4) {
      let y = height / 2 +
        sin((i + frameCount * ${p.speed ?? 2}) * ${p.frequency ?? 0.02} + j * 0.5) * (${p.amplitude ?? 80} + j * 15) +
        cos((i - frameCount) * 0.01) * 30;
      vertex(i, y);
    }
    endShape();
  }
}`
}

function generateGeometry(p: Record<string, number>): string {
  return `function setup() {
  createCanvas(400, 400);
  colorMode(HSB, 360, 100, 100, 100);
}

function draw() {
  background(0, 0, 0, 20);
  translate(width / 2, height / 2);
  noFill();
  for (let r = 0; r < ${p.rings ?? 12}; r++) {
    let radius = (r + 1) * ${p.spacing ?? 20};
    let hue = (r * ${p.hueShift ?? 30} + frameCount) % 360;
    stroke(hue, 80, 90, 60);
    strokeWeight(1);
    push();
    rotate(frameCount * ${p.rotationSpeed ?? 0.01} * (r % 2 === 0 ? 1 : -1));
    beginShape();
    for (let i = 0; i < ${p.sides ?? 6}; i++) {
      let angle = (TWO_PI / ${p.sides ?? 6}) * i - HALF_PI;
      vertex(cos(angle) * radius, sin(angle) * radius);
    }
    endShape(CLOSE);
    pop();
  }
}`
}
