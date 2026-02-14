# components/ — React Components

## Structure

```
components/
├── ui/                   # shadcn/ui primitives ← START HERE
├── hooks/                # Custom React hooks
├── particles/            # TSParticles configurations
├── heroes/               # Hero section variants
├── icons/                # Custom icon components
└── *.tsx                 # Feature components
```

## Guidelines

### Use Existing UI Primitives

Always check `ui/` before creating new base components:

```typescript
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
```

### Component Pattern

```typescript
import { cn } from '@/lib/utils'

interface Props {
  variant?: 'default' | 'outline'
  className?: string
  children: React.ReactNode
}

export function MyComponent({ variant = 'default', className, children }: Props) {
  return (
    <div className={cn('base-styles', variants[variant], className)}>
      {children}
    </div>
  )
}
```

### Naming

- Files: `PascalCase.tsx`
- CSS Modules: `kebab-case.module.scss`
- Co-locate styles with components

### Client vs Server

- Default to server components
- Add `'use client'` only for: interactivity, hooks, browser APIs
- Keep client boundary as low in tree as possible

### Animation

- Use Framer Motion for complex animations
- Use Tailwind `animate-*` for simple transitions
- Check `useReducedMotion()` for accessibility

### ErrorBoundary

```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary'

<ErrorBoundary fallback={<ErrorUI />}>
  <ComponentThatMightFail />
</ErrorBoundary>
```

## Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `PostCard` | `PostCard.tsx` | Blog post preview card |
| `PostHeader` | `PostHeader.tsx` | Post title, meta, hero image |
| `BlogTitle` | `BlogTitle.tsx` | Animated glitch title |
| `ParticlesBackground` | `ParticlesBackground.tsx` | Theme-aware particle effects |
| `LoadingSpinner` | `LoadingSpinner.tsx` | Suspense fallback |
| `ErrorBoundary` | `ErrorBoundary.tsx` | Error UI wrapper |
| `Math` | `Math.tsx` | LaTeX equations with numbering |
| `CodeBlock` | `CodeBlock.tsx` | Syntax-highlighted code |

### Heroes (`heroes/`)

| Component | Purpose |
|-----------|---------|
| `ThemeAwareHero` | Main hero with theme-aware styling |
| `RisoHero` | Riso-style visual hero variant |

### Icons (`icons/`)

```typescript
import { Kaggle, Reddit } from '@/components/icons'
```

Custom social/brand icons not in Lucide.
