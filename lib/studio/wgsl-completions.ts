import type { CompletionItem } from './glsl-completions'

export const wgslCompletions: CompletionItem[] = [
  // Attributes
  { label: '@compute', type: 'keyword', info: 'Marks a function as a compute shader entry point' },
  { label: '@workgroup_size', type: 'keyword', info: 'Specifies the workgroup dimensions' },
  { label: '@binding', type: 'keyword', info: 'Resource binding index' },
  { label: '@group', type: 'keyword', info: 'Bind group index' },
  { label: '@builtin', type: 'keyword', info: 'Access to built-in values' },
  { label: '@vertex', type: 'keyword', info: 'Marks a function as a vertex shader entry point' },
  { label: '@fragment', type: 'keyword', info: 'Marks a function as a fragment shader entry point' },
  { label: '@location', type: 'keyword', info: 'Inter-stage data location' },

  // Built-in values
  { label: 'global_invocation_id', type: 'variable', detail: 'vec3u', info: 'Global compute invocation ID' },
  { label: 'local_invocation_id', type: 'variable', detail: 'vec3u', info: 'Local workgroup invocation ID' },
  { label: 'workgroup_id', type: 'variable', detail: 'vec3u', info: 'Workgroup ID' },
  { label: 'num_workgroups', type: 'variable', detail: 'vec3u', info: 'Number of workgroups dispatched' },
  { label: 'position', type: 'variable', detail: 'vec4f', info: 'Clip-space position' },
  { label: 'vertex_index', type: 'variable', detail: 'u32', info: 'Vertex index' },
  { label: 'instance_index', type: 'variable', detail: 'u32', info: 'Instance index' },

  // Types
  { label: 'vec2f', type: 'type', info: '2-component f32 vector' },
  { label: 'vec3f', type: 'type', info: '3-component f32 vector' },
  { label: 'vec4f', type: 'type', info: '4-component f32 vector' },
  { label: 'vec2u', type: 'type', info: '2-component u32 vector' },
  { label: 'vec3u', type: 'type', info: '3-component u32 vector' },
  { label: 'vec4u', type: 'type', info: '4-component u32 vector' },
  { label: 'vec2i', type: 'type', info: '2-component i32 vector' },
  { label: 'vec3i', type: 'type', info: '3-component i32 vector' },
  { label: 'vec4i', type: 'type', info: '4-component i32 vector' },
  { label: 'mat2x2f', type: 'type', info: '2x2 f32 matrix' },
  { label: 'mat3x3f', type: 'type', info: '3x3 f32 matrix' },
  { label: 'mat4x4f', type: 'type', info: '4x4 f32 matrix' },
  { label: 'f32', type: 'type', info: '32-bit float' },
  { label: 'u32', type: 'type', info: '32-bit unsigned integer' },
  { label: 'i32', type: 'type', info: '32-bit signed integer' },
  { label: 'bool', type: 'type', info: 'Boolean type' },
  { label: 'array', type: 'type', info: 'Runtime-sized or fixed-size array' },

  // Address spaces
  { label: 'uniform', type: 'keyword', info: 'Uniform address space' },
  { label: 'storage', type: 'keyword', info: 'Storage buffer address space' },
  { label: 'private', type: 'keyword', info: 'Per-invocation private address space' },
  { label: 'workgroup', type: 'keyword', info: 'Shared workgroup address space' },
  { label: 'read', type: 'keyword', info: 'Read-only access mode' },
  { label: 'read_write', type: 'keyword', info: 'Read-write access mode' },
  { label: 'write', type: 'keyword', info: 'Write-only access mode' },

  // Texture and storage functions
  { label: 'textureStore', type: 'function', detail: 'textureStore(t, coords, value)', info: 'Write to a storage texture' },
  { label: 'textureLoad', type: 'function', detail: 'textureLoad(t, coords, level)', info: 'Read from a texture' },
  { label: 'textureSample', type: 'function', detail: 'textureSample(t, s, coords)', info: 'Sample a texture' },
  { label: 'textureDimensions', type: 'function', detail: 'textureDimensions(t)', info: 'Get texture dimensions' },

  // Atomic functions
  { label: 'atomicAdd', type: 'function', detail: 'atomicAdd(ptr, value)', info: 'Atomic addition' },
  { label: 'atomicSub', type: 'function', detail: 'atomicSub(ptr, value)', info: 'Atomic subtraction' },
  { label: 'atomicMax', type: 'function', detail: 'atomicMax(ptr, value)', info: 'Atomic maximum' },
  { label: 'atomicMin', type: 'function', detail: 'atomicMin(ptr, value)', info: 'Atomic minimum' },
  { label: 'atomicLoad', type: 'function', detail: 'atomicLoad(ptr)', info: 'Atomic load' },
  { label: 'atomicStore', type: 'function', detail: 'atomicStore(ptr, value)', info: 'Atomic store' },

  // Math functions
  { label: 'abs', type: 'function', info: 'Absolute value' },
  { label: 'clamp', type: 'function', info: 'Clamp value to range' },
  { label: 'cos', type: 'function', info: 'Cosine' },
  { label: 'sin', type: 'function', info: 'Sine' },
  { label: 'tan', type: 'function', info: 'Tangent' },
  { label: 'dot', type: 'function', info: 'Dot product' },
  { label: 'cross', type: 'function', info: 'Cross product' },
  { label: 'distance', type: 'function', info: 'Distance between points' },
  { label: 'fract', type: 'function', info: 'Fractional part' },
  { label: 'floor', type: 'function', info: 'Floor' },
  { label: 'ceil', type: 'function', info: 'Ceiling' },
  { label: 'length', type: 'function', info: 'Vector length' },
  { label: 'max', type: 'function', info: 'Maximum' },
  { label: 'min', type: 'function', info: 'Minimum' },
  { label: 'mix', type: 'function', info: 'Linear interpolation' },
  { label: 'normalize', type: 'function', info: 'Normalize vector' },
  { label: 'pow', type: 'function', info: 'Power' },
  { label: 'smoothstep', type: 'function', info: 'Smooth Hermite interpolation' },
  { label: 'sqrt', type: 'function', info: 'Square root' },
  { label: 'step', type: 'function', info: 'Step function' },
  { label: 'select', type: 'function', info: 'Conditional select' },
  { label: 'arrayLength', type: 'function', info: 'Get runtime array length' },

  // Synchronization
  { label: 'workgroupBarrier', type: 'function', info: 'Synchronize workgroup invocations' },
  { label: 'storageBarrier', type: 'function', info: 'Memory barrier for storage' },

  // Keywords
  { label: 'struct', type: 'keyword', info: 'Define a structure type' },
  { label: 'var', type: 'keyword', info: 'Declare a variable' },
  { label: 'let', type: 'keyword', info: 'Declare an immutable binding' },
  { label: 'const', type: 'keyword', info: 'Compile-time constant' },
  { label: 'fn', type: 'keyword', info: 'Function declaration' },
  { label: 'return', type: 'keyword', info: 'Return from function' },
  { label: 'if', type: 'keyword', info: 'Conditional statement' },
  { label: 'else', type: 'keyword', info: 'Else branch' },
  { label: 'for', type: 'keyword', info: 'For loop' },
  { label: 'loop', type: 'keyword', info: 'Infinite loop' },
  { label: 'break', type: 'keyword', info: 'Break out of loop' },
  { label: 'continue', type: 'keyword', info: 'Continue to next iteration' },
]
