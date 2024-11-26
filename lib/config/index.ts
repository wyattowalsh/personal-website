import { Config, ConfigSchema } from '../types'

const defaultConfig: Config = {
  site: {
    title: "Wyatt Walsh's Blog",
    description: 'Articles about software engineering, data science, and technology',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://w4w.dev',
    author: {
      name: 'Wyatt Walsh',
      email: 'mail@w4w.dev',
      twitter: '@wyattowalsh'
    }
  },
  blog: {
    postsPerPage: 10,
    featuredLimit: 3
  },
  cache: {
    ttl: 3600000, // 1 hour
    maxSize: 500
  }
}

// Simple singleton pattern for config
class ConfigManager {
  private static instance: ConfigManager;
  private config: Config;

  private constructor() {
    this.config = defaultConfig;
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  public getConfig(): Config {
    return this.config;
  }

  // Optional: Add method to update config if needed
  public updateConfig(newConfig: Partial<Config>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Export a simple getter function
export function getConfig(): Config {
  return ConfigManager.getInstance().getConfig();
}

// Export the default config for convenience
export const config = getConfig();

// Export types
export type { Config };
