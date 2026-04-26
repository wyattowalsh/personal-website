# Style Profile

Use this reference before project compose and whenever an update must preserve the site's voice. Scan every current `content/posts/*/index.mdx` file before drafting; do not rely on one exemplar alone.

## Exemplar Set

| Post | Use As | Weight |
|------|--------|--------|
| `content/posts/proxywhirl/index.mdx` | Modern project-post structure, concise first-person hook, badges, project links, architecture diagrams, usage examples, production-readiness sections | Primary for project compose |
| `content/posts/regularized-linear-regression-models-pt1/index.mdx` | Long-form tutorial pacing, mathematical setup, code-backed explanation, series framing | Secondary for deep technical exposition |
| `content/posts/regularized-linear-regression-models-pt2/index.mdx` | Continuation of technical argument, implementation detail, drawback/remedy framing | Secondary for analytical sections |
| `content/posts/regularized-linear-regression-models-pt3/index.mdx` | Advanced technical closeout, algorithmic explanation, series conclusion | Secondary for dense algorithmic posts |
| `content/posts/w4w-v6/index.mdx` | Frontmatter and taxonomy signal only | Weak placeholder; do not copy as writing quality |

## Voice

- Prefer direct first-person framing when the post is about the author's own project.
- Open with a concrete problem or motivation before abstract architecture.
- Use plain technical language with enough specificity to be credible.
- Keep claims measured. Avoid hype, generic launch copy, or unsupported superlatives.
- Make the post useful to someone evaluating or using the project, not just someone reading an announcement.
- Use short paragraphs around complex details; let tables, diagrams, and code carry dense information.

## Structure Traits

- Start with YAML frontmatter and no duplicate body H1.
- For project posts, lead with a short hook, badge/link block when evidence supports it, then problem, solution, architecture, feature depth, usage, production-readiness, trade-offs, and next steps.
- For tutorial-style posts, allow deeper mathematical or implementation setup before the project links.
- Use `##` sections that are descriptive and scannable.
- Prefer internal links like `/blog/posts/proxywhirl` when connecting to existing posts.
- Use a strong conclusion or invitation only when the project has a real public surface such as GitHub, package registry, demo, docs, or homepage.

## Taxonomy

Inspect all current tags before choosing new ones. Current tags include project-oriented labels such as `Project`, `Python`, `Open Source`, `Networking`, `Web Scraping`, and tutorial labels such as `ML`, `TDS`, `Optimization`.

Use existing capitalization when possible. Add a new tag only when the project clearly introduces a durable topic not covered by the current taxonomy.

## MDX Usage

- Use standard markdown first.
- Use `Badge` blocks for compact factual project attributes when they are source-backed.
- Use `Callout` for important problem/solution framing.
- Use `Mermaid` for architecture, workflows, state machines, or data flow.
- Use `Details` for long source lists or implementation detail that would interrupt the main narrative.
- Use `Tabs` for interface variants, install paths, or platform-specific examples.
- Use tables for feature matrices, command maps, or strategy comparisons.

Only use helpers documented in `mdx-components.md`.

## Draft Checkpoint Requirement

Every project draft checkpoint must name the exemplar blend:

```md
**Exemplar blend:** ProxyWhirl for project-post shape; regression series for technical depth; w4w-v6 ignored as placeholder except frontmatter/tag convention.
```

Adjust the sentence to match the actual blend, but include every current post in the scan.
