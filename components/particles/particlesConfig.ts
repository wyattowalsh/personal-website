import { configUrls } from "./configUrls";
import { ParticleConfig, Theme } from "./types";

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

export const getAllConfigUrls = (theme: Theme): readonly ParticleConfig[] => {
  return configUrls[theme];
};
