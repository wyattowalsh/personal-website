'use client'

import * as React from 'react'
import { Heart } from 'lucide-react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface LikeButtonProps {
  liked: boolean
  count: number
  onToggle: () => void
  disabled?: boolean
}

export function LikeButton({ liked, count, onToggle, disabled }: LikeButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 px-2"
            onClick={onToggle}
            disabled={disabled}
            aria-label={liked ? 'Unlike' : 'Like'}
          >
            <motion.div
              animate={liked ? { scale: [1, 1.3, 1] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Heart
                className={cn(
                  'h-4 w-4 transition-colors',
                  liked
                    ? 'fill-red-500 text-red-500'
                    : 'text-muted-foreground'
                )}
              />
            </motion.div>
            <span className="text-xs tabular-nums">{count}</span>
          </Button>
        </TooltipTrigger>
        {disabled && (
          <TooltipContent>Sign in to like</TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  )
}
