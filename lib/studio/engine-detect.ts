import type { EngineType } from '@/lib/studio/types'

interface PatternDef {
  pattern: RegExp
  weight: number
}

const p5jsPatterns: PatternDef[] = [
  // High weight (3)
  { pattern: /function\s+setup\s*\(/, weight: 3 },
  { pattern: /function\s+draw\s*\(/, weight: 3 },
  { pattern: /createCanvas\s*\(/, weight: 3 },
  // Medium weight (2)
  { pattern: /mouseX/, weight: 2 },
  { pattern: /mouseY/, weight: 2 },
  { pattern: /frameCount/, weight: 2 },
  { pattern: /keyPressed/, weight: 2 },
  { pattern: /mousePressed/, weight: 2 },
  // Low weight (1)
  { pattern: /ellipse\s*\(/, weight: 1 },
  { pattern: /rect\s*\(/, weight: 1 },
  { pattern: /fill\s*\(/, weight: 1 },
  { pattern: /stroke\s*\(/, weight: 1 },
  { pattern: /background\s*\(/, weight: 1 },
  { pattern: /push\s*\(\)/, weight: 1 },
  { pattern: /pop\s*\(\)/, weight: 1 },
  { pattern: /translate\s*\(/, weight: 1 },
  { pattern: /rotate\s*\(/, weight: 1 },
  { pattern: /scale\s*\(/, weight: 1 },
  { pattern: /noStroke\s*\(\)/, weight: 1 },
  { pattern: /noFill\s*\(\)/, weight: 1 },
  { pattern: /loadImage\s*\(/, weight: 1 },
  { pattern: /image\s*\(/, weight: 1 },
  { pattern: /text\s*\(/, weight: 1 },
  { pattern: /textSize\s*\(/, weight: 1 },
  { pattern: /beginShape/, weight: 1 },
  { pattern: /endShape/, weight: 1 },
  { pattern: /vertex\s*\(/, weight: 1 },
  { pattern: /TWO_PI/, weight: 1 },
  { pattern: /HALF_PI/, weight: 1 },
  { pattern: /p5\.Vector/, weight: 1 },
  { pattern: /loadPixels/, weight: 1 },
  { pattern: /pixels\[/, weight: 1 },
  { pattern: /noise\s*\(/, weight: 1 },
  { pattern: /random\s*\(/, weight: 1 },
]

const glslPatterns: PatternDef[] = [
  // High weight (3)
  { pattern: /void\s+mainImage\s*\(/, weight: 3 },
  { pattern: /#version/, weight: 3 },
  { pattern: /gl_FragColor/, weight: 3 },
  { pattern: /gl_FragCoord/, weight: 3 },
  { pattern: /precision\s+highp/, weight: 3 },
  { pattern: /precision\s+mediump/, weight: 3 },
  // Medium weight (2)
  { pattern: /uniform\s+float/, weight: 2 },
  { pattern: /uniform\s+vec/, weight: 2 },
  { pattern: /uniform\s+mat/, weight: 2 },
  { pattern: /uniform\s+sampler/, weight: 2 },
  { pattern: /varying/, weight: 2 },
  { pattern: /iResolution/, weight: 2 },
  { pattern: /iTime/, weight: 2 },
  { pattern: /iMouse/, weight: 2 },
  { pattern: /sampler2D/, weight: 2 },
  // Low weight (1)
  { pattern: /smoothstep\s*\(/, weight: 1 },
  { pattern: /mix\s*\(/, weight: 1 },
  { pattern: /clamp\s*\(/, weight: 1 },
  { pattern: /fract\s*\(/, weight: 1 },
  { pattern: /mod\s*\(/, weight: 1 },
  { pattern: /length\s*\(/, weight: 1 },
  { pattern: /normalize\s*\(/, weight: 1 },
  { pattern: /dot\s*\(/, weight: 1 },
  { pattern: /cross\s*\(/, weight: 1 },
  { pattern: /reflect\s*\(/, weight: 1 },
  { pattern: /texture\s*\(/, weight: 1 },
]

const wgslPatterns: PatternDef[] = [
  // High weight (3)
  { pattern: /@fragment/, weight: 3 },
  { pattern: /@vertex/, weight: 3 },
  { pattern: /@compute/, weight: 3 },
  { pattern: /@workgroup_size/, weight: 3 },
  { pattern: /@group\s*\(/, weight: 3 },
  { pattern: /@binding\s*\(/, weight: 3 },
  { pattern: /fn\s+vs_main/, weight: 3 },
  { pattern: /fn\s+fs_main/, weight: 3 },
  // Medium weight (2)
  { pattern: /var<uniform>/, weight: 2 },
  { pattern: /var<storage/, weight: 2 },
  { pattern: /struct\s+Uniforms/, weight: 2 },
  { pattern: /vec2f/, weight: 2 },
  { pattern: /vec3f/, weight: 2 },
  { pattern: /vec4f/, weight: 2 },
  { pattern: /mat4x4f/, weight: 2 },
  // Low weight (1)
  { pattern: /f32/, weight: 1 },
  { pattern: /u32/, weight: 1 },
  { pattern: /i32/, weight: 1 },
  { pattern: /vec2<f32>/, weight: 1 },
  { pattern: /vec3<f32>/, weight: 1 },
  { pattern: /vec4<f32>/, weight: 1 },
  { pattern: /array</, weight: 1 },
  { pattern: /textureSample/, weight: 1 },
]

// Special: void main() only counts for GLSL if also has gl_ or uniform
const glslVoidMainPattern = /void\s+main\s*\(\s*\)/
const glslContextPattern = /gl_|uniform/

function scoreEngine(code: string, patterns: PatternDef[]): number {
  let score = 0
  for (const { pattern, weight } of patterns) {
    if (pattern.test(code)) {
      score += weight
    }
  }
  return score
}

function maxPossibleScore(patterns: PatternDef[]): number {
  let total = 0
  for (const { weight } of patterns) {
    total += weight
  }
  return total
}

const p5jsMaxScore = maxPossibleScore(p5jsPatterns)
const glslMaxScore = maxPossibleScore(glslPatterns) + 3 // +3 for void main() special case
const wgslMaxScore = maxPossibleScore(wgslPatterns)

export function detectEngine(code: string): { engine: EngineType; confidence: number } {
  if (!code.trim()) {
    return { engine: 'p5js', confidence: 0 }
  }

  const p5Score = scoreEngine(code, p5jsPatterns)

  let glslScore = scoreEngine(code, glslPatterns)
  // Special handling: void main() counts as high weight only if GLSL context present
  if (glslVoidMainPattern.test(code) && glslContextPattern.test(code)) {
    glslScore += 3
  }

  const wgslScore = scoreEngine(code, wgslPatterns)

  const p5Confidence = p5jsMaxScore > 0 ? p5Score / p5jsMaxScore : 0
  const glslConfidence = glslMaxScore > 0 ? glslScore / glslMaxScore : 0
  const wgslConfidence = wgslMaxScore > 0 ? wgslScore / wgslMaxScore : 0

  if (p5Score === 0 && glslScore === 0 && wgslScore === 0) {
    return { engine: 'p5js', confidence: 0 }
  }

  const scores: Array<{ engine: EngineType; confidence: number }> = [
    { engine: 'p5js', confidence: p5Confidence },
    { engine: 'glsl', confidence: glslConfidence },
    { engine: 'webgpu', confidence: wgslConfidence },
  ]

  scores.sort((a, b) => b.confidence - a.confidence)

  return scores[0]
}
