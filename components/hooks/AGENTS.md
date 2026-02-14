# components/hooks/ — Custom React Hooks

## Available Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useWindowSize` | `useWindowSize.ts` | Responsive window dimensions |
| `useMousePosition` | `useMousePosition.ts` | Mouse cursor tracking |
| `useReducedMotion` | `useReducedMotion.ts` | Respect prefers-reduced-motion |
| `useToast` | `use-toast.ts` | Toast notification system |

## Usage

```typescript
'use client'
import { useWindowSize } from '@/components/hooks/useWindowSize'
import { useReducedMotion } from '@/components/hooks/useReducedMotion'
import { useToast } from '@/components/hooks/use-toast'

function Component() {
  const { width, height } = useWindowSize()
  const prefersReducedMotion = useReducedMotion()
  const { toast } = useToast()
  
  // Show toast notification
  toast({ title: 'Success', description: 'Action completed' })
}
```

## Creating New Hooks

```typescript
'use client'
import { useState, useEffect } from 'react'

export function useCustomHook() {
  const [state, setState] = useState(initialValue)
  
  useEffect(() => {
    // Browser-only logic
  }, [])
  
  return state
}
```

## Conventions

- Prefix with `use`
- File: `useHookName.ts`
- Always add `'use client'` directive
- Handle SSR (check `typeof window !== 'undefined'`)
