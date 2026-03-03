'use client'

import * as React from 'react'
import { Separator } from 'react-resizable-panels'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

interface PremiumResizableHandleProps {
  direction?: 'horizontal' | 'vertical'
  className?: string
  withHandle?: boolean
}

/* -------------------------------------------------------------------------- */
/*                              Main Component                                */
/* -------------------------------------------------------------------------- */

export function PremiumResizableHandle({
  direction = 'horizontal',
  className,
  withHandle = true,
  ...props
}: PremiumResizableHandleProps & Omit<ComponentProps<typeof Separator>, 'className'>) {
  const isVertical = direction === 'vertical'
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    const separator = containerRef.current?.querySelector<HTMLElement>('[role="separator"]')
    if (!separator) return
    separator.setAttribute('aria-label', isVertical ? 'Resize panels vertically' : 'Resize panels horizontally')
    separator.setAttribute('aria-valuemin', '0')
    separator.setAttribute('aria-valuemax', '100')
    if (!separator.hasAttribute('aria-valuenow')) {
      separator.setAttribute('aria-valuenow', '50')
    }
  }, [isVertical])

  return (
    <div
      ref={containerRef}
      className={cn(
        'group relative flex items-center justify-center',
        isVertical ? 'h-px w-full' : 'h-full w-px',
        className,
      )}
    >
      <Separator
        className={cn(
          'relative flex items-center justify-center transition-all duration-200 ease-out',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1',

          /* Horizontal (default): vertical line */
          !isVertical && [
            'h-full w-px',
            'bg-gradient-to-b from-transparent via-border/30 to-transparent',
            'after:absolute after:inset-y-0 after:left-1/2 after:w-3 after:-translate-x-1/2',
            /* hover */
            'data-[resize-handle-state=hover]:w-[3px] data-[resize-handle-state=hover]:bg-gradient-to-b data-[resize-handle-state=hover]:from-transparent data-[resize-handle-state=hover]:via-primary/40 data-[resize-handle-state=hover]:to-transparent data-[resize-handle-state=hover]:shadow-[0_0_8px_hsl(var(--primary)/0.2)]',
            /* drag */
            'data-[resize-handle-state=drag]:w-[3px] data-[resize-handle-state=drag]:bg-gradient-to-b data-[resize-handle-state=drag]:from-transparent data-[resize-handle-state=drag]:via-primary/60 data-[resize-handle-state=drag]:to-transparent data-[resize-handle-state=drag]:shadow-[0_0_12px_hsl(var(--primary)/0.3)]',
          ],

          /* Vertical: horizontal line */
          isVertical && [
            'h-px w-full',
            'bg-gradient-to-r from-transparent via-border/30 to-transparent',
            'after:absolute after:inset-x-0 after:top-1/2 after:h-3 after:-translate-y-1/2',
            /* hover */
            'data-[resize-handle-state=hover]:h-[3px] data-[resize-handle-state=hover]:bg-gradient-to-r data-[resize-handle-state=hover]:from-transparent data-[resize-handle-state=hover]:via-primary/40 data-[resize-handle-state=hover]:to-transparent data-[resize-handle-state=hover]:shadow-[0_0_8px_hsl(var(--primary)/0.2)]',
            /* drag */
            'data-[resize-handle-state=drag]:h-[3px] data-[resize-handle-state=drag]:bg-gradient-to-r data-[resize-handle-state=drag]:from-transparent data-[resize-handle-state=drag]:via-primary/60 data-[resize-handle-state=drag]:to-transparent data-[resize-handle-state=drag]:shadow-[0_0_12px_hsl(var(--primary)/0.3)]',
          ],
        )}
        {...props}
      >
        {withHandle && (
          <div
            className={cn(
              'z-10 transition-all duration-200 ease-out',
              'h-1.5 w-1.5 rounded-full bg-border',
              'group-hover:bg-primary/50 group-hover:shadow-[0_0_4px_hsl(var(--primary)/0.3)]',
              isVertical && 'rotate-90',
            )}
          />
        )}
      </Separator>
    </div>
  )
}
