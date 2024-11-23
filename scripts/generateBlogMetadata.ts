import path from "path";
import matter from "gray-matter";
import { promises as fs } from 'fs';
import readingTime from "reading-time";
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const postsDirectory = path.join(process.cwd(), "app/blog/posts");
const cacheDirectory = path.join(process.cwd(), ".cache");

interface AdjacentPost {
  slug: string;
  title: string;
}

interface PostMetadata {
  slug: string;
  title: string;
  summary: string;
  created: string;    // Add this
  updated?: string;   // Add this
  date?: string;      // Keep for backwards compatibility
  tags: string[];
  image?: string;
  caption?: string;
  content: string;
  readingTime: string;
  adjacent?: {
    prev: AdjacentPost | null;
    next: AdjacentPost | null;
  };
  sortings?: {
    byDate: {
      asc: string[];
      desc: string[];
    };
    byTitle: {
      asc: string[];
      desc: string[];
    };
  };
}

async function getAllMdxFiles(dir: string, files: string[] = []): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const pagePath = path.join(fullPath, "page.mdx");
      try {
        await fs.access(pagePath);
        files.push(pagePath);
      } catch {
        await getAllMdxFiles(fullPath, files);
      }
    }
  }

  return files;
}

async function getFileGitDates(filePath: string) {
  try {
    // Get creation date (first commit)
    const { stdout: created } = await execAsync(
      `git log --follow --format=%aI --reverse "${filePath}" | head -1`
    );
    
    // Get last modified date (latest commit)
    const { stdout: updated } = await execAsync(
      `git log -1 --format=%aI "${filePath}"`
    );

    // Ensure dates are valid ISO strings or return null
    const createdDate = created.trim() ? new Date(created.trim()).toISOString() : null;
    const updatedDate = updated.trim() ? new Date(updated.trim()).toISOString() : null;

    return {
      created: createdDate,
      updated: updatedDate
    };
  } catch (error) {
    console.warn(`Failed to get git dates for ${filePath}:`, error);
    return { created: null, updated: null };
  }
}

async function generateMetadata() {
  try {
    console.log('Starting metadata generation...');
    
    // Create cache directory if it doesn't exist
    await fs.mkdir(cacheDirectory, { recursive: true });
    console.log(`Cache directory ensured at: ${cacheDirectory}`);

    const files = await getAllMdxFiles(postsDirectory);
    console.log(`Found ${files.length} MDX files.`);

    const metadata: Record<string, PostMetadata> = {};
    const slugs: string[] = [];

    // Process each MDX file
    await Promise.all(files.map(async (file) => {
      const fileContents = await fs.readFile(file, 'utf8');
      const { data, content } = matter(fileContents);
      const relativePath = path.relative(postsDirectory, file);
      const slug = path.dirname(relativePath).replace(/\\/g, '/');
      const stats = readingTime(content);

      // Get file stats
      const fileStats = await fs.stat(file);
      
      // Get git dates
      const gitDates = await getFileGitDates(file);

      // Ensure dates are in ISO format
      const created = data.created 
        ? new Date(data.created).toISOString()
        : gitDates.created 
          ? gitDates.created 
          : fileStats.birthtime.toISOString();

      const updated = gitDates.updated 
        ? gitDates.updated 
        : fileStats.mtime.toISOString();

      slugs.push(slug);
      metadata[slug] = {
        slug,
        title: data.title,
        summary: data.summary || '',
        created,
        updated,
        date: created, // Keep for compatibility
        tags: data.tags || [],
        image: data.image,
        caption: data.caption,
        content: content, // Include full content for search
        readingTime: stats.text,
      };

      console.log(`Processed metadata for: ${slug}`);
    }));

    // Sort slugs by created date
    const sortedSlugs = slugs.sort((a, b) => {
      const dateA = metadata[a].created;
      const dateB = metadata[b].created;
      
      if (!dateA || !dateB) return 0;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

    // Add adjacent post information
    sortedSlugs.forEach((slug, index) => {
      const prevPost = sortedSlugs[index + 1];
      const nextPost = sortedSlugs[index - 1];

      metadata[slug].adjacent = {
        prev: prevPost ? {
          slug: prevPost,
          title: metadata[prevPost].title
        } : null,
        next: nextPost ? {
          slug: nextPost,
          title: metadata[nextPost].title
        } : null
      };
    });

    // Generate sort orders
    const byDate = {
      asc: [...slugs].sort((a, b) => {
        const dateA = metadata[a].created;
        const dateB = metadata[b].created;
        
        if (!dateA || !dateB) return 0;
        return new Date(dateA).getTime() - new Date(dateB).getTime();
      }),
      desc: [...slugs].sort((a, b) => {
        const dateA = metadata[a].created;
        const dateB = metadata[b].created;
        
        if (!dateA || !dateB) return 0;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      }),
    };

    const byTitle = {
      asc: [...slugs].sort((a, b) => 
        metadata[a].title.localeCompare(metadata[b].title)
      ),
      desc: [...slugs].sort((a, b) => 
        metadata[b].title.localeCompare(metadata[a].title)
      ),
    };

    // Add sort orders to metadata
    Object.values(metadata).forEach(post => {
      post.sortings = {
        byDate,
        byTitle,
      };
    });

    // Write metadata to cache file
    await fs.writeFile(
      path.join(cacheDirectory, 'posts-metadata.json'),
      JSON.stringify(metadata, null, 2),
      'utf8'
    );

    console.log('Successfully generated posts metadata');
  } catch (error) {
    console.error('Error generating posts metadata:', error);
    process.exit(1);
  }
}

generateMetadata();
