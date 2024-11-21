import { ISourceOptions } from "tsparticles-engine";
import { configUrls } from "./configUrls";

interface ParticleConfig {
  name: string;
  url: string;
}

// Map of all available configurations
const configMap: Record<'light' | 'dark', ParticleConfig[]> = {
  light: [
    { name: "snow", url: "/particles/light/snow.json" },
    { name: "net", url: "/particles/light/net.json" },
    { name: "hex", url: "/particles/light/hex.json" },
    { name: "flowers", url: "/particles/light/flowers.json" },
    { name: "butterflies", url: "/particles/light/butterflies.json" }
  ],
  dark: [
    { name: "stars", url: "/particles/dark/stars.json" },
    { name: "nebula", url: "/particles/dark/nebula.json" },
    { name: "mat", url: "/particles/dark/mat.json" }
  ]
};

export const getRandomConfigUrl = (theme: 'light' | 'dark'): string => {
  const configs = configMap[theme];
  return configs[Math.floor(Math.random() * configs.length)].url;
};

export const getConfigUrlByName = (theme: 'light' | 'dark', name: string): string | undefined => {
  return configMap[theme].find(c => c.name === name)?.url;
};

export const getAllConfigUrls = (theme: 'light' | 'dark'): string[] => {
  return configMap[theme].map(c => c.url);
};
