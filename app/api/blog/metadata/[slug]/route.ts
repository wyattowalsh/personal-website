import { NextRequest } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

const CACHE_PATH = path.join(process.cwd(), '.cache', 'posts-metadata.json');

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    
    // Read and parse cache
    const cacheContent = await fs.readFile(CACHE_PATH, 'utf-8');
    const allMetadata = JSON.parse(cacheContent);

    // Get current post metadata
    const postMetadata = allMetadata[slug];
    
    if (!postMetadata) {
      console.error(`Post metadata not found for slug: ${slug}`);
      return new Response(
        JSON.stringify({ error: 'Post not found' }), 
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Sort all posts by date to determine adjacent posts
    const sortedSlugs = Object.keys(allMetadata).sort((a, b) => 
      new Date(allMetadata[b].date).getTime() - new Date(allMetadata[a].date).getTime()
    );

    const currentIndex = sortedSlugs.indexOf(slug);
    const adjacent = {
      prev: currentIndex < sortedSlugs.length - 1 ? {
        slug: sortedSlugs[currentIndex + 1],
        title: allMetadata[sortedSlugs[currentIndex + 1]].title
      } : null,
      next: currentIndex > 0 ? {
        slug: sortedSlugs[currentIndex - 1],
        title: allMetadata[sortedSlugs[currentIndex - 1]].title
      } : null
    };

    // Return metadata with adjacent posts
    return new Response(
      JSON.stringify({ 
        metadata: {
          ...postMetadata,
          adjacent
        }
      }), 
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );

  } catch (error) {
    console.error('Error retrieving post metadata:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to load post metadata',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
