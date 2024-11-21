import { ISourceOptions } from "tsparticles-engine";
import { configUrls } from "./configUrls";

interface ParticleConfig {
  name: string;
  config: ISourceOptions;
}

const defaultFontConfig = {
  font: {
    family: "Verdana",
    size: 16,
    weight: "400",
    style: "normal",
    fill: true,
  },
};

const configMap: Record<'light' | 'dark', ParticleConfig[]> = {
  light: [
    // Add your light theme particle configurations here
    { name: "exampleLight", config: { ...defaultFontConfig } },
  ],
  dark: [
    // Add your dark theme particle configurations here
    { name: "exampleDark", config: { ...defaultFontConfig } },
  ],
};

export const getRandomConfig = (theme: 'light' | 'dark'): ISourceOptions => {
  const configs = configMap[theme];
  return configs[Math.floor(Math.random() * configs.length)].config;
};

export const getConfigByName = (theme: 'light' | 'dark', name: string): ISourceOptions | undefined => {
  return configMap[theme].find(c => c.name === name)?.config;
};

export const getAllConfigs = (theme: 'light' | 'dark'): ISourceOptions[] => {
  return configMap[theme].map(c => c.config);
};

export const getRandomConfigUrl = (theme: 'light' | 'dark'): string => {
  const urls = configUrls[theme];
  return urls[Math.floor(Math.random() * urls.length)];
};

export const getAllConfigUrls = (theme: 'light' | 'dark'): readonly string[] => {
  return configUrls[theme];
};
