import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

const CACHE_PATH = path.join(process.cwd(), '.cache', 'posts-metadata.json');

/**
 * Reads and parses the cache file.
 * @returns {Promise<Record<string, any>>} Parsed metadata object.
 * @throws Error if the file does not exist or is unreadable.
 */
async function readCacheFile(): Promise<Record<string, any>> {
    try {
        const cacheContent = await fs.readFile(CACHE_PATH, 'utf-8');
        return JSON.parse(cacheContent);
    } catch (error) {
        throw new Error('Failed to read or parse the metadata cache file.');
    }
}

/**
 * Determines adjacent posts based on the slug and sorted metadata.
 * @param slug Current post slug.
 * @param allMetadata Metadata for all posts.
 * @returns Object containing previous and next post information.
 */
function getAdjacentPosts(
    slug: string,
    allMetadata: Record<string, any>
): { prev: { slug: string; title: string } | null; next: { slug: string; title: string } | null } {
    const sortedSlugs = Object.keys(allMetadata).sort((a, b) =>
        new Date(allMetadata[b].created).getTime() - new Date(allMetadata[a].created).getTime()
    );

    const currentIndex = sortedSlugs.indexOf(slug);

    return {
        prev: currentIndex < sortedSlugs.length - 1
            ? {
                  slug: sortedSlugs[currentIndex + 1],
                  title: allMetadata[sortedSlugs[currentIndex + 1]].title,
              }
            : null,
        next: currentIndex > 0
            ? {
                  slug: sortedSlugs[currentIndex - 1],
                  title: allMetadata[sortedSlugs[currentIndex - 1]].title,
              }
            : null,
    };
}

/**
 * GET handler for retrieving post metadata.
 * @param request The incoming request object.
 * @returns {NextResponse} JSON response with metadata or error.
 */
export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const slug = url.pathname.split('/').pop(); // Extract slug from URL

    if (!slug) {
        return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    try {
        const allMetadata = await readCacheFile();
        const postMetadata = allMetadata[slug];

        if (!postMetadata) {
            console.error(`Post metadata not found for slug: ${slug}`);
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        const adjacent = getAdjacentPosts(slug, allMetadata);

        return NextResponse.json(
            {
                metadata: {
                    ...postMetadata,
                    adjacent,
                },
            },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
                },
            }
        );
    } catch (error) {
        console.error('Error retrieving post metadata:', error);
        return NextResponse.json(
            {
                error: 'Failed to load post metadata',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}