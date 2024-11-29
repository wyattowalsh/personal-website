import { ISourceOptions } from "@tsparticles/engine";
import { configUrls } from "./configUrls";

type Theme = 'light' | 'dark';

export const baseConfig: ISourceOptions = {
  fullScreen: false,
  fpsLimit: 120,
  particles: {
    color: {
      value: "#ffffff",
    },
    links: {
      color: "#ffffff",
      distance: 150,
      enable: true,
      opacity: 0.5,
      width: 1,
    },
    move: {
      enable: true,
      outModes: {
        default: "out",
      },
      random: false,
      speed: 2,
      straight: false,
    },
    number: {
      density: {
        enable: true,
        area: 800,
      },
      value: 80,
    },
    opacity: {
      value: 0.5,
    },
    shape: {
      type: "circle",
    },
    size: {
      value: { min: 1, max: 3 },
    },
  },
  interactivity: {
    detectsOn: "window",
    events: {
      onHover: {
        enable: true,
        mode: "grab"
      },
      resize: true
    },
    modes: {
      grab: {
        distance: 140,
        links: {
          opacity: 0.5
        }
      }
    }
  },
  detectRetina: true,
};

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

export const getAllConfigUrls = (theme: Theme): readonly ParticleConfig[] => {
  return configUrls[theme];
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
