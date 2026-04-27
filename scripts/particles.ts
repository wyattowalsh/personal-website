import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { logger } from '../lib/logger';
import { z } from 'zod';

// Define a schema for numbers or objects with min and max
const NumberOrMinMaxSchema = z.union([
  z.number(),
  z.object({
    min: z.number(),
    max: z.number(),
  }),
]);

// Update ColorSchema to accept object with 'value' property
const ColorSchema = z.union([
  z.string(),
  z.array(z.string()),
  z.object({
    value: z.union([
      z.string(),
      z.array(z.string()),
    ]),
  }),
]);

// Define the background schema
const BackgroundSchema = z.object({
  color: ColorSchema.optional(),
  image: z.string().optional(),
  position: z.string().optional(),
  repeat: z.string().optional(),
  size: z.string().optional(),
  opacity: z.number().min(0).max(1).optional(),
});

// Define the particle number density schema
const DensitySchema = z.object({
  enable: z.boolean().optional(),
  area: z.number().positive().optional(),
});

// Define the particle number schema
const NumberSchema = z.object({
  value: z.number().positive().optional(),
  density: DensitySchema.optional(),
});

// Update ShapeSchema to accept any string or array of strings
const ShapeSchema = z.object({
  type: z.union([
    z.string(),
    z.array(z.string()),
  ]).optional(),
  character: z.object({
    value: z.union([z.string(), z.array(z.string())]),
    font: z.string().optional(),
    style: z.string().optional(),
    weight: z.string().optional(),
    fill: z.boolean().optional(),
  }).optional(),
  image: z.union([
    z.object({
      src: z.string(),
      width: z.number().optional(),
      height: z.number().optional(),
    }),
    z.array(
      z.object({
        src: z.string(),
        width: z.number().optional(),
        height: z.number().optional(),
      })
    ),
  ]).optional(),
  options: z.record(z.string(), z.any()).optional(),
}).passthrough();

const LEGACY_SHAPE_KEYS = ['character', 'image', 'polygon', 'stroke'] as const;

export function findLegacyShapeKeys(shape: unknown): string[] {
  if (!shape || typeof shape !== 'object' || Array.isArray(shape)) {
    return [];
  }

  const shapeRecord = shape as Record<string, unknown>;
  return LEGACY_SHAPE_KEYS.filter((key) => key in shapeRecord);
}

// Define the animation schemas
const AnimationSchema = z.object({
  enable: z.boolean().optional(),
  speed: z.number().optional(),
  minimumValue: z.number().optional(),
  sync: z.boolean().optional(),
});

const OpacitySchema = z.object({
  value: NumberOrMinMaxSchema.optional(),
  random: z.union([z.boolean(), z.object({ enable: z.boolean(), minimumValue: z.number() })]).optional(),
  anim: AnimationSchema.optional(),
  animation: AnimationSchema.optional(),
});

const SizeSchema = z.object({
  value: NumberOrMinMaxSchema.optional(),
  random: z.union([z.boolean(), z.object({ enable: z.boolean(), minimumValue: z.number() })]).optional(),
  anim: AnimationSchema.optional(),
  animation: AnimationSchema.optional(),
});

// Adjusted MoveSchema to accept speed as number or object with min and max
const MoveSchema = z.object({
  enable: z.boolean().optional(),
  speed: NumberOrMinMaxSchema.optional(),
  direction: z.string().optional(),
  random: z.boolean().optional(),
  straight: z.boolean().optional(),
  outModes: z.union([
    z.string(),
    z.object({
      default: z.string().optional(),
      left: z.string().optional(),
      right: z.string().optional(),
      top: z.string().optional(),
      bottom: z.string().optional(),
    }),
  ]).optional(),
  trail: z.object({
    enable: z.boolean().optional(),
    length: z.number().optional(),
    fillColor: z.string().optional(),
  }).optional(),
  gravity: z.object({
    enable: z.boolean().optional(),
    acceleration: z.number().optional(),
  }).optional(),
  path: z.object({
    enable: z.boolean().optional(),
    delay: z.union([z.number(), z.object({ value: z.number() })]).optional(),
    generator: z.string().optional(),
    options: z.record(z.string(), z.any()).optional(),
  }).optional(),
  attract: z.object({
    enable: z.boolean().optional(),
    rotateX: z.number().optional(),
    rotateY: z.number().optional(),
    rotate: z.object({
      x: z.number().optional(),
      y: z.number().optional(),
    }).optional(),
  }).optional(),
});

