import { configUrls } from "./configUrls";

// Define types based on the configUrls structure
type Theme = 'light' | 'dark';
type ParticleConfigUrls = readonly string[];
type ConfigUrls = Record<Theme, ParticleConfigUrls>;

export const getRandomConfigUrl = (theme: Theme): string => {
  const urls = configUrls[theme];
  // Check for empty arrays or undefined
  if (!urls?.length) {
    console.warn(`No particle configs found for theme: ${theme}`);
    return theme === 'dark' 
      ? '/particles/dark/stars.json'
      : '/particles/light/net.json';
  }
  return urls[Math.floor(Math.random() * urls.length)];
};

export const getAllConfigUrls = (theme: Theme): ParticleConfigUrls => {
  return configUrls[theme];
};
