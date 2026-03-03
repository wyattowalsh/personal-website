export interface CompletionItem {
  label: string
  type: 'variable' | 'function' | 'keyword' | 'type'
  detail?: string
  info?: string
}

export const glslCompletions: CompletionItem[] = [
  // Shadertoy uniforms
  { label: 'iTime', type: 'variable', detail: 'float', info: 'Elapsed time in seconds' },
  { label: 'iResolution', type: 'variable', detail: 'vec3', info: 'Viewport resolution (width, height, aspect)' },
  { label: 'iMouse', type: 'variable', detail: 'vec4', info: 'Mouse position (xy: current, zw: click)' },
  { label: 'iFrame', type: 'variable', detail: 'int', info: 'Current frame number' },
  { label: 'iDate', type: 'variable', detail: 'vec4', info: 'Year, month, day, seconds' },
  { label: 'iTimeDelta', type: 'variable', detail: 'float', info: 'Time since last frame' },
  { label: 'iChannel0', type: 'variable', detail: 'sampler2D', info: 'Input texture channel 0' },
  { label: 'iChannel1', type: 'variable', detail: 'sampler2D', info: 'Input texture channel 1' },
  { label: 'iChannel2', type: 'variable', detail: 'sampler2D', info: 'Input texture channel 2' },
  { label: 'iChannel3', type: 'variable', detail: 'sampler2D', info: 'Input texture channel 3' },

  // GLSL types
  { label: 'vec2', type: 'type', info: '2-component float vector' },
  { label: 'vec3', type: 'type', info: '3-component float vector' },
  { label: 'vec4', type: 'type', info: '4-component float vector' },
  { label: 'mat2', type: 'type', info: '2x2 float matrix' },
  { label: 'mat3', type: 'type', info: '3x3 float matrix' },
  { label: 'mat4', type: 'type', info: '4x4 float matrix' },
  { label: 'ivec2', type: 'type', info: '2-component integer vector' },
  { label: 'ivec3', type: 'type', info: '3-component integer vector' },
  { label: 'ivec4', type: 'type', info: '4-component integer vector' },
  { label: 'bvec2', type: 'type', info: '2-component boolean vector' },
  { label: 'bvec3', type: 'type', info: '3-component boolean vector' },
  { label: 'bvec4', type: 'type', info: '4-component boolean vector' },
  { label: 'sampler2D', type: 'type', info: '2D texture sampler' },
  { label: 'samplerCube', type: 'type', info: 'Cube map texture sampler' },

  // GLSL builtin functions
  { label: 'smoothstep', type: 'function', detail: 'float smoothstep(float edge0, float edge1, float x)', info: 'Hermite interpolation between two values' },
  { label: 'mix', type: 'function', detail: 'genType mix(genType x, genType y, float a)', info: 'Linear interpolation' },
  { label: 'clamp', type: 'function', detail: 'genType clamp(genType x, float min, float max)', info: 'Clamp value to range' },
  { label: 'distance', type: 'function', detail: 'float distance(genType p0, genType p1)', info: 'Distance between two points' },
  { label: 'length', type: 'function', detail: 'float length(genType x)', info: 'Length of a vector' },
  { label: 'normalize', type: 'function', detail: 'genType normalize(genType x)', info: 'Normalize a vector' },
  { label: 'reflect', type: 'function', detail: 'genType reflect(genType I, genType N)', info: 'Reflect incident vector' },
  { label: 'refract', type: 'function', detail: 'genType refract(genType I, genType N, float eta)', info: 'Refract incident vector' },
  { label: 'cross', type: 'function', detail: 'vec3 cross(vec3 x, vec3 y)', info: 'Cross product of two vectors' },
  { label: 'dot', type: 'function', detail: 'float dot(genType x, genType y)', info: 'Dot product of two vectors' },
  { label: 'min', type: 'function', detail: 'genType min(genType x, genType y)', info: 'Minimum value' },
  { label: 'max', type: 'function', detail: 'genType max(genType x, genType y)', info: 'Maximum value' },
  { label: 'abs', type: 'function', detail: 'genType abs(genType x)', info: 'Absolute value' },
  { label: 'fract', type: 'function', detail: 'genType fract(genType x)', info: 'Fractional part' },
  { label: 'mod', type: 'function', detail: 'genType mod(genType x, float y)', info: 'Modulo' },
  { label: 'step', type: 'function', detail: 'genType step(float edge, genType x)', info: 'Step function' },
  { label: 'sin', type: 'function', detail: 'genType sin(genType angle)', info: 'Sine' },
  { label: 'cos', type: 'function', detail: 'genType cos(genType angle)', info: 'Cosine' },
  { label: 'tan', type: 'function', detail: 'genType tan(genType angle)', info: 'Tangent' },
  { label: 'atan', type: 'function', detail: 'genType atan(genType y, genType x)', info: 'Arc tangent' },
  { label: 'pow', type: 'function', detail: 'genType pow(genType x, genType y)', info: 'Power' },
  { label: 'exp', type: 'function', detail: 'genType exp(genType x)', info: 'Exponential' },
  { label: 'log', type: 'function', detail: 'genType log(genType x)', info: 'Natural logarithm' },
  { label: 'sqrt', type: 'function', detail: 'genType sqrt(genType x)', info: 'Square root' },
  { label: 'inversesqrt', type: 'function', detail: 'genType inversesqrt(genType x)', info: 'Inverse square root' },
  { label: 'texture', type: 'function', detail: 'vec4 texture(sampler2D s, vec2 coord)', info: 'Texture lookup' },
  { label: 'floor', type: 'function', detail: 'genType floor(genType x)', info: 'Floor' },
  { label: 'ceil', type: 'function', detail: 'genType ceil(genType x)', info: 'Ceiling' },
  { label: 'sign', type: 'function', detail: 'genType sign(genType x)', info: 'Sign of value' },
  { label: 'mainImage', type: 'function', detail: 'void mainImage(out vec4 fragColor, in vec2 fragCoord)', info: 'Shadertoy entry point' },

  // GLSL qualifiers
  { label: 'uniform', type: 'keyword', info: 'Uniform variable qualifier' },
  { label: 'varying', type: 'keyword', info: 'Varying variable qualifier' },
  { label: 'in', type: 'keyword', info: 'Input parameter qualifier' },
  { label: 'out', type: 'keyword', info: 'Output parameter qualifier' },
  { label: 'inout', type: 'keyword', info: 'Input/output parameter qualifier' },
  { label: 'precision', type: 'keyword', info: 'Precision qualifier' },
  { label: 'highp', type: 'keyword', info: 'High precision' },
  { label: 'mediump', type: 'keyword', info: 'Medium precision' },
  { label: 'lowp', type: 'keyword', info: 'Low precision' },
  { label: 'const', type: 'keyword', info: 'Constant qualifier' },
  { label: 'void', type: 'keyword', info: 'Void type' },
  { label: 'float', type: 'keyword', info: 'Float type' },
  { label: 'int', type: 'keyword', info: 'Integer type' },
  { label: 'bool', type: 'keyword', info: 'Boolean type' },
]