// Update particles schema to include adjusted schemas
// Using passthrough() for Zod 4.x compatibility
const ParticlesSchema = z.object({
  number: NumberSchema.optional(),
  color: z.object({
    value: ColorSchema,
  }).passthrough().optional(),
  shape: ShapeSchema.optional(),
  opacity: OpacitySchema.optional(),
  size: SizeSchema.optional(),
  links: z.object({
    enable: z.boolean().optional(),
    distance: z.number().positive().optional(),
    color: ColorSchema.optional(),
    opacity: z.number().min(0).max(1).optional(),
    width: z.number().positive().optional(),
    shadow: z.object({
      enable: z.boolean().optional(),
      blur: z.number().optional(),
      color: z.string().optional(),
    }).passthrough().optional(),
  }).passthrough().optional(),
  move: MoveSchema.optional(),
  zIndex: z.object({
    value: NumberOrMinMaxSchema.optional(),
    opacityRate: z.number().optional(),
  }).optional(),
  shadow: z.object({
    enable: z.boolean().optional(),
    color: z.string().optional(),
    blur: z.number().optional(),
    offset: z.object({
      x: z.number().optional(),
      y: z.number().optional(),
    }).optional(),
  }).optional(),
  stroke: z.object({
    width: z.number().optional(),
    color: ColorSchema.optional(),
    opacity: z.number().min(0).max(1).optional(),
  }).passthrough().optional(),
  life: z.object({
    count: z.number().optional(),
    delay: z.object({
      value: NumberOrMinMaxSchema.optional(),
      random: z.object({
        enable: z.boolean().optional(),
        minimumValue: z.number().optional(),
      }).optional(),
    }).optional(),
    duration: z.object({
      value: NumberOrMinMaxSchema.optional(),
      random: z.object({
        enable: z.boolean().optional(),
        minimumValue: z.number().optional(),
      }).optional(),
    }).optional(),
  }).optional(),
  rotate: z.object({
    value: NumberOrMinMaxSchema.optional(),
    random: z.boolean().optional(),
    direction: z.string().optional(),
    animation: AnimationSchema.optional(),
  }).optional(),
  twinkle: z.object({
    particles: z.object({
      enable: z.boolean().optional(),
      frequency: z.number().optional(),
      opacity: z.number().optional(),
      color: z.string().optional(),
    }).optional(),
    lines: z.object({
      enable: z.boolean().optional(),
      frequency: z.number().optional(),
      opacity: z.number().optional(),
      color: z.string().optional(),
    }).optional(),
  }).optional(),
});

// Define the interactivity schema (adjusted as needed)
const InteractivitySchema = z.object({
  detectsOn: z.string().optional(),
  events: z.object({
    onHover: z.object({
      enable: z.boolean().optional(),
      mode: z.union([z.string(), z.array(z.string())]).optional(),
      parallax: z.object({
        enable: z.boolean().optional(),
        force: z.number().optional(),
        smooth: z.number().optional(),
      }).optional(),
    }).optional(),
    onClick: z.object({
      enable: z.boolean().optional(),
      mode: z.union([z.string(), z.array(z.string())]).optional(),
    }).optional(),
    resize: z.boolean().optional(),
  }).optional(),
  modes: z.object({
    grab: z.object({
      distance: z.number().optional(),
      links: z.object({
        opacity: z.number().optional(),
        color: ColorSchema.optional(),
      }).optional(),
    }).optional(),
    bubble: z.object({
      distance: z.number().optional(),
      size: z.number().optional(),
      duration: z.number().optional(),
      opacity: z.number().optional(),
      color: ColorSchema.optional(),
    }).optional(),
    repulse: z.object({
      distance: z.number().optional(),
      duration: z.number().optional(),
      speed: z.number().optional(),
      factor: z.number().optional(),
      maxSpeed: z.number().optional(),
      easing: z.string().optional(),
    }).optional(),
    push: z.object({
      quantity: z.number().optional(),
    }).optional(),
    remove: z.object({
      quantity: z.number().optional(),
    }).optional(),
    attract: z.object({
      distance: z.number().optional(),
      duration: z.number().optional(),
      factor: z.number().optional(),
      maxSpeed: z.number().optional(),
      easing: z.string().optional(),
    }).optional(),
    connect: z.object({
      distance: z.number().optional(),
      links: z.object({
        opacity: z.number().optional(),
      }).optional(),
      radius: z.number().optional(),
    }).optional(),
  }).optional(),
});

