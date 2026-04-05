import { describe, expect, it } from 'vitest';
import { getConfig } from '@/lib/config';
import { metadata as archiveMetadata } from '../blog/archive/page';
import { metadata as privacyMetadata } from '../privacy/layout';
import { generateMetadata as generateTagMetadata } from '../blog/tags/[tag]/page';

const siteUrl = getConfig().site.url;

describe('route metadata surfaces', () => {
  it('sets canonical and social metadata for the archive page', () => {
    expect(archiveMetadata.alternates?.canonical).toBe(`${siteUrl}/blog/archive`);
    expect(archiveMetadata.openGraph?.url).toBe(`${siteUrl}/blog/archive`);
    expect(archiveMetadata.twitter?.title).toBe('Archive - Wyatt Walsh');
  });

  it('sets canonical and social metadata for the privacy page', () => {
    expect(privacyMetadata.alternates?.canonical).toBe(`${siteUrl}/privacy`);
    expect(privacyMetadata.openGraph?.url).toBe(`${siteUrl}/privacy`);
    expect(privacyMetadata.twitter?.title).toBe('Privacy Policy - Wyatt Walsh');
  });

  it('generates canonical and social metadata for tag pages', async () => {
    const tag = 'Data Science';
    const encodedTag = encodeURIComponent(tag);
    const metadata = await generateTagMetadata({
      params: Promise.resolve({ tag: encodedTag }),
    });

    expect(metadata.alternates?.canonical).toBe(`${siteUrl}/blog/tags/${encodedTag}`);
    expect(metadata.openGraph?.url).toBe(`${siteUrl}/blog/tags/${encodedTag}`);
    expect(metadata.twitter?.title).toBe(`#${tag} Posts - Wyatt Walsh`);
  });
});
