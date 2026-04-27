import { describe, it, expect, vi } from 'vitest';
import type { Post } from '@/lib/types';

// Mock getConfig before importing schema module
vi.mock('@/lib/config', () => {
  const config = {
    site: {
      name: 'Test Author',
      url: 'https://test.example.com',
      title: 'Test Site',
      description: 'Test description',
      locale: 'en_US',
      brand: {
        name: 'Test Brand',
        shortName: 'test',
        domain: 'test.example.com',
        aliases: ['test', 'testauthor'],
        ogImagePath: '/opengraph.png',
        logoPath: '/logo.webp',
      },
      author: {
        name: 'Test Author',
        email: 'test@example.com',
        jobTitle: 'Test Engineer',
        twitter: 'testauthor',
        github: 'testauthor',
        linkedin: 'testauthor',
        kaggle: 'testauthor',
        codepen: 'testauthor',
        reddit: 'testauthor',
      },
    },
    blog: { postsPerPage: 10, featuredLimit: 3 },
  };

  return {
    getConfig: () => config,
    getSiteIdentity: () => ({
      name: config.site.name,
      title: config.site.title,
      description: config.site.description,
      url: config.site.url,
      locale: config.site.locale,
      metadataBase: new URL(config.site.url),
      brandName: config.site.brand.name,
      brandShortName: config.site.brand.shortName,
      brandDomain: config.site.brand.domain,
      brandAliases: config.site.brand.aliases,
      ogImagePath: config.site.brand.ogImagePath,
      ogImageUrl: `${config.site.url}${config.site.brand.ogImagePath}`,
      logoPath: config.site.brand.logoPath,
      logoUrl: `${config.site.url}${config.site.brand.logoPath}`,
      author: config.site.author,
      twitterHandle: '@testauthor',
      socialLinks: [
        'https://github.com/testauthor',
        'https://twitter.com/testauthor',
        'https://linkedin.com/in/testauthor',
        'https://www.kaggle.com/testauthor',
        'https://codepen.io/testauthor',
        'https://www.reddit.com/user/testauthor',
      ],
      feedAlternates: {
        'application/rss+xml': '/feed.xml',
        'application/atom+xml': '/feed.atom',
        'application/feed+json': '/feed.json',
      },
    }),
  };
});

// Import after mock is set up
const { generateArticleSchema, generateBreadcrumbSchema, generateCollectionPageSchema, generateWebSiteSchema } = await import('@/lib/schema');

const mockPost: Post = {
  slug: 'test-post',
  title: 'Test Post Title',
  summary: 'A test post summary',
  content: 'Some test content here.',
  created: '2025-06-01',
  updated: '2025-06-15',
  tags: ['Testing', 'Vitest'],
  image: '/test-hero.svg',
  readingTime: '5 min read',
  wordCount: 250,
};

describe('generateWebSiteSchema', () => {
  it('returns valid Schema.org WebSite', () => {
    const schema = generateWebSiteSchema();
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('WebSite');
    expect(schema.name).toBe('Test Site');
    expect(schema.url).toBe('https://test.example.com');
  });

  it('includes potentialAction with SearchAction', () => {
    const schema = generateWebSiteSchema();
    expect(schema.potentialAction['@type']).toBe('SearchAction');
    expect(schema.potentialAction.target['@type']).toBe('EntryPoint');
    expect(schema.potentialAction.target.urlTemplate).toContain('search_term_string');
  });

  it('includes author information', () => {
    const schema = generateWebSiteSchema();
    expect(schema.author['@type']).toBe('Person');
    expect(schema.author.name).toBe('Test Author');
  });
});

