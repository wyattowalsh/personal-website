import { BackendService } from './backend'
import { ContentService } from './content'
import { SearchService } from './search'
import { CacheService } from './cache'

// Service registry pattern
export class ServiceRegistry {
  private static instance: ServiceRegistry
  private services: Map<string, any> = new Map()

  private constructor() {
    // Initialize core services
    this.register('backend', BackendService.getInstance())
    this.register('content', new ContentService())
    this.register('search', new SearchService())
    this.register('cache', new CacheService())
  }

  static getInstance() {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry()
    }
    return ServiceRegistry.instance
  }

  register(name: string, service: any) {
    this.services.set(name, service)
  }

  get<T>(name: string): T {
    const service = this.services.get(name)
    if (!service) throw new Error(`Service ${name} not found`)
    return service as T
  }
}

// Export service instances
export const services = ServiceRegistry.getInstance()
export const backend = services.get<BackendService>('backend')
export const content = services.get<ContentService>('content')
export const search = services.get<SearchService>('search')
export const cache = services.get<CacheService>('cache')

// Re-export service types
export type { BackendService, ContentService, SearchService, CacheService }
