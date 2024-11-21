import { ISourceOptions } from "tsparticles-engine";
import { configUrls } from "./configUrls";

export const getRandomConfig = (theme: 'light' | 'dark'): ParticleConfig => {
  const configs = configMap[theme];
  return configs[Math.floor(Math.random() * configs.length)].config;
};

export const getConfigByName = (theme: 'light' | 'dark', name: string): ParticleConfig | undefined => {
  return configMap[theme].find(c => c.name === name)?.config;
};

export const getAllConfigs = (theme: 'light' | 'dark'): ParticleConfig[] => {
  return configMap[theme].map(c => c.config);
};

export const getRandomConfigUrl = (theme: 'light' | 'dark'): string => {
  const urls = configUrls[theme];
  return urls[Math.floor(Math.random() * urls.length)];
};

export const getAllConfigUrls = (theme: 'light' | 'dark'): string[] => {
  return configUrls[theme];
};
