import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { logger } from '../../lib/utils/logger';
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
});

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
    options: z.record(z.any()).optional(),
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
const ParticlesSchema = z.object({
  number: NumberSchema.optional(),
  color: z.object({
    value: ColorSchema,
  }).optional(),
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
    }).optional(),
  }).optional(),
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

// Update the full configuration schema
const TsParticlesConfigSchema = z.object({
  background: BackgroundSchema.optional(),
  particles: ParticlesSchema.optional(),
  interactivity: InteractivitySchema.optional(),
  detectRetina: z.boolean().optional(),
  fullScreen: z.union([
    z.boolean(),
    z.object({
      enable: z.boolean().optional(),
      zIndex: z.number().optional(),
    }),
  ]).optional(),
  fpsLimit: z.number().optional(),
  smooth: z.boolean().optional(),
  pauseOnBlur: z.boolean().optional(),
  pauseOnOutsideViewport: z.boolean().optional(),
  themes: z.array(
    z.object({
      name: z.string(),
      default: z.object({
        value: z.boolean().optional(),
        mode: z.string().optional(),
      }).optional(),
      options: z.any().optional(),
    })
  ).optional(),
  responsive: z.array(
    z.object({
      maxWidth: z.number().optional(),
      options: z.any().optional(),
      mode: z.string().optional(),
    })
  ).optional(),
});

interface ParticleConfig {
  url: string;
  hash: string;
  lastModified: string;
  theme: string;
}

type Theme = 'light' | 'dark';

async function calculateFileHash(filePath: string): Promise<string> {
  const content = await fs.readFile(filePath);
  return crypto.createHash('md5').update(content).digest('hex');
}

async function validateParticleConfig(filePath: string): Promise<void> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const json = JSON.parse(content);

    // Validate the configuration
    const result = TsParticlesConfigSchema.safeParse(json);

    if (!result.success) {
      const errorDetails = result.error.issues
        .map(
          (issue) => `  - ${issue.path.join('.')}: ${issue.message}`
        )
        .join('\n');

      throw new Error(
        `Invalid particle configuration in ${path.basename(
          filePath
        )}:\n${errorDetails}`
      );
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

export async function generateParticleConfigs(): Promise<string> {
  try {
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
      const themeDir = path.join(particlesDir, theme);
      try {
        const files = await fs.readdir(themeDir);
        const jsonFiles = files.filter((file) => file.endsWith('.json'));

        for (const file of jsonFiles) {
          const filePath = path.join(themeDir, file);

          try {
            await validateParticleConfig(filePath);
            const stats = await fs.stat(filePath);
            const hash = await calculateFileHash(filePath);

            configs[theme].push({
              url: `/particles/${theme}/${file}`,
              hash,
              lastModified: stats.mtime.toISOString(),
              theme,
            });

            logger.success(`Validated particle config: ${file}`);
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

    // Generate TypeScript code
    const code = `// This file is auto-generated. Do not edit manually.
// Last generated: ${new Date().toISOString()}

import { type ISourceOptions } from "@tsparticles/engine";

type ParticleConfig = {
  url: string;
  hash: string;
  lastModified: string;
  theme: string;
};

export const configUrls: Record<'light' | 'dark', readonly ParticleConfig[]> = ${JSON.stringify(
      configs,
      null,
      2
    )} as const;`;

    // Ensure output directory exists and write file
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(outputPath, code, 'utf-8');
    logger.success(`Generated particle configs at ${outputPath}`);

    return outputPath;
  } catch (error) {
    logger.error('Failed to generate particle configs:', error as Error);
    throw error;
  }
}

// Export the schema for use in other files
export { TsParticlesConfigSchema };