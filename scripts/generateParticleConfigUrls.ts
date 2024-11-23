import fs from 'fs';
import path from 'path';
import { z } from 'zod';

const PARTICLES_DIR = path.join(process.cwd(), 'public/particles/');
const OUTPUT_FILE = path.join(process.cwd(), 'components/particles/configUrls.ts');

// Helper Types
const RangeValue = z.union([
  z.number(),
  z.object({
    min: z.number(),
    max: z.number()
  })
]);

const ColorSchema = z.union([
  z.string(),
  z.object({
    value: z.string(),
  }),
]);

const RecursivePartial = <T extends z.ZodTypeAny>(schema: T) => 
  z.lazy(() => z.union([schema, z.record(z.any())]));

const SingleOrMultiple = <T extends z.ZodTypeAny>(schema: T) => 
  z.union([schema, z.array(schema)]);

// Define the IOptions schema based on the documentation
const IOptionsSchema = z.object({
  // Core Properties
  autoPlay: z.boolean().optional(),
  background: z.object({
    color: ColorSchema.optional(),
    image: z.string().optional(),
    position: z.string().optional(),
    repeat: z.string().optional(),
    size: z.string().optional(),
    opacity: z.number().optional(),
  }).optional(),
  backgroundMask: z.object({
    enable: z.boolean(),
    cover: z.object({
      color: z.string(),
      opacity: z.number(),
    }).optional(),
  }).optional(),
  detectRetina: z.boolean().optional(),
  duration: RangeValue.optional(),
  fpsLimit: z.number().optional(),
  fullScreen: z.union([
    z.boolean(),
    RecursivePartial(
      z.object({
        enable: z.boolean().optional(),
        zIndex: z.number().optional(),
      })
    ),
  ]).optional(),
  interactivity: z.object({
    detectsOn: z.string().optional(),
    events: z.object({
      onHover: z.object({
        enable: z.boolean(),
        mode: SingleOrMultiple(z.string()),
      }).optional(),
      onClick: z.object({
        enable: z.boolean(),
        mode: SingleOrMultiple(z.string()),
      }).optional(),
      resize: z.boolean().optional(),
    }).optional(),
    modes: z.record(z.any()).optional(),
  }).optional(),
  manualParticles: z.array(
    z.object({
      position: z.object({
        x: z.number(),
        y: z.number(),
      }).optional(),
      options: z.record(z.any()).optional(),
    })
  ).optional(),
  particles: z.object({}).passthrough(), // Accept any additional particle options
  pauseOnBlur: z.boolean().optional(),
  pauseOnOutsideViewport: z.boolean().optional(),
  preset: SingleOrMultiple(z.string()).optional(),
  responsive: z.array(
    z.object({
      breakpoint: z.number(),
      options: z.record(z.any()),
    })
  ).optional(),
  smooth: z.boolean().optional(),
  style: RecursivePartial(z.record(z.any())).optional(),
  themes: z.array(
    z.object({
      name: z.string(),
      default: z.object({
        value: z.boolean(),
        mode: z.string().optional(),
      }).optional(),
      options: z.record(z.any()).optional(),
    })
  ).optional(),
  zLayers: z.number().optional(),
  // Plugin Options (absorbers, emitters, polygonMask)
  absorbers: z.union([z.record(z.any()), z.array(z.record(z.any()))]).optional(),
  emitters: z.union([z.record(z.any()), z.array(z.record(z.any()))]).optional(),
  polygonMask: z.record(z.any()).optional(),
  // Index signature for additional properties
}).passthrough();

async function generateConfigUrls() {
  try {
    console.log('\n🚀 Starting particle config URL generation...\n');
    
    const themes = ['light', 'dark'];
    const configUrls: Record<string, string[]> = {};

    // Create themes directory if it doesn't exist
    await fs.promises.mkdir(PARTICLES_DIR, { recursive: true });
    console.log(`📁 Particles directory: ${PARTICLES_DIR}`);

    for (const theme of themes) {
      const themePath = path.join(PARTICLES_DIR, theme);
      configUrls[theme] = [];

      console.log(`\n🎨 Processing ${theme} theme...`);
      
      if (fs.existsSync(themePath)) {
        const files = await fs.promises.readdir(themePath);
        const jsonFiles = files.filter(f => f.endsWith('.json'));
        
        console.log(`📄 Found ${jsonFiles.length} JSON files in ${theme}`);

        // Process each JSON file
        for (const file of jsonFiles) {
          const filePath = path.join(themePath, file);
          try {
            // Read and parse JSON
            const content = await fs.promises.readFile(filePath, 'utf8');
            const config = JSON.parse(content);
            
            // Validate individual config
            const validationResult = IOptionsSchema.safeParse(config);
            if (!validationResult.success) {
              console.error(`❌ Invalid config in ${theme}/${file}:`, validationResult.error);
              continue;
            }

            // Add valid config
            const configUrl = `/particles/${theme}/${file}`;
            configUrls[theme].push(configUrl);
            console.log(`✅ Validated: ${configUrl}`);
          } catch (error) {
            console.error(`❌ Error processing ${theme}/${file}:`, error);
          }
        }
        
        console.log(`✨ ${theme}: processed ${configUrls[theme].length}/${jsonFiles.length} files`);
      } else {
        console.warn(`⚠️  Theme path does not exist: ${themePath}`);
        // Create theme directory if it doesn't exist
        await fs.promises.mkdir(themePath, { recursive: true });
        console.log(`📁 Created theme directory: ${themePath}`);
      }
    }

    const output = `
// This file is auto-generated. Do not edit manually.

export const configUrls = {
  light: ${JSON.stringify(configUrls.light || [], null, 2)},
  dark: ${JSON.stringify(configUrls.dark || [], null, 2)}
} as const;
`;

    // Ensure output directory exists
    await fs.promises.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
    await fs.promises.writeFile(OUTPUT_FILE, output, 'utf8');

    console.log('\n📝 Generated config file:', OUTPUT_FILE);
    console.log('\n📊 Summary:');
    console.log(`   Light theme: ${configUrls.light?.length || 0} configs`);
    console.log(`   Dark theme: ${configUrls.dark?.length || 0} configs`);
    console.log('\n✨ Particle config URLs generated successfully\n');
  } catch (error) {
    console.error('\n❌ Error generating particle config URLs:', error);
    process.exit(1);
  }
}

// Run the script
generateConfigUrls();