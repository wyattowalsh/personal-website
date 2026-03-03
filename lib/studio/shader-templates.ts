import type { SketchTemplate } from './types'

export const shaderTemplates: SketchTemplate[] = [
  {
    id: 'glsl-gradient',
    name: 'Gradient',
    category: 'basic',
    description: 'A smooth gradient based on UV coordinates.',
    engine: 'glsl',
    code: `void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    vec3 col = vec3(uv.x, uv.y, 0.5 + 0.5 * sin(iTime));
    fragColor = vec4(col, 1.0);
}`,
  },
  {
    id: 'glsl-circles',
    name: 'Circles',
    category: 'basic',
    description: 'Concentric animated circles with smooth edges.',
    engine: 'glsl',
    code: `void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
    float d = length(uv);
    float rings = sin(d * 20.0 - iTime * 3.0);
    rings = smoothstep(0.0, 0.05, rings);
    vec3 col = mix(vec3(0.1, 0.2, 0.5), vec3(0.9, 0.3, 0.6), rings);
    fragColor = vec4(col, 1.0);
}`,
  },
  {
    id: 'glsl-uv-coords',
    name: 'UV Coordinates',
    category: 'basic',
    description: 'Visualize UV space with a coordinate grid.',
    engine: 'glsl',
    code: `void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    vec2 grid = fract(uv * 10.0);
    float line = step(0.95, grid.x) + step(0.95, grid.y);
    vec3 col = vec3(uv.x, uv.y, 1.0 - uv.x) * (1.0 - line * 0.5);
    fragColor = vec4(col, 1.0);
}`,
  },
  {
    id: 'glsl-perlin-noise',
    name: 'Perlin Noise',
    category: 'generative',
    description: 'Animated 2D value noise with smooth interpolation.',
    engine: 'glsl',
    code: `float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 6; i++) {
        v += a * noise(p);
        p *= 2.0;
        a *= 0.5;
    }
    return v;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    float n = fbm(uv * 5.0 + iTime * 0.3);
    vec3 col = vec3(n * 0.4, n * 0.6 + 0.2, n * 0.9 + 0.1);
    fragColor = vec4(col, 1.0);
}`,
  },
  {
    id: 'glsl-mandelbrot',
    name: 'Mandelbrot',
    category: 'generative',
    description: 'Animated Mandelbrot set with smooth coloring.',
    engine: 'glsl',
    code: `void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
    float zoom = 2.0 + sin(iTime * 0.2) * 1.5;
    vec2 c = uv / zoom + vec2(-0.5, 0.0);
    vec2 z = vec2(0.0);
    float iter = 0.0;
    const float maxIter = 128.0;
    for (float i = 0.0; i < maxIter; i++) {
        z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
        if (dot(z, z) > 4.0) break;
        iter++;
    }
    float t = iter / maxIter;
    vec3 col = 0.5 + 0.5 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67)));
    if (iter >= maxIter) col = vec3(0.0);
    fragColor = vec4(col, 1.0);
}`,
  },
  {
    id: 'glsl-voronoi',
    name: 'Voronoi',
    category: 'generative',
    description: 'Animated Voronoi diagram with distance-based coloring.',
    engine: 'glsl',
    code: `vec2 random2(vec2 p) {
    return fract(sin(vec2(
        dot(p, vec2(127.1, 311.7)),
        dot(p, vec2(269.5, 183.3))
    )) * 43758.5453);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    uv *= 5.0;
    vec2 i_uv = floor(uv);
    vec2 f_uv = fract(uv);

    float minDist = 1.0;
    for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
            vec2 neighbor = vec2(float(x), float(y));
            vec2 point = random2(i_uv + neighbor);
            point = 0.5 + 0.5 * sin(iTime + 6.2831 * point);
            float d = length(neighbor + point - f_uv);
            minDist = min(minDist, d);
        }
    }
    vec3 col = vec3(minDist);
    col = mix(vec3(0.1, 0.3, 0.6), vec3(1.0, 0.5, 0.2), minDist);
    fragColor = vec4(col, 1.0);
}`,
  },
  {
    id: 'glsl-raymarching',
    name: 'Raymarching Sphere',
    category: 'generative',
    description: 'A raymarched sphere with basic lighting.',
    engine: 'glsl',
    code: `float sdSphere(vec3 p, float r) {
    return length(p) - r;
}

float map(vec3 p) {
    return sdSphere(p, 1.0);
}

vec3 getNormal(vec3 p) {
    vec2 e = vec2(0.001, 0.0);
    return normalize(vec3(
        map(p + e.xyy) - map(p - e.xyy),
        map(p + e.yxy) - map(p - e.yxy),
        map(p + e.yyx) - map(p - e.yyx)
    ));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
    vec3 ro = vec3(0.0, 0.0, 3.0);
    vec3 rd = normalize(vec3(uv, -1.5));
    float t = 0.0;
    for (int i = 0; i < 64; i++) {
        vec3 p = ro + rd * t;
        float d = map(p);
        if (d < 0.001) break;
        t += d;
        if (t > 20.0) break;
    }
    vec3 col = vec3(0.05, 0.05, 0.1);
    if (t < 20.0) {
        vec3 p = ro + rd * t;
        vec3 n = getNormal(p);
        vec3 lightDir = normalize(vec3(sin(iTime), 1.0, cos(iTime)));
        float diff = max(dot(n, lightDir), 0.0);
        float spec = pow(max(dot(reflect(-lightDir, n), -rd), 0.0), 32.0);
        col = vec3(0.2, 0.5, 0.8) * diff + vec3(1.0) * spec * 0.5 + 0.05;
    }
    fragColor = vec4(col, 1.0);
}`,
  },
  {
    id: 'glsl-reaction-diffusion',
    name: 'Reaction-Diffusion',
    category: 'generative',
    description: 'Animated reaction-diffusion pattern (Gray-Scott model approximation).',
    engine: 'glsl',
    code: `float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    float t = iTime * 0.5;

    float pattern = 0.0;
    for (float i = 1.0; i <= 5.0; i++) {
        float scale = i * 3.0;
        vec2 p = uv * scale;
        p.x += sin(t + i) * 0.3;
        p.y += cos(t * 0.7 + i * 1.3) * 0.3;
        float n = sin(p.x * 6.28) * sin(p.y * 6.28);
        pattern += n / i;
    }

    pattern = smoothstep(-0.5, 0.5, pattern);
    vec3 col1 = vec3(0.05, 0.1, 0.2);
    vec3 col2 = vec3(0.1, 0.6, 0.8);
    vec3 col3 = vec3(0.9, 0.4, 0.1);
    vec3 col = mix(col1, col2, pattern);
    col = mix(col, col3, smoothstep(0.6, 0.9, pattern));
    fragColor = vec4(col, 1.0);
}`,
  },
]
