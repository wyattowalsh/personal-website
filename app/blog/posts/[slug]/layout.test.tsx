import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { ReactNode } from 'react';
import type { AdjacentPosts, Post, PostMetadata } from '@/lib/types';

const { mockNotFound } = vi.hoisted(() => {
	const notFoundError = new Error('NEXT_NOT_FOUND');

	return {
		mockNotFound: vi.fn(() => {
			throw notFoundError;
		}),
	};
});

const mockEnsurePreprocessed = vi.fn(() => Promise.resolve());
const mockGetPost = vi.fn();
const mockGetAdjacentPostLinks = vi.fn();
const mockGetRelatedPostSummaries = vi.fn();
const mockGetSeriesPosts = vi.fn();
const mockPostLayout = vi.fn();

vi.mock('next/navigation', () => ({
	notFound: mockNotFound,
}));

vi.mock('@/lib/server', () => ({
	BackendService: {
		ensurePreprocessed: () => mockEnsurePreprocessed(),
		getInstance: () => ({
			getPost: mockGetPost,
			getAdjacentPostLinks: mockGetAdjacentPostLinks,
			getRelatedPostSummaries: mockGetRelatedPostSummaries,
			getSeriesPosts: mockGetSeriesPosts,
		}),
	},
}));

vi.mock('@/components/PostLayout', () => ({
	PostLayout: ({
		children,
		post,
		adjacentPosts,
		relatedPosts,
		seriesNavigation,
	}: {
		children: ReactNode;
		post: PostMetadata;
		adjacentPosts: AdjacentPosts | null;
		relatedPosts: PostMetadata[];
		seriesNavigation: {
			seriesName: string;
			currentSlug: string;
			posts: Array<{ slug: string; title: string; order: number }>;
		} | null;
	}) => {
		mockPostLayout({
			children,
			post,
			adjacentPosts,
			relatedPosts,
			seriesNavigation,
		});

		return (
			<div>
				<div>Header: {post.title}</div>
				<div>
					Pagination:
					{adjacentPosts?.previous ? ` previous=${adjacentPosts.previous.title}` : ' previous=none'}
					{adjacentPosts?.next ? ` next=${adjacentPosts.next.title}` : ' next=none'}
				</div>
				<div>Related: {relatedPosts.map((relatedPost) => relatedPost.title).join(', ') || 'none'}</div>
				<div>
					Series:
					{seriesNavigation
						? ` ${seriesNavigation.seriesName} (${seriesNavigation.currentSlug}) [${seriesNavigation.posts.map((seriesPost) => `${seriesPost.order}:${seriesPost.title}`).join(', ')}]`
						: ' none'}
				</div>
				<div>{children}</div>
			</div>
		);
	},
}));

import PostSlugLayout from './layout';

function createMockPost(overrides: Partial<Post> = {}): Post {
	return {
		slug: 'server-rendered-post',
		title: 'Server Rendered Post',
		summary: 'Post summary',
		content: 'Post content',
		created: '2025-03-15',
		updated: '2025-03-16',
		tags: ['Testing'],
		readingTime: '5 min read',
		wordCount: 1200,
		...overrides,
	};
}

const mockPost = createMockPost({
	series: {
		name: 'Testing Series',
		order: 2,
	},
});

const mockAdjacentPosts: AdjacentPosts = {
	previous: { slug: 'previous-post', title: 'Previous Post' },
	next: { slug: 'next-post', title: 'Next Post' },
};

const mockRelatedPosts: PostMetadata[] = [
	{
		slug: 'related-post',
		title: 'Related Post',
		summary: 'Related summary',
		created: '2025-03-10',
		updated: '2025-03-11',
		tags: ['Testing'],
		readingTime: '4 min read',
	},
];

const mockSeriesPosts: Post[] = [
	createMockPost({
		slug: 'series-introduction',
		title: 'Series Introduction',
		series: { name: 'Testing Series', order: 1 },
	}),
	mockPost,
	createMockPost({
		slug: 'series-wrap-up',
		title: 'Series Wrap Up',
		series: { name: 'Testing Series', order: 3 },
	}),
];

