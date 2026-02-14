#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import readline from 'readline';

const POSTS_DIR = path.join(process.cwd(), 'app/blog/posts');

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function parseArgs(): Record<string, string> {
  const args: Record<string, string> = {};
  const argv = process.argv.slice(2);
  
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const value = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : '';
      args[key] = value;
    }
  }
  return args;
}

async function prompt(rl: readline.Interface, question: string, defaultValue?: string): Promise<string> {
  const suffix = defaultValue ? ` (${defaultValue})` : '';
  return new Promise((resolve) => {
    rl.question(`${question}${suffix}: `, (answer) => {
      resolve(answer.trim() || defaultValue || '');
    });
  });
}

function generateFrontmatter(meta: {
  title: string;
  slug: string;
  summary: string;
  tags: string[];
  image?: string;
  caption?: string;
}): string {
  const today = getToday();
  const tagsStr = meta.tags.length > 0 
    ? `[${meta.tags.map(t => `"${t}"`).join(', ')}]` 
    : '[]';
  
  return `---
title: "${meta.title}"
image: "${meta.image || `/${meta.slug}-hero.svg`}"
caption: "${meta.caption || ''}"
summary: "${meta.summary}"
tags: ${tagsStr}
created: "${today}"
updated: "${today}"
---

# ${meta.title}

Start writing your post here...
`;
}

async function createPost(meta: {
  title: string;
  slug: string;
  summary: string;
  tags: string[];
  image?: string;
  caption?: string;
}): Promise<string> {
  const postDir = path.join(POSTS_DIR, meta.slug);
  const postFile = path.join(postDir, 'page.mdx');
  
  // Check if post already exists
  try {
    await fs.access(postDir);
    throw new Error(`Post directory already exists: ${postDir}`);
  } catch (err: any) {
    if (err.code !== 'ENOENT') throw err;
  }
  
  // Create directory and file
  await fs.mkdir(postDir, { recursive: true });
  await fs.writeFile(postFile, generateFrontmatter(meta));
  
  return postFile;
}

async function main() {
  const args = parseArgs();
  
  // If title provided via CLI, use minimal prompting
  if (args.title) {
    const slug = args.slug || slugify(args.title);
    const tags = args.tags ? args.tags.split(',').map(t => t.trim()) : [];
    
    const filePath = await createPost({
      title: args.title,
      slug,
      summary: args.summary || '',
      tags,
      image: args.image,
      caption: args.caption,
    });
    
    console.log(`✓ Created: ${filePath}`);
    return;
  }
  
  // Interactive mode
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  try {
    console.log('\n📝 Create a new blog post\n');
    
    const title = await prompt(rl, 'Title');
    if (!title) {
      console.error('Error: Title is required');
      process.exit(1);
    }
    
    const defaultSlug = slugify(title);
    const slug = await prompt(rl, 'Slug', defaultSlug);
    const summary = await prompt(rl, 'Summary', '');
    const tagsInput = await prompt(rl, 'Tags (comma-separated)', '');
    const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()) : [];
    const caption = await prompt(rl, 'Caption', '');
    
    const filePath = await createPost({
      title,
      slug,
      summary,
      tags,
      caption,
    });
    
    console.log(`\n✓ Created: ${filePath}\n`);
  } finally {
    rl.close();
  }
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
