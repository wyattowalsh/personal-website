## Nextjs 

```zsh
npx repomix \
  --quiet \
  --remote https://github.com/vercel/next.js.git \
  --remote-branch canary \
  --include "docs/**/*.md,docs/**/*.mdx,docs/**/*.rst" \
  --style markdown \
  -o ./.cursor/context/nextjs-15.3.3-docs.md
```

---

## React

```zsh
npx repomix \
  --quiet \
  --remote https://github.com/reactjs/react.dev.git \
  --remote-branch main \
  --include "src/**/*.md,src/**/*.mdx,src/**/*.rst" \
  --style markdown \
  -o ./.cursor/context/react-docs.md
```

---

## TailwindCSS

```zsh
npx repomix \
  --quiet \
  --remote https://github.com/tailwindlabs/tailwindcss.com.git \
  --remote-branch main \
  --include "src/**/*.md,src/**/*.mdx,src/**/*.rst" \
  --style markdown \
  -o ./.cursor/context/tailwindcss-docs.md
```

---

## shadcn-ui

```zsh
npx repomix \
  --quiet \
  --remote https://github.com/shadcn-ui/ui.git \
  --remote-branch main \
  --include "apps/v4/content/docs/**/*.md,apps/v4/content/docs/**/*.mdx,apps/v4/content/docs/**/*.rst" \
  --style markdown \
  -o ./.cursor/context/shadcn_ui-docs.md
```

---

## 