async function renderLayout(slug = mockPost.slug) {
	const element = await PostSlugLayout({
		children: <div>Rendered post body</div>,
		params: Promise.resolve({ slug }),
	});

	return renderToStaticMarkup(element);
}

describe('PostSlugLayout', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockEnsurePreprocessed.mockResolvedValue(undefined);
		mockGetPost.mockResolvedValue(mockPost);
		mockGetAdjacentPostLinks.mockResolvedValue(mockAdjacentPosts);
		mockGetRelatedPostSummaries.mockResolvedValue(mockRelatedPosts);
		mockGetSeriesPosts.mockResolvedValue(mockSeriesPosts);
	});

	it('should emit JSON-LD and render the server-fetched post shell when the post exists', async () => {
		const markup = await renderLayout();
		const structuredDataMatch = markup.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
		expect(structuredDataMatch).not.toBeNull();

		const structuredData = JSON.parse(structuredDataMatch![1]) as Array<Record<string, unknown>>;
		const articleSchema = structuredData.find((schema) => schema['@type'] === 'BlogPosting');
		const breadcrumbSchema = structuredData.find((schema) => schema['@type'] === 'BreadcrumbList');

		expect(mockEnsurePreprocessed).toHaveBeenCalledOnce();
		expect(mockGetPost).toHaveBeenCalledOnce();
		expect(mockGetAdjacentPostLinks).toHaveBeenCalledOnce();
		expect(mockGetRelatedPostSummaries).toHaveBeenCalledOnce();
		expect(mockGetSeriesPosts).toHaveBeenCalledOnce();
		expect(mockGetPost).toHaveBeenCalledWith(mockPost.slug);
		expect(mockGetAdjacentPostLinks).toHaveBeenCalledWith(mockPost.slug);
		expect(mockGetRelatedPostSummaries).toHaveBeenCalledWith(mockPost.slug);
		expect(mockGetSeriesPosts).toHaveBeenCalledWith('Testing Series');
		expect(mockPostLayout).toHaveBeenCalledOnce();
		expect(mockPostLayout.mock.calls[0]?.[0]).toMatchObject({
			post: mockPost,
			adjacentPosts: mockAdjacentPosts,
			relatedPosts: mockRelatedPosts,
			seriesNavigation: {
				seriesName: 'Testing Series',
				currentSlug: 'server-rendered-post',
				posts: [
					{ slug: 'series-introduction', title: 'Series Introduction', order: 1 },
					{ slug: 'server-rendered-post', title: 'Server Rendered Post', order: 2 },
					{ slug: 'series-wrap-up', title: 'Series Wrap Up', order: 3 },
				],
			},
		});
		expect(articleSchema).toMatchObject({
			'@type': 'BlogPosting',
			headline: 'Server Rendered Post',
			mainEntityOfPage: {
				'@id': expect.stringContaining('/blog/posts/server-rendered-post'),
			},
		});
		expect(breadcrumbSchema).toMatchObject({
			'@type': 'BreadcrumbList',
			itemListElement: expect.arrayContaining([
				expect.objectContaining({
					name: 'Server Rendered Post',
					item: expect.stringContaining('/blog/posts/server-rendered-post'),
				}),
			]),
		});
		expect(markup).toContain('Header: Server Rendered Post');
		expect(markup).toContain('Previous Post');
		expect(markup).toContain('Next Post');
		expect(markup).toContain('Related Post');
		expect(markup).toContain('Testing Series');
		expect(markup).toContain('Series Introduction');
		expect(markup).toContain('Rendered post body');
	});

	it('should call notFound when the slug does not match a post', async () => {
		mockGetPost.mockResolvedValueOnce(null);

		await expect(
			PostSlugLayout({
				children: <div>Rendered post body</div>,
				params: Promise.resolve({ slug: 'missing-post' }),
			})
		).rejects.toThrow('NEXT_NOT_FOUND');

		expect(mockNotFound).toHaveBeenCalledOnce();
		expect(mockGetAdjacentPostLinks).not.toHaveBeenCalled();
		expect(mockGetRelatedPostSummaries).not.toHaveBeenCalled();
		expect(mockGetSeriesPosts).not.toHaveBeenCalled();
	});
});
