import * as React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface UserAvatarProps {
  name: string | null
  image: string | null
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: { className: 'h-6 w-6 text-[10px]', px: 24 },
  md: { className: 'h-8 w-8 text-xs', px: 32 },
  lg: { className: 'h-12 w-12 text-sm', px: 48 },
} as const

export function UserAvatar({ name, image, size = 'md' }: UserAvatarProps) {
  const { className, px } = sizeMap[size]
  const initials = name
    ? name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?'

  if (image) {
    return (
      <Image
        src={image}
        alt={name ?? 'User avatar'}
        width={px}
        height={px}
        className={cn('rounded-full object-cover', className)}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-muted font-medium text-muted-foreground',
        className
      )}
      aria-label={name ?? 'User avatar'}
    >
      {initials}
    </div>
  )
}