// Add missing schemas
const ThemeSchema = z.object({
  name: z.string(),
  default: z.object({
    value: z.boolean().optional(),
    mode: z.string().optional()
  }).optional(),
  options: z.any().optional()
});

const FullScreenSchema = z.union([
  z.boolean(),
  z.object({
    enable: z.boolean().optional(),
    zIndex: z.number().optional()
  })
]);

// TsParticlesConfigSchema matches IOptions interface
// passthrough() allows unknown fields from newer tsparticles versions
const TsParticlesConfigSchema = z.object({
  autoPlay: z.boolean().optional(),
  background: BackgroundSchema.optional(),
  backgroundMask: z.object({
    cover: z.object({
      color: ColorSchema.optional(),
      opacity: z.number().optional()
    }).passthrough().optional(),
    enable: z.boolean().optional()
  }).passthrough().optional(),
  clear: z.boolean().optional(),
  delay: NumberOrMinMaxSchema.optional(),
  detectRetina: z.boolean().optional(),
  duration: NumberOrMinMaxSchema.optional(),
  fpsLimit: z.number().optional(),
  fullScreen: FullScreenSchema.optional(),
  interactivity: InteractivitySchema.optional(),
  key: z.string().optional(),
  manualParticles: z.array(z.any()).optional(),
  name: z.string().optional(),
  particles: ParticlesSchema.optional(),
  pauseOnBlur: z.boolean().optional(),
  pauseOnOutsideViewport: z.boolean().optional(),
  preset: z.union([
    z.string(),
    z.array(z.string())
  ]).optional(),
  responsive: z.array(z.object({
    maxWidth: z.number(),
    options: z.any(),
    mode: z.string().optional()
  }).passthrough()).optional(),
  smooth: z.boolean().optional(),
  style: z.record(z.string(), z.any()).optional(),
  themes: z.array(ThemeSchema).optional(),
  zLayers: z.number().optional()
}).passthrough();

interface ParticleConfig {
  url: string;
  hash: string;
  theme: string;
}

type Theme = 'light' | 'dark';

async function calculateFileHash(filePath: string): Promise<string> {
  const content = await fs.readFile(filePath);
  return crypto.createHash('md5').update(content).digest('hex');
}

