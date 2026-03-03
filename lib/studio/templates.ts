import type { SketchTemplate } from './types'

export const p5Templates: SketchTemplate[] = [
  {
    id: 'blank-canvas',
    name: 'Blank Canvas',
    category: 'basic',
    description: 'A minimal starting point with an empty canvas.',
    engine: 'p5js',
    code: `function setup() {
  createCanvas(400, 400);
  background(0);
}

function draw() {
  // Your code here
}`,
  },
  {
    id: 'random-circles',
    name: 'Random Circles',
    category: 'basic',
    description: 'Colorful circles drawn at random positions.',
    engine: 'p5js',
    code: `function setup() {
  createCanvas(400, 400);
  background(0);
  noStroke();
}

function draw() {
  let x = random(width);
  let y = random(height);
  let r = random(5, 40);
  fill(random(255), random(255), random(255), 150);
  circle(x, y, r * 2);
}`,
  },
  {
    id: 'bouncing-ball',
    name: 'Bouncing Ball',
    category: 'animation',
    description: 'A ball that bounces off the edges of the canvas.',
    engine: 'p5js',
    code: `let x, y, vx, vy, r;

function setup() {
  createCanvas(400, 400);
  r = 20;
  x = width / 2;
  y = height / 2;
  vx = 3;
  vy = 2;
}

function draw() {
  background(0, 20);
  x += vx;
  y += vy;
  if (x < r || x > width - r) vx *= -1;
  if (y < r || y > height - r) vy *= -1;
  noStroke();
  fill(100, 200, 255);
  circle(x, y, r * 2);
}`,
  },
  {
    id: 'wave-pattern',
    name: 'Wave Pattern',
    category: 'animation',
    description: 'Animated sine wave pattern with trailing effect.',
    engine: 'p5js',
    code: `function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(0, 25);
  noFill();
  for (let j = 0; j < 5; j++) {
    stroke(100 + j * 30, 150 + j * 20, 255, 200);
    strokeWeight(2);
    beginShape();
    for (let i = 0; i < width; i += 4) {
      let y = height / 2 +
        sin((i + frameCount * 2) * 0.02 + j * 0.5) * (80 + j * 15) +
        cos((i - frameCount) * 0.01) * 30;
      vertex(i, y);
    }
    endShape();
  }
}`,
  },
  {
    id: 'mouse-trail',
    name: 'Mouse Trail',
    category: 'interactive',
    description: 'Particles follow the mouse cursor with a fading trail.',
    engine: 'p5js',
    code: `let trail = [];

function setup() {
  createCanvas(400, 400);
  background(0);
}

function draw() {
  background(0, 15);
  trail.push({ x: mouseX, y: mouseY });
  if (trail.length > 50) trail.shift();

  noFill();
  for (let i = 1; i < trail.length; i++) {
    let alpha = map(i, 0, trail.length, 0, 255);
    let weight = map(i, 0, trail.length, 1, 8);
    stroke(200, 100, 255, alpha);
    strokeWeight(weight);
    line(trail[i - 1].x, trail[i - 1].y, trail[i].x, trail[i].y);
  }
}`,
  },
  {
    id: 'click-particles',
    name: 'Click Particles',
    category: 'interactive',
    description: 'Click to spawn bursts of colorful particles.',
    engine: 'p5js',
    code: `let particles = [];

function setup() {
  createCanvas(400, 400);
  background(0);
}

function draw() {
  background(0, 20);
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.05;
    p.life -= 2;
    noStroke();
    fill(p.r, p.g, p.b, p.life);
    circle(p.x, p.y, p.size);
    if (p.life <= 0) particles.splice(i, 1);
  }
}

function mousePressed() {
  for (let i = 0; i < 30; i++) {
    let angle = random(TWO_PI);
    let speed = random(1, 5);
    particles.push({
      x: mouseX,
      y: mouseY,
      vx: cos(angle) * speed,
      vy: sin(angle) * speed,
      r: random(150, 255),
      g: random(50, 200),
      b: random(150, 255),
      size: random(3, 10),
      life: 255,
    });
  }
}`,
  },
  {
    id: 'perlin-flow-field',
    name: 'Perlin Flow Field',
    category: 'generative',
    description: 'Particles follow a Perlin noise-based flow field.',
    engine: 'p5js',
    code: `let particles = [];
let scale = 20;
let cols, rows;
let zoff = 0;

function setup() {
  createCanvas(400, 400);
  cols = floor(width / scale);
  rows = floor(height / scale);
  for (let i = 0; i < 300; i++) {
    particles.push(createVector(random(width), random(height)));
  }
  background(0);
}

function draw() {
  for (let p of particles) {
    let col = floor(p.x / scale);
    let row = floor(p.y / scale);
    let angle = noise(col * 0.1, row * 0.1, zoff) * TWO_PI * 2;
    let v = p5.Vector.fromAngle(angle);
    v.setMag(1);
    p.add(v);
    stroke(255, 5);
    strokeWeight(1);
    point(p.x, p.y);
    if (p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
      p.x = random(width);
      p.y = random(height);
    }
  }
  zoff += 0.002;
}`,
  },
  {
    id: 'lsystem-tree',
    name: 'L-System Tree',
    category: 'generative',
    description: 'A fractal tree generated using an L-System grammar.',
    engine: 'p5js',
    code: `let axiom = "F";
let sentence = axiom;
let rules = [{ a: "F", b: "FF+[+F-F-F]-[-F+F+F]" }];
let len = 100;
let angle;

function generate() {
  let next = "";
  for (let c of sentence) {
    let found = false;
    for (let r of rules) {
      if (c === r.a) {
        next += r.b;
        found = true;
        break;
      }
    }
    if (!found) next += c;
  }
  sentence = next;
  len *= 0.5;
}

function setup() {
  createCanvas(400, 400);
  angle = radians(25);
  for (let i = 0; i < 4; i++) generate();
  background(0);
  stroke(100, 200, 100);
  strokeWeight(1);
  translate(width / 2, height);
  for (let c of sentence) {
    if (c === "F") {
      line(0, 0, 0, -len);
      translate(0, -len);
    } else if (c === "+") {
      rotate(angle);
    } else if (c === "-") {
      rotate(-angle);
    } else if (c === "[") {
      push();
    } else if (c === "]") {
      pop();
    }
  }
  noLoop();
}`,
  },
  {
    id: 'mandelbrot-zoom',
    name: 'Mandelbrot Zoom',
    category: 'generative',
    description: 'An interactive Mandelbrot set with smooth coloring.',
    engine: 'p5js',
    code: `let minX = -2.5, maxX = 1;
let minY = -1.25, maxY = 1.25;
let maxIter = 100;

function setup() {
  createCanvas(400, 400);
  pixelDensity(1);
  colorMode(HSB, 360, 100, 100);
  drawMandelbrot();
  noLoop();
}

function drawMandelbrot() {
  loadPixels();
  for (let px = 0; px < width; px++) {
    for (let py = 0; py < height; py++) {
      let x0 = map(px, 0, width, minX, maxX);
      let y0 = map(py, 0, height, minY, maxY);
      let x = 0, y = 0;
      let iter = 0;
      while (x * x + y * y <= 4 && iter < maxIter) {
        let xt = x * x - y * y + x0;
        y = 2 * x * y + y0;
        x = xt;
        iter++;
      }
      let idx = (px + py * width) * 4;
      if (iter === maxIter) {
        pixels[idx] = 0;
        pixels[idx + 1] = 0;
        pixels[idx + 2] = 0;
      } else {
        let h = map(iter, 0, maxIter, 0, 360);
        let c = color(h, 80, 100);
        pixels[idx] = red(c);
        pixels[idx + 1] = green(c);
        pixels[idx + 2] = blue(c);
      }
      pixels[idx + 3] = 255;
    }
  }
  updatePixels();
}

function mousePressed() {
  let cx = map(mouseX, 0, width, minX, maxX);
  let cy = map(mouseY, 0, height, minY, maxY);
  let w = (maxX - minX) * 0.25;
  let h = (maxY - minY) * 0.25;
  minX = cx - w;
  maxX = cx + w;
  minY = cy - h;
  maxY = cy + h;
  maxIter += 20;
  drawMandelbrot();
}`,
  },
  {
    id: 'cellular-automata',
    name: 'Cellular Automata',
    category: 'generative',
    description: "Conway's Game of Life running on a grid.",
    engine: 'p5js',
    code: `let grid;
let cellSize = 8;
let cols, rows;

function setup() {
  createCanvas(400, 400);
  cols = floor(width / cellSize);
  rows = floor(height / cellSize);
  grid = make2DArray(cols, rows);
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j] = random() > 0.7 ? 1 : 0;
    }
  }
  frameRate(12);
}

function make2DArray(c, r) {
  let arr = new Array(c);
  for (let i = 0; i < c; i++) arr[i] = new Array(r).fill(0);
  return arr;
}

function countNeighbors(g, x, y) {
  let sum = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      let ci = (x + i + cols) % cols;
      let cj = (y + j + rows) % rows;
      sum += g[ci][cj];
    }
  }
  return sum - g[x][y];
}

function draw() {
  background(0);
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (grid[i][j] === 1) {
        fill(100, 200, 255);
        noStroke();
        rect(i * cellSize, j * cellSize, cellSize, cellSize);
      }
    }
  }

  let next = make2DArray(cols, rows);
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let n = countNeighbors(grid, i, j);
      if (grid[i][j] === 1 && (n < 2 || n > 3)) next[i][j] = 0;
      else if (grid[i][j] === 0 && n === 3) next[i][j] = 1;
      else next[i][j] = grid[i][j];
    }
  }
  grid = next;
}`,
  },
]
