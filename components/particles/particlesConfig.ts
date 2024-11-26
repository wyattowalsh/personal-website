import { ISourceOptions } from "tsparticles-engine";
import { configUrls } from "./configUrls";

type Theme = 'light' | 'dark';

export const getRandomConfigUrl = (theme: Theme): string => {
  const configs = configUrls[theme];
  if (!configs.length) {
    // Return a default config from the opposite theme or a fallback
    const oppositeTheme = theme === 'dark' ? 'light' : 'dark';
    return configUrls[oppositeTheme][0]?.url ?? '';
  }
  const randomIndex = Math.floor(Math.random() * configs.length);
  return configs[randomIndex].url;
};

export const getConfigByName = (theme: Theme, name: string): string | undefined => {
  return configUrls[theme].find(config => config.url.includes(name))?.url;
};

export const getAllConfigUrls = (theme: Theme): readonly string[] => {
  return configUrls[theme].map(config => config.url);
};

export const getConfigByHash = (theme: Theme, hash: string): string | undefined => {
  return configUrls[theme].find(config => config.hash === hash)?.url;
};

export const getMostRecent = (theme: Theme): string => {
  const configs = configUrls[theme];
  return configs.reduce((latest, current) => {
    return new Date(latest.lastModified) > new Date(current.lastModified) 
      ? latest 
      : current;
  }).url;
};
