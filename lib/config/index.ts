import { cache } from 'react'
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

// Validate config at runtime
export const validateConfig = (config: unknown): config is Config => {
  const result = ConfigSchema.safeParse(config)
  if (!result.success) {
    console.error('Invalid config:', result.error)
    return false
  }
  return true
}

// Typed config accessor with validation
export const getConfig = cache(async () => {
  try {
    const config = { ...defaultConfig }
    if (!validateConfig(config)) {
      throw new Error('Invalid config')
    }
    return config
  } catch (error) {
    console.error('Error loading config:', error)
    return defaultConfig
  }
})

// Export validated config
export const config = await getConfig()
