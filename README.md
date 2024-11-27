# `w4w.dev`
### *My Personal Web App* 🤖✨

---
<!-- 
[![Vercel](https://img.shields.io/badge/hosted_on-Vercel-000?logo=vercel&style=for-the-badge)](https://vercel.com)
[![Website](https://img.shields.io/website?url=https%3A%2F%2Fw4w.dev&style=for-the-badge)](https://w4w.dev)

[![Next.js](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://reactjs.org)
[![MDX](https://img.shields.io/badge/MDX-v2-000?logo=mdx&style=for-the-badge)](https://mdxjs.com)

[![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![LaTeX](https://img.shields.io/badge/latex-%23008080.svg?style=for-the-badge&logo=latex&logoColor=white)](https://www.latex-project.org)

[![SASS](https://img.shields.io/badge/SASS-hotpink.svg?style=for-the-badge&logo=SASS&logoColor=white)](https://sass-lang.com)
[![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

[![Visual Studio Code](https://img.shields.io/badge/Visual%20Studio%20Code-0078d7.svg?style=for-the-badge&logo=visual-studio-code&logoColor=white)](https://code.visualstudio.com)
[![Giscus](https://img.shields.io/badge/Giscus-enabled-9B83FF?logo=github&style=for-the-badge)](https://giscus.app)

[![NPM](https://img.shields.io/badge/NPM-%23CB3837.svg?style=for-the-badge&logo=npm&logoColor=white)](https://www.npmjs.com)
[![npm](https://img.shields.io/npm/v/next?label=npm&logo=npm&style=for-the-badge)](https://www.npmjs.com/package/next)

[![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)

[![YOURLS](https://img.shields.io/badge/YOURLS-v1.9+-3178C6?logo=link&style=for-the-badge)](https://yourls.org)

[![GitHub commit activity](https://img.shields.io/github/commit-activity/t/wyattowalsh/personal-website?style=for-the-badge&logo=github)](https://github.com/wyattowalsh/personal-website) -->


<p align="center">
    <!-- Deployment -->
    <img src="https://img.shields.io/badge/hosted_on-Vercel-000?logo=vercel&style=for-the-badge" alt="Vercel">
    <img src="https://img.shields.io/website?url=https%3A%2F%2Fw4w.dev&style=for-the-badge" alt="Website">

    <!-- Frameworks -->
    <img src="https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js">
    <img src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" alt="React">
    <img src="https://img.shields.io/badge/MDX-v2-000?logo=mdx&style=for-the-badge" alt="MDX">

    <!-- Languages -->
    <img src="https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E" alt="JavaScript">
    <img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
    <img src="https://img.shields.io/badge/latex-%23008080.svg?style=for-the-badge&logo=latex&logoColor=white" alt="LaTeX">
    
    <!-- Styling -->
    <img src="https://img.shields.io/badge/SASS-hotpink.svg?style=for-the-badge&logo=SASS&logoColor=white" alt="SASS">
    <img src="https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS">
    
    <!-- Tools -->
    <img src="https://img.shields.io/badge/Visual%20Studio%20Code-0078d7.svg?style=for-the-badge&logo=visual-studio-code&logoColor=white" alt="Visual Studio Code">
    <img src="https://img.shields.io/badge/Giscus-enabled-9B83FF?logo=github&style=for-the-badge" alt="Giscus">
    
    <!-- Package Managers -->
    <img src="https://img.shields.io/badge/NPM-%23CB3837.svg?style=for-the-badge&logo=npm&logoColor=white" alt="NPM">
    <img src="https://img.shields.io/npm/v/next?label=npm&logo=npm&style=for-the-badge" alt="npm (Next.js)">
    
    <!-- Backends -->
    <img src="https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
    
    <!-- URL Shortening -->
    <img src="https://img.shields.io/badge/YOURLS-v1.9+-3178C6?logo=link&style=for-the-badge" alt="YOURLS">
    
    <!-- Commit Activity -->
    <img src="https://img.shields.io/github/commit-activity/t/wyattowalsh/personal-website?style=for-the-badge&logo=github" alt="GitHub Commit Activity">
</p>


---

> ##### This repo contains the associated code base for building my personal website / link tree.

#### ↪ Currently on ***<u>V6</u>***! 💎 🚀

---

## Key Features 🔑

- Custom link tree with social media links and contact information with a [particles](https://particles.js.org/) background.
- Blog supporting:
  - MDX content with frontmatter metadata.
  - LaTeX math rendering with [KaTeX](https://katex.org/)
    - Inline and block math equations.
    - Equation autonumbering
    - Copy-to-clipboard support for underlying LaTeX code + autolinked anchor url
  - Gist embedding with [Super React Gist](https://github.com/GeorgeGkas/super-react-gist)
  - Full-text search with [Fuse.js](https://fusejs.io/)
  - Reading time estimation with [reading-time](https://github.com/ngryman/reading-time)
  - Pagination
  - Tags with tag page + indices
  - RSS feed generation with [feed](https://github.com/jpmonette/feed)
  - Automatic created and modified dates (with optional frontmatter override)
- Custom 404 page with more particles!
- Predev + Prebuild scripts for pre-computation of data for faster builds.
- Light + Dark mode theme toggling with local storage persistence.
- Linkshortener with [YOURLS](https://yourls.org/).

---

## Tech Stack 🥞

- **[Vercel](https://vercel.com/)**: A global hosting and deployment platform for frontend web projects.  
- **[TypeScript](https://www.typescriptlang.org/)**: A typed superset of JavaScript for enhancing code reliability and maintainability.  
- **[Next.js](https://nextjs.org/)**: A React-based framework for server-side rendered and static web applications.  
- **[React](https://react.dev/)**: A JavaScript library for building user interfaces.  
- **[shadcn/ui](https://ui.shadcn.com/)**: A modular set of pre-built UI components for React applications.  
- **[Tailwind CSS](https://tailwindcss.com/)**: A utility-first CSS framework for creating custom designs without writing custom CSS.  
- **[SCSS](https://sass-lang.com/)**: A CSS preprocessor with features like variables and mixins.  
- **[MDX](https://mdxjs.com/)**: A format that combines Markdown and JSX for seamless component rendering.  

<details>
<summary>Full Table</summary>

| Technology/Plugin                                      | Description                 | Summary Description | Links                                                                                   |
|--------------------------------------------------------|-----------------------------|----------------------|-----------------------------------------------------------------------------------------|
| [Vercel](https://vercel.com/)                          | App hosting                 | A platform for frontend developers, providing global hosting and deployment for web projects. | [Documentation](https://vercel.com/docs) |
| [TypeScript](https://www.typescriptlang.org/)          | Programming language        | A typed superset of JavaScript that compiles to plain JavaScript, enhancing code reliability and maintainability. | [Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) |
| [Next.js](https://nextjs.org/)                         | App framework               | A React-based framework for building server-side rendered and static web applications. | [Learn Next.js](https://nextjs.org/learn) |
| [React](https://react.dev/)                            | UI library                  | A popular JavaScript library for building user interfaces. | [Getting Started](https://react.dev/learn) |
| [shadcn/ui](https://ui.shadcn.com/)                    | UI components               | A set of pre-built UI components for React applications, offering a modular approach to design. | [Components](https://ui.shadcn.com/components) |
| [Tailwind CSS](https://tailwindcss.com/)               | CSS framework               | A utility-first CSS framework for creating custom designs without writing custom CSS. | [Documentation](https://tailwindcss.com/docs) |
| [SCSS](https://sass-lang.com/)                         | CSS preprocessor            | A CSS preprocessor that adds features like variables, nested rules, and mixins to standard CSS. | [Guide](https://sass-lang.com/guide) |
| [MDX](https://mdxjs.com/)                              | Markdown for JSX            | A format for writing JSX and Markdown together, allowing seamless component rendering within Markdown files. | [Getting Started](https://mdxjs.com/getting-started/) |
| [Framer Motion](https://www.framer.com/motion/)        | Animations                  | A library for creating animations and interactions in React applications. | [API Reference](https://www.framer.com/motion/api/) |
| [React Scroll](https://github.com/fisshy/react-scroll) | Scrolling library           | React components for smooth scrolling within a page. | [GitHub Repository](https://github.com/fisshy/react-scroll) |
| **MDX Plugins**                                        |                             | Various plugins to enhance MDX functionality. |  |
| **[remark-gfm](https://github.com/remarkjs/remark-gfm)** | MDX Plugin                  | Adds GitHub Flavored Markdown support in MDX. | [GitHub Repository](https://github.com/remarkjs/remark-gfm) |
| **[remark-math](https://github.com/remarkjs/remark-math)** | MDX Plugin                  | Adds support for math notation in MDX content. | [GitHub Repository](https://github.com/remarkjs/remark-math) |
| **[remark-mdx-math-enhanced](https://github.com/remarkjs/remark-mdx-math-enhanced)** | MDX Plugin                  | Enhances math rendering capabilities in MDX. | [GitHub Repository](https://github.com/remarkjs/remark-mdx-math-enhanced) |
| **[remark-emoji](https://github.com/remarkjs/remark-emoji)** | MDX Plugin                  | Converts emoji shortcodes to Unicode emojis in MDX. | [GitHub Repository](https://github.com/remarkjs/remark-emoji) |
| **[remark-code-titles](https://github.com/remarkjs/remark-code-title)** | MDX Plugin                  | Adds custom titles to code blocks in MDX. | [GitHub Repository](https://github.com/remarkjs/remark-code-title) |
| **[remark-code-blocks](https://github.com/remarkjs/remark-code-blocks)** | MDX Plugin                  | Enhances code blocks with additional functionality. | [GitHub Repository](https://github.com/remarkjs/remark-code-blocks) |
| **[remark-code-frontmatter](https://github.com/remarkjs/remark-code-frontmatter)** | MDX Plugin                  | Adds frontmatter support within code blocks. | [GitHub Repository](https://github.com/remarkjs/remark-code-frontmatter) |
| **[remark-code-import](https://github.com/remarkjs/remark-code-import)** | MDX Plugin                  | Allows importing code snippets from external files. | [GitHub Repository](https://github.com/remarkjs/remark-code-import) |
| **[remark-code-screenshot](https://github.com/remarkjs/remark-code-screenshot)** | MDX Plugin                  | Captures screenshots of code blocks as images. | [GitHub Repository](https://github.com/remarkjs/remark-code-screenshot) |
| **[remark-codesandbox](https://github.com/remarkjs/remark-codesandbox)** | MDX Plugin                  | Integrates CodeSandbox embeds within MDX documents. | [GitHub Repository](https://github.com/remarkjs/remark-codesandbox) |
| **[remark-custom-header-id](https://github.com/remarkjs/remark-custom-header-id)** | MDX Plugin                  | Customizes header IDs for improved linkability. | [GitHub Repository](https://github.com/remarkjs/remark-custom-header-id) |
| **[remark-definition-list](https://github.com/remarkjs/remark-definition-list)** | MDX Plugin                  | Adds support for definition lists in MDX content. | [GitHub Repository](https://github.com/remarkjs/remark-definition-list) |
| **[remark-docx](https://github.com/remarkjs/remark-docx)** | MDX Plugin                  | Converts MDX content to DOCX format. | [GitHub Repository](https://github.com/remarkjs/remark-docx) |
| **[remark-embed-images](https://github.com/remarkjs/remark-embed-images)** | MDX Plugin                  | Embeds images directly into MDX files. | [GitHub Repository](https://github.com/remarkjs/remark-embed-images) |
| **[remark-extended-table](https://github.com/remarkjs/remark-extended-table)** | MDX Plugin                  | Adds support for extended table features in MDX. | [GitHub Repository](https://github.com/remarkjs/remark-extended-table) |
| **[remark-frontmatter](https://github.com/remarkjs/remark-frontmatter)** | MDX Plugin                  | Supports parsing and using frontmatter metadata. | [GitHub Repository](https://github.com/remarkjs/remark-frontmatter) |
| **[remark-github-blockquote-alert](https://github.com/jaywcjlove/remark-github-blockquote-alert)** | MDX Plugin                  | Styles blockquotes as alerts with GitHub-like design. | [GitHub Repository](https://github.com/jaywcjlove/remark-github-blockquote-alert) |
| **[remark-hint](https://github.com/remarkjs/remark-hint)** | MDX Plugin                  | Adds hint and tip boxes to MDX content. | [GitHub Repository](https://github.com/remarkjs/remark-hint) |
| **[remark-oembed](https://github.com/remarkjs/remark-oembed)** | MDX Plugin                  | Embeds external content like tweets and videos. | [GitHub Repository](https://github.com/remarkjs/remark-oembed) |
| **[remark-prism](https://github.com/remarkjs/remark-prism)** | MDX Plugin                  | Adds syntax highlighting using Prism.js. | [GitHub Repository](https://github.com/remarkjs/remark-prism) |
| **[remark-smartypants](https://github.com/remarkjs/remark-smartypants)** | MDX Plugin                  | Converts quotes and dashes to typographically correct symbols. | [GitHub Repository](https://github.com/remarkjs/remark-smartypants) |
| **[remark-sources](https://github.com/remarkjs/remark-sources)** | MDX Plugin                  | Lists sources and references in MDX content. | [GitHub Repository](https://github.com/remarkjs/remark-sources) |
| **[remark-mdx-frontmatter](https://github.com/remarkjs/remark-mdx-frontmatter)** | MDX Plugin                  | Adds MDX-specific frontmatter support. | [GitHub Repository](https://github.com/remarkjs/remark-mdx-frontmatter) |
| **[remark-toc](https://github.com/remarkjs/remark-toc)** | MDX Plugin                  | Generates a table of contents. | [GitHub Repository](https://github.com/remarkjs/remark-toc) |
| **[remark-validate-links](https://github.com/remarkjs/remark-validate-links)** | MDX Plugin                  | Validates links in MDX content. | [GitHub Repository](https://github.com/remarkjs/remark-validate-links) |
| **Rehype Plugins**                                      |                             | Various plugins to enhance HTML output. |  |
| **[rehype-slug](https://github.com/rehypejs/rehype-slug)** | MDX Plugin                  | Adds unique IDs to headings for linkability. | [GitHub Repository](https://github.com/rehypejs/rehype-slug) |
| **[rehype-autolink-headings](https://github.com/rehypejs/rehype-autolink-headings)** | MDX Plugin                  | Adds anchor links to headings. | [GitHub Repository](https://github.com/rehypejs/rehype-autolink-headings) |
| **[rehype-katex](https://github.com/rehypejs/rehype-katex)** | MDX Plugin                  | Renders math notation using KaTeX. | [GitHub Repository](https://github.com/rehypejs/rehype-katex) |
| **[rehype-prism](https://github.com/rehypejs/rehype-prism)** | MDX Plugin                  | Adds syntax highlighting using Prism.js. | [GitHub Repository](https://github.com/rehypejs/rehype-prism) |
| **[rehype-callouts](https://github.com/rehypejs/rehype-callouts)** | MDX Plugin                  | Adds callout boxes to content. | [GitHub Repository](https://github.com/rehypejs/rehype-callouts) |
| **[rehype-citation](https://github.com/rehypejs/rehype-citation)** | MDX Plugin                  | Enables citation formatting. | [GitHub Repository](https://github.com/rehypejs/rehype-citation) |
| **[rehype-color-chips](https://github.com/rehypejs/rehype-color-chips)** | MDX Plugin                  | Displays color chips for visualization. | [GitHub Repository](https://github.com/rehypejs/rehype-color-chips) |
| **[rehype-infer-reading-time-meta](https://github.com/rehypejs/rehype-infer-reading-time-meta)** | MDX Plugin                  | Infers reading time and adds metadata. | [GitHub Repository](https://github.com/rehypejs/rehype-infer-reading-time-meta) |
| **[rehype-prism-plus](https://github.com/rehypejs/rehype-prism-plus)** | MDX Plugin                  | Advanced code block syntax highlighting. | [GitHub Repository](https://github.com/rehypejs/rehype-prism-plus) |
| **[rehype-semantic-blockquotes](https://github.com/rehypejs/rehype-semantic-blockquotes)** | MDX Plugin                  | Styles blockquotes with semantic HTML. | [GitHub Repository](https://github.com/rehypejs/rehype-semantic-blockquotes) |
| **Other Tools and Libraries**                           |                             | Additional tools used in the project. |  |
| [Lucide React](https://lucide.dev/docs/lucide-react)   | Icon library                | A collection of customizable React icons. | [Documentation](https://lucide.dev/docs/lucide-react) |
| [Fuse.js](https://fusejs.io/)                          | Search library              | Lightweight fuzzy-search library. | [Documentation](https://fusejs.io/) |
| [Reading Time](https://github.com/ngryman/reading-time) | Reading time estimator      | Estimates reading time for text content. | [GitHub Repository](https://github.com/ngryman/reading-time) |
| [Gray Matter](https://github.com/jonschlinkert/gray-matter) | Frontmatter parser        | Parses frontmatter from markdown files. | [GitHub Repository](https://github.com/jonschlinkert/gray-matter) |
| [React Syntax Highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter) | Syntax highlighting | Syntax highlighting component for React using highlight.js or Prism.js. | [GitHub Repository](https://github.com/react-syntax-highlighter/react-syntax-highlighter) |
| [React Icons](https://react-icons.github.io/react-icons/) | Icon library             | Include popular icons in React projects easily. | [Documentation](https://react-icons.github.io/react-icons/) |
| [React Katex](https://github.com/talyssonoc/react-katex) | Math rendering            | Display math equations in React using KaTeX. | [GitHub Repository](https://github.com/talyssonoc/react-katex) |
| [React Particles](https://github.com/matteobruni/tsparticles) | Particle animations     | Create particle animations in React. | [GitHub Repository](https://github.com/matteobruni/tsparticles) |
| [React Confetti](https://github.com/alampros/react-confetti) | Confetti animation     | Confetti animation for celebrations in React apps. | [GitHub Repository](https://github.com/alampros/react-confetti) |
| [React Share](https://github.com/nygardk/react-share)  | Social media sharing       | Social media share buttons and icons for React. | [GitHub Repository](https://github.com/nygardk/react-share) |
| [ESLint](https://eslint.org/)                          | Linting tool                | Identifies and reports on patterns in JavaScript. | [Documentation](https://eslint.org/docs/user-guide/getting-started) |
| [Prettier](https://prettier.io/)                       | Code formatter              | An opinionated code formatter. | [Documentation](https://prettier.io/docs/en/index.html) |
| [Zod](https://github.com/colinhacks/zod)               | TypeScript schema validation | TypeScript-first schema validation with static type inference. | [GitHub Repository](https://github.com/colinhacks/zod) |
| [Tippy.js](https://atomiks.github.io/tippyjs/)         | Tooltip library             | Highly customizable tooltip and popover library. | [Documentation](https://atomiks.github.io/tippyjs/) |
| [React Custom Scroll](https://github.com/rommguy/react-custom-scroll) | Custom scrollbars | React component for custom scrollbars. | [GitHub Repository](https://github.com/rommguy/react-custom-scroll) |
| [Super React Gist](https://github.com/Jahans3/super-react-gist) | GitHub Gists in React | Embed GitHub Gists in React applications. | [GitHub Repository](https://github.com/Jahans3/super-react-gist) |
| [Clsx](https://github.com/lukeed/clsx)                 | Utility                    | A tiny utility for constructing className strings conditionally. | [GitHub Repository](https://github.com/lukeed/clsx) |
| [Class Variance Authority](https://github.com/joe-bell/cva) | Utility                 | Manage complex className logic. | [GitHub Repository](https://github.com/joe-bell/cva) |
| [Usehooks-ts](https://usehooks-ts.com/)                | React hooks                 | A collection of React hooks ready to use. | [Documentation](https://usehooks-ts.com/) |
| [Sass Loader](https://webpack.js.org/loaders/sass-loader/) | Webpack loader          | Loads and compiles Sass/SCSS files. | [Documentation](https://webpack.js.org/loaders/sass-loader/) |
| [PostCSS](https://postcss.org/)                        | CSS tool                    | A tool for transforming CSS with JavaScript. | [Documentation](https://postcss.org/) |
| [Autoprefixer](https://github.com/postcss/autoprefixer) | CSS tool                 | Parse CSS and add vendor prefixes. | [GitHub Repository](https://github.com/postcss/autoprefixer) |
| [Tailwind Merge](https://github.com/dcastil/tailwind-merge) | Utility                | Merge Tailwind CSS classes without conflicts. | [GitHub Repository](https://github.com/dcastil/tailwind-merge) |
| [Tailwind CSS Animate](https://github.com/benface/tailwindcss-animate) | CSS plugin          | Adds animation utilities to Tailwind CSS. | [GitHub Repository](https://github.com/benface/tailwindcss-animate) |
| [TsParticles](https://github.com/matteobruni/tsparticles) | Particle animations   | Easily create highly customizable particle animations. | [GitHub Repository](https://github.com/matteobruni/tsparticles) |
| [Gray Matter](https://github.com/jonschlinkert/gray-matter) | Frontmatter parser   | Parse frontmatter from strings or files. | [GitHub Repository](https://github.com/jonschlinkert/gray-matter) |
| [Feed](https://github.com/node-feed) | RSS and Atom Feeds | A library for creating RSS and Atom feeds for web applications. | [GitHub Repository](https://github.com/node-feed) |

</details>

---

<div align='center'>
  <img height=35 src="https://github.com/user-attachments/assets/d14e9e05-b1a5-4b24-a8da-862453a01641"/>
</div>

---
