import { describe, it, expect } from 'vitest';
import { stripMdxSyntax, formatDate, isExternal, cn, extractPostSlug, isDifferentDate } from '@/lib/utils';

describe('stripMdxSyntax', () => {
  it('preserves plain text', () => {
    expect(stripMdxSyntax('Hello world')).toBe('Hello world');
  });

  it('strips import statements', () => {
    const input = `import { Foo } from '@/components/Foo'\n\nSome content`;
    expect(stripMdxSyntax(input)).toBe('Some content');
  });

  it('strips self-closing JSX components', () => {
    const input = 'Before <MyComponent prop="val" /> After';
    expect(stripMdxSyntax(input)).toBe('Before  After');
  });

  it('strips JSX components with children', () => {
    const input = 'Before <MyComponent>child content</MyComponent> After';
    expect(stripMdxSyntax(input)).toBe('Before  After');
  });

  it('preserves curly-brace content like objects and math expressions', () => {
    expect(stripMdxSyntax('{key: "value"}')).toBe('{key: "value"}');
    expect(stripMdxSyntax('{x^2}')).toBe('{x^2}');
  });

  it('strips triple+ newlines to double', () => {
    const input = 'Line 1\n\n\n\nLine 2';
    expect(stripMdxSyntax(input)).toBe('Line 1\n\nLine 2');
  });

  it('strips ArticleJsonLd component', () => {
    const input = 'Before <ArticleJsonLd title="Test" /> After';
    expect(stripMdxSyntax(input)).toBe('Before  After');
  });

  it('strips markdown presentation syntax while preserving readable text', () => {
    const input = '# Heading\n\n**Bold** and *italic* with [Link](https://example.com) and `code`\n- item';
    expect(stripMdxSyntax(input)).toBe('Heading\n\nBold and italic with Link and code\nitem');
  });

  it('strips fenced code blocks and image markup without leaking delimiters', () => {
    const input = '![Diagram](/diagram.png)\n\n```ts\nconst value = 1;\n```';
    expect(stripMdxSyntax(input)).toBe('Diagram\n\nconst value = 1;');
  });
});

describe('formatDate', () => {
  it('formats a valid string date', () => {
    // Use a mid-month date with explicit time to avoid timezone boundary issues
    const result = formatDate('2025-06-15T12:00:00');
    expect(result).toContain('June');
    expect(result).toContain('15');
    expect(result).toContain('2025');
  });

  it('formats a valid Date object', () => {
    // Construct with year/month/day to use local timezone
    const result = formatDate(new Date(2025, 0, 15));
    expect(result).toContain('2025');
    expect(result).toContain('January');
    expect(result).toContain('15');
  });

  it('returns empty string for invalid input', () => {
    expect(formatDate('not-a-date')).toBe('');
  });

  it('returns empty string for empty string', () => {
    expect(formatDate('')).toBe('');
  });
});

describe('isExternal', () => {
  it('returns true for http:// URLs', () => {
    expect(isExternal('http://example.com')).toBe(true);
  });

  it('returns true for https:// URLs', () => {
    expect(isExternal('https://example.com')).toBe(true);
  });

  it('returns true for mailto: links', () => {
    expect(isExternal('mailto:test@example.com')).toBe(true);
  });

  it('returns true for tel: links', () => {
    expect(isExternal('tel:+1234567890')).toBe(true);
  });

  it('returns false for relative paths', () => {
    expect(isExternal('about')).toBe(false);
    expect(isExternal('./page')).toBe(false);
  });

  it('returns false for absolute paths', () => {
    expect(isExternal('/about')).toBe(false);
    expect(isExternal('/blog/posts/hello')).toBe(false);
  });

  it('is case insensitive', () => {
    expect(isExternal('HTTP://example.com')).toBe(true);
    expect(isExternal('HTTPS://example.com')).toBe(true);
  });
});

describe('cn', () => {
  it('merges class names', () => {
    const result = cn('px-4', 'py-2');
    expect(result).toContain('px-4');
    expect(result).toContain('py-2');
  });

  it('handles conditional classes', () => {
    const result = cn('base', false && 'hidden', 'visible');
    expect(result).not.toContain('hidden');
    expect(result).toContain('visible');
  });
});

describe('extractPostSlug', () => {
  it('extracts slug from /blog/posts/my-slug', () => {
    expect(extractPostSlug('/blog/posts/my-slug')).toBe('my-slug');
  });

  it('returns null for non-post paths', () => {
    expect(extractPostSlug('/blog')).toBeNull();
    expect(extractPostSlug('/blog/tags/Python')).toBeNull();
  });

  it('handles slugs with hyphens and numbers', () => {
    expect(extractPostSlug('/blog/posts/my-post-123')).toBe('my-post-123');
  });

  it('extracts slug when there are trailing path segments', () => {
    expect(extractPostSlug('/blog/posts/some-slug/edit')).toBe('some-slug');
  });

  it('returns null for empty string', () => {
    expect(extractPostSlug('')).toBeNull();
  });

  it('returns null for root path', () => {
    expect(extractPostSlug('/')).toBeNull();
  });

  it('extracts archive-prefixed slugs correctly', () => {
    expect(extractPostSlug('/blog/posts/archive-2024')).toBe('archive-2024');
  });

  it('returns null for /blog/archive', () => {
    expect(extractPostSlug('/blog/archive')).toBeNull();
  });

  it('returns null for /blog/search', () => {
    expect(extractPostSlug('/blog/search')).toBeNull();
  });
});

describe('isDifferentDate', () => {
  it('returns true when dates differ', () => {
    expect(isDifferentDate('2024-01-01', '2024-01-02')).toBe(true);
  });

  it('returns false when dates are the same', () => {
    expect(isDifferentDate('2024-01-01', '2024-01-01')).toBe(false);
  });

  it('returns false when second date is undefined', () => {
    expect(isDifferentDate('2024-01-01', undefined)).toBe(false);
  });

  it('returns false when first date is undefined', () => {
    expect(isDifferentDate(undefined, '2024-01-01')).toBe(false);
  });

  it('returns false when both dates are undefined', () => {
    expect(isDifferentDate(undefined, undefined)).toBe(false);
  });

  it('returns true for same day different time representations across day boundary', () => {
    expect(isDifferentDate('2024-06-15', '2024-06-16')).toBe(true);
  });

  it('returns false for same calendar date with different time components', () => {
    expect(isDifferentDate('2024-06-15T08:00:00Z', '2024-06-15T20:00:00Z')).toBe(false);
  });

  it('returns false for invalid date strings', () => {
    expect(isDifferentDate('not-a-date', '2024-01-01')).toBe(false);
  });
});
