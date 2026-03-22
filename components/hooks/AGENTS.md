# components/hooks/ — Custom React Hooks

## Available Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useWindowSize` | `useWindowSize.ts` | Responsive window dimensions |
| `useMousePosition` | `useMousePosition.ts` | Mouse cursor tracking |
| `useReducedMotion` | `useReducedMotion.ts` | Respect prefers-reduced-motion |

## Usage

```typescript
'use client'
import { useWindowSize } from '@/components/hooks/useWindowSize'
import { useReducedMotion } from '@/components/hooks/useReducedMotion'

function Component() {
  const { width, height } = useWindowSize()
  const prefersReducedMotion = useReducedMotion()
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
