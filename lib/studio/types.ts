export type EngineType = 'p5js' | 'glsl' | 'webgpu'

export interface Sketch {
  id: string
  title: string
  description: string
  code: string
  engine: EngineType
  tags: string[]
  thumbnailUrl: string | null
  authorId: string
  forkedFrom: string | null
  likeCount: number
  viewCount: number
  isPublic: boolean
  config: SketchConfig | null
  slug: string | null
  createdAt: string
  updatedAt: string
}

export interface SketchSummary {
  id: string
  title: string
  engine: EngineType
  tags: string[]
  thumbnailUrl: string | null
  authorId: string
  authorName: string
  authorImage: string | null
  likeCount: number
  viewCount: number
  createdAt: string
}

export interface OwnedSketchSummary extends SketchSummary {
  isPublic: boolean
}

export interface ConsoleEntry {
  id: string
  type: 'log' | 'warn' | 'error' | 'info'
  args: string[]
  timestamp: number
}

export type SandboxMessageType =
  | 'sketch:run'
  | 'sketch:stop'
  | 'sketch:capture'
  | 'sketch:capture-svg'
  | 'sketch:configure'

export interface SandboxMessage {
  type: SandboxMessageType
  code?: string
  config?: SketchConfig
}

export type SandboxResponseType =
  | 'sandbox:ready'
  | 'sandbox:error'
  | 'sandbox:console'
  | 'sandbox:capture'
  | 'sandbox:capture-svg'
  | 'sandbox:heartbeat'

export interface SandboxResponse {
  type: SandboxResponseType
  data?: unknown
  error?: string
  entries?: ConsoleEntry[]
  dataUrl?: string
  svg?: string
}

export interface SketchConfig {
  width: number
  height: number
  fps: number
  backgroundColor: string
  pixelDensity: number
}

export interface SketchTemplate {
  id: string
  name: string
  category: 'basic' | 'animation' | 'interactive' | 'generative' | 'parametric'
  description: string
  code: string
  engine: EngineType
}

export interface StudioUser {
  id: string
  name: string | null
  email: string | null
  image: string | null
  provider: string
  providerId: string
  displayName: string | null
  bio: string | null
  website: string | null
  socialLinks: { github?: string; twitter?: string; website?: string } | null
  role: string
  createdAt: string
  updatedAt: string
}

export interface AutoSaveEntry {
  id: string
  code: string
  title: string
  config: SketchConfig
  engine: EngineType
  timestamp: number
}

export interface Comment {
  id: string
  sketchId: string
  authorId: string
  authorName: string
  authorImage: string | null
  parentId: string | null
  body: string
  createdAt: string
  updatedAt: string
  replies?: Comment[]
}

export type NotificationType = 'like' | 'fork' | 'follow' | 'comment' | 'mention'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  actorId: string
  actorName: string
  actorImage: string | null
  sketchId: string | null
  sketchTitle: string | null
  commentId: string | null
  read: boolean
  createdAt: string
}

export interface FollowCounts {
  followers: number
  following: number
}

export interface Collection {
  id: string
  ownerId: string
  name: string
  description: string
  isPublic: boolean
  sketchCount: number
  createdAt: string
  updatedAt: string
}

export interface EngineAdapter {
  render(code: string, config: SketchConfig): void
  stop(): void
  capture(): Promise<string>
  getDefaultTemplate(): string
  dispose(): void
}
