import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type StudioPageContainerProps = HTMLAttributes<HTMLDivElement>

export function StudioPageContainer({ className, ...props }: StudioPageContainerProps) {
  return (
    <div
      className={cn('container mx-auto w-full max-w-7xl px-4 sm:px-6', className)}
      {...props}
    />
  )
}

interface StudioPageHeaderProps extends HTMLAttributes<HTMLElement> {
  heading: ReactNode
  description?: ReactNode
  actions?: ReactNode
  titleClassName?: string
  descriptionClassName?: string
  actionsClassName?: string
}

export function StudioPageHeader({
  className,
  heading,
  description,
  actions,
  titleClassName,
  descriptionClassName,
  actionsClassName,
  ...props
}: StudioPageHeaderProps) {
  return (
    <header
      className={cn('mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}
      {...props}
    >
      <div>
        <h1 className={cn('text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl', titleClassName)}>
          {heading}
        </h1>
        {description ? (
          <p className={cn('mt-1.5 text-sm text-muted-foreground sm:text-base', descriptionClassName)}>
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className={cn('flex items-center gap-2 sm:gap-3', actionsClassName)}>{actions}</div> : null}
    </header>
  )
}
