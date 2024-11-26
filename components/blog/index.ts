import dynamic from 'next/dynamic'

export const PostCard = dynamic(() => import('./PostCard'))
export const PostHeader = dynamic(() => import('./PostHeader'))
export const PostLayout = dynamic(() => import('./PostLayout'))
export const PostPagination = dynamic(() => import('./PostPagination'))

// Re-export types
export type { PostCardProps } from './PostCard'
export type { PostHeaderProps } from './PostHeader'
export type { PostLayoutProps } from './PostLayout'

// Export shared utilities
export * from './utils'
