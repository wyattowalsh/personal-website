const fs = require('fs');
const path = require('path');

const PARTICLES_DIR = path.join(__dirname, '../public/particles/');
const OUTPUT_FILE = path.join(__dirname, '../components/particles/configUrls.ts');

function generateConfigUrls() {
  const themes = ['light', 'dark'];
  const configUrls = {};

  themes.forEach(theme => {
    const themePath = path.join(PARTICLES_DIR, theme);
    if (fs.existsSync(themePath)) {
      const files = fs.readdirSync(themePath)
        .filter(file => file.endsWith('.json'));
      
      configUrls[theme] = files.map(file => `/particles/${theme}/${file}`);
    }
  });

  const output = `
// This file is auto-generated. Do not edit manually.

export const configUrls = {
  light: ${JSON.stringify(configUrls.light, null, 2)},
  dark: ${JSON.stringify(configUrls.dark, null, 2)}
} as const;
`;

  fs.writeFileSync(OUTPUT_FILE, output);
}

generateConfigUrls();