async function readFileIfExists(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

function renderParticleConfigModule(configs: Record<Theme, ParticleConfig[]>): string {
  return `// This file is auto-generated. Do not edit manually.

type ParticleConfig = {
  url: string;
  hash: string;
  theme: string;
};

export const configUrls: Record<'light' | 'dark', readonly ParticleConfig[]> = ${JSON.stringify(
    configs,
    null,
    2
  )} as const;
`;
}

// Validate particle config files against the full Zod schema
export async function validateParticleConfig(filePath: string): Promise<void> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const json = JSON.parse(content);

    // Full Zod schema validation (two-argument z.record() and .passthrough() are v4-compatible)
    const result = TsParticlesConfigSchema.safeParse(json);
    if (!result.success) {
      const issues = result.error.issues
        .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
        .join('\n');
      throw new Error(
        `Schema validation failed for ${path.basename(filePath)}:\n${issues}`
      );
    }

    const legacyShapeKeys = findLegacyShapeKeys(json.particles?.shape);
    if (legacyShapeKeys.length > 0) {
      throw new Error(
        `Legacy particle shape keys are not supported in ${path.basename(filePath)}: ${legacyShapeKeys.map((key) => `shape.${key}`).join(', ')}. Use particles.shape.options.{type} and particles.stroke instead.`
      );
    }

    // Additional validation for background image paths if present
    if (json.background?.image) {
      const imagePath = path.join(process.cwd(), 'public', json.background.image);
      try {
        await fs.access(imagePath);
      } catch {
        throw new Error(`Background image not found: ${json.background.image}`);
      }
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(
        `Invalid JSON in ${path.basename(filePath)}: ${error.message}`
      );
    }
    throw error;
  }
}

export async function generateParticleConfigs(options?: { write?: boolean }): Promise<string> {
  const startTime = Date.now();
  const shouldWrite = options?.write ?? false;
  
  try {
    logger.info('Generating particle configurations');
    
    const publicDir = path.join(process.cwd(), 'public');
    const particlesDir = path.join(publicDir, 'particles');
    const outputDir = path.join(process.cwd(), 'components', 'particles');
    const outputPath = path.join(outputDir, 'configUrls.ts');

    // Process themes
    const themes = ['light', 'dark'] as const;
    const configs: Record<Theme, ParticleConfig[]> = {
      light: [],
      dark: [],
    };

    for (const theme of themes) {
      logger.info(`Processing ${theme} theme`);
      const themeDir = path.join(particlesDir, theme);
      
      try {
        const files = await fs.readdir(themeDir);
        const jsonFiles = files
          .filter((file) => file.endsWith('.json'))
          .sort((left, right) => left.localeCompare(right));
        
        logger.debug(`Found ${jsonFiles.length} configs for ${theme} theme`);

        for (const [index, file] of jsonFiles.entries()) {
          try {
            logger.info(`Validating ${file} (${index + 1}/${jsonFiles.length})`);
            const filePath = path.join(themeDir, file);

            try {
              await validateParticleConfig(filePath);
              const hash = await calculateFileHash(filePath);

              configs[theme].push({
                url: `/particles/${theme}/${file}`,
                hash,
                theme,
              });

              logger.success(`Validated particle config: ${file}`);
            } catch (error) {
              logger.error(`Validation failed for ${file}:`, error as Error);
            }
          } catch (error) {
            logger.error(`Validation failed for ${file}:`, error as Error);
          }
        }
      } catch (error) {
        logger.error(`Error processing theme ${theme}:`, error as Error);
      }
    }

    // Ensure at least one config exists for each theme
    if (configs.light.length === 0 || configs.dark.length === 0) {
      throw new Error(
        'No valid particle configurations found for one or both themes'
      );
    }

    configs.light.sort((left, right) => left.url.localeCompare(right.url));
    configs.dark.sort((left, right) => left.url.localeCompare(right.url));

    const code = renderParticleConfigModule(configs);
    const existingCode = await readFileIfExists(outputPath);

    if (existingCode === code) {
      logger.info(`Particle config metadata is up to date: ${outputPath}`);
      return outputPath;
    }

    if (!shouldWrite) {
      throw new Error(
        `Generated particle config metadata is out of date: ${path.relative(process.cwd(), outputPath)}. Run "pnpm preprocess:write" to update tracked generated files explicitly.`
      );
    }

    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(outputPath, code, 'utf-8');
    logger.success(`Generated particle configs at ${outputPath}`);

    const duration = Date.now() - startTime;
    logger.timing('Particle config generation', duration);
    logger.success('Generated particle configurations', {
      light: configs.light.length,
      dark: configs.dark.length
    });
    return outputPath;
  } catch (error) {
    logger.error('Failed to generate particle configs:', error as Error);
    throw error;
  }
}

// Export the schema for use in other files
export { TsParticlesConfigSchema };