describe('generateArticleSchema', () => {
  it('returns valid BlogPosting with required fields', () => {
    const schema = generateArticleSchema(mockPost);
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('BlogPosting');
    expect(schema.headline).toBe('Test Post Title');
    expect(schema.datePublished).toBe('2025-06-01');
    expect(schema.dateModified).toBe('2025-06-15');
  });

  it('includes author information', () => {
    const schema = generateArticleSchema(mockPost);
    expect(schema.author['@type']).toBe('Person');
    expect(schema.author.name).toBe('Test Author');
    expect(schema.author.url).toBe('https://test.example.com');
  });

  it('builds correct mainEntityOfPage URL', () => {
    const schema = generateArticleSchema(mockPost);
    expect(schema.mainEntityOfPage['@id']).toBe(
      'https://test.example.com/blog/posts/test-post'
    );
  });

  it('includes image when post has one', () => {
    const schema = generateArticleSchema(mockPost);
    expect(schema.image).toEqual(['https://test.example.com/test-hero.svg']);
  });

  it('includes keywords and wordCount', () => {
    const schema = generateArticleSchema(mockPost);
    expect(schema.keywords).toEqual(['Testing', 'Vitest']);
    expect(schema.wordCount).toBe(250);
  });

  it('uses created date as dateModified when updated is absent', () => {
    const postNoUpdate: Post = { ...mockPost, updated: undefined };
    const schema = generateArticleSchema(postNoUpdate);
    expect(schema.dateModified).toBe('2025-06-01');
  });
});

describe('generateBreadcrumbSchema', () => {
  it('returns BreadcrumbList with correct item positions', () => {
    const items = [
      { name: 'Home', item: '/' },
      { name: 'Blog', item: '/blog' },
      { name: 'Test Post', item: '/blog/posts/test-post' },
    ];
    const schema = generateBreadcrumbSchema(items, 'https://test.example.com');
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('BreadcrumbList');
    expect(schema.itemListElement).toHaveLength(3);
    expect(schema.itemListElement[0].position).toBe(1);
    expect(schema.itemListElement[1].position).toBe(2);
    expect(schema.itemListElement[2].position).toBe(3);
  });

  it('prepends baseUrl to each item', () => {
    const items = [{ name: 'Blog', item: '/blog' }];
    const schema = generateBreadcrumbSchema(items, 'https://test.example.com');
    expect(schema.itemListElement[0].item).toBe('https://test.example.com/blog');
  });
});

describe('generateCollectionPageSchema', () => {
  it('returns CollectionPage with ItemList', () => {
    const schema = generateCollectionPageSchema({
      name: 'Blog',
      description: 'All blog posts',
      url: 'https://test.example.com/blog',
      items: [
        { name: 'Post 1', url: 'https://test.example.com/blog/posts/post-1', datePublished: '2025-01-01' },
        { name: 'Post 2', url: 'https://test.example.com/blog/posts/post-2' },
      ],
    });

    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('CollectionPage');
    expect(schema.name).toBe('Blog');
    expect(schema.mainEntity['@type']).toBe('ItemList');
    expect(schema.mainEntity.numberOfItems).toBe(2);
    expect(schema.mainEntity.itemListElement).toHaveLength(2);
  });

  it('assigns correct positions starting at 1', () => {
    const schema = generateCollectionPageSchema({
      name: 'Blog',
      description: 'All posts',
      url: 'https://test.example.com/blog',
      items: [
        { name: 'A', url: '/a' },
        { name: 'B', url: '/b' },
        { name: 'C', url: '/c' },
      ],
    });
    expect(schema.mainEntity.itemListElement[0].position).toBe(1);
    expect(schema.mainEntity.itemListElement[1].position).toBe(2);
    expect(schema.mainEntity.itemListElement[2].position).toBe(3);
  });

  it('includes isPartOf linking to the WebSite', () => {
    const schema = generateCollectionPageSchema({
      name: 'Blog',
      description: 'Test',
      url: 'https://test.example.com/blog',
      items: [],
    });
    expect(schema.isPartOf['@type']).toBe('WebSite');
    expect(schema.isPartOf.url).toBe('https://test.example.com');
  });
});
