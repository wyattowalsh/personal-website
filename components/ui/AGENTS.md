# components/ui/ — shadcn/ui Primitives

> ⚠️ **Use these components instead of creating new ones**

## Available Components

| Component | Import | Use For |
|-----------|--------|---------|
| `Button` | `@/components/ui/button` | Actions, links |
| `Card` | `@/components/ui/card` | Content containers |
| `Badge` | `@/components/ui/badge` | Tags, labels |
| `Input` | `@/components/ui/input` | Form inputs |
| `Tabs` | `@/components/ui/tabs` | Tab navigation |
| `Tooltip` | `@/components/ui/tooltip` | Hover hints |
| `Toast` | `@/components/ui/toast` | Notifications |
| `Accordion` | `@/components/ui/accordion` | Collapsible sections |
| `DropdownMenu` | `@/components/ui/dropdown-menu` | Menus |
| `Select` | `@/components/ui/select` | Dropdowns |
| `ScrollArea` | `@/components/ui/scroll-area` | Custom scrollbars |

## Usage Pattern

```typescript
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

<Button variant="outline" className={cn('custom-class')}>
  Click me
</Button>
```

## Customization

- Use `className` prop with `cn()` for overrides
- Don't modify these files directly
- For new variants, extend in a wrapper component

## Adding New Components

Use shadcn/ui CLI:
```bash
npx shadcn-ui@latest add [component]
```
