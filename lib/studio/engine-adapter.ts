import type { EngineType } from './types'

export function createEngineLabel(engine: EngineType): string {
  switch (engine) {
    case 'p5js':
      return 'p5.js'
    case 'glsl':
      return 'GLSL'
    case 'webgpu':
      return 'WebGPU'
    default: {
      const _exhaustive: never = engine
      return _exhaustive
    }
  }
}

export function getEngineColor(engine: EngineType): string {
  switch (engine) {
    case 'p5js':
      return '#ed225d'
    case 'glsl':
      return '#5586a4'
    case 'webgpu':
      return '#4285f4'
    default: {
      const _exhaustive: never = engine
      return _exhaustive
    }
  }
}

export function getSupportedEngines(): EngineType[] {
  return ['p5js', 'glsl', 'webgpu']
}

export function getEngineFileExtension(engine: EngineType): string {
  switch (engine) {
    case 'p5js':
      return '.js'
    case 'glsl':
      return '.glsl'
    case 'webgpu':
      return '.wgsl'
    default: {
      const _exhaustive: never = engine
      return _exhaustive
    }
  }
}

export function getMonacoLanguage(engine: EngineType): string {
  switch (engine) {
    case 'p5js':
      return 'javascript'
    case 'glsl':
      return 'glsl'
    case 'webgpu':
      return 'wgsl'
    default: {
      const _exhaustive: never = engine
      return _exhaustive
    }
  }
}

export function getEngineDescription(engine: EngineType): string {
  switch (engine) {
    case 'p5js':
      return 'JavaScript creative coding'
    case 'glsl':
      return 'Fragment shaders'
    case 'webgpu':
      return 'Compute shaders'
    default: {
      const _exhaustive: never = engine
      return _exhaustive
    }
  }
}
