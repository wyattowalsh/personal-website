import { ImageResponse } from 'next/og';
import { BackendService } from '@/lib/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const runtime = 'nodejs';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';
export const alt = 'Blog post cover image';

const MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};

async function loadHeroImage(imagePath: string): Promise<string | null> {
  const ext = imagePath.substring(imagePath.lastIndexOf('.'));
  const mime = MIME_TYPES[ext];
  if (!mime) return null; // SVGs and unsupported formats use text card

  try {
    const buffer = await readFile(join(process.cwd(), 'public', imagePath));
    return `data:${mime};base64,${buffer.toString('base64')}`;
  } catch {
    return null;
  }
}

function TextCard({ post }: { post: { title: string; tags: string[]; created: string; readingTime?: string } }) {
  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0a0a0a',
        backgroundImage: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
        padding: '80px',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(circle at 30% 30%, rgba(106, 159, 181, 0.15) 0%, transparent 60%)',
        }}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
          zIndex: 1,
        }}
      >
        {post.tags.length > 0 && (
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: '20px',
                  padding: '8px 16px',
                  backgroundColor: 'rgba(106, 159, 181, 0.2)',
                  color: '#94c9db',
                  borderRadius: '6px',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <h1
          style={{
            fontSize: post.title.length > 60 ? '52px' : '64px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #ffffff 0%, #94c9db 100%)',
            backgroundClip: 'text',
            color: 'transparent',
            margin: 0,
            lineHeight: 1.2,
            maxWidth: '1000px',
          }}
        >
          {post.title}
        </h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '24px', color: '#94c9db', fontWeight: 'bold' }}>Wyatt Walsh</span>
            {post.created && (
              <span style={{ fontSize: '18px', color: '#6a9fb5', opacity: 0.8 }}>
                {new Date(post.created).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            )}
          </div>
          {post.readingTime && (
            <span style={{ fontSize: '20px', color: '#6a9fb5' }}>{post.readingTime}</span>
          )}
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: '8px',
          background: 'linear-gradient(90deg, transparent 0%, #6a9fb5 50%, transparent 100%)',
        }}
      />
    </div>
  );
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  await BackendService.ensurePreprocessed();
  const backend = BackendService.getInstance();
  const post = await backend.getPost(slug);

  if (!post) {
    return new ImageResponse(
      (
        <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0a0a' }}>
          <p style={{ fontSize: '48px', color: 'white' }}>Post Not Found</p>
        </div>
      ),
      { ...size }
    );
  }

  // Try to use the hero image as background
  const heroDataUri = post.image ? await loadHeroImage(post.image) : null;

  if (heroDataUri) {
    return new ImageResponse(
      (
        <div style={{ height: '100%', width: '100%', display: 'flex', position: 'relative' }}>
          {/* Hero image background */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroDataUri}
            alt=""
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {/* Dark gradient overlay for text readability */}
          <div
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%)',
            }}
          />
          {/* Content overlay */}
          <div
            style={{
              position: 'absolute',
              bottom: 0, left: 0, right: 0,
              display: 'flex',
              flexDirection: 'column',
              padding: '60px',
              gap: '16px',
            }}
          >
            {post.tags.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {post.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: '16px',
                      padding: '4px 12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      borderRadius: '4px',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <h1
              style={{
                fontSize: post.title.length > 60 ? '48px' : '56px',
                fontWeight: 'bold',
                color: '#ffffff',
                margin: 0,
                lineHeight: 1.2,
                textShadow: '0 2px 10px rgba(0,0,0,0.5)',
              }}
            >
              {post.title}
            </h1>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <span style={{ fontSize: '20px', color: '#e0e0e0', fontWeight: '600' }}>Wyatt Walsh</span>
              {post.readingTime && (
                <span style={{ fontSize: '18px', color: '#b0b0b0' }}>{post.readingTime}</span>
              )}
            </div>
          </div>
          {/* Bottom accent */}
          <div
            style={{
              position: 'absolute',
              bottom: 0, left: 0, right: 0,
              height: '6px',
              background: 'linear-gradient(90deg, transparent 0%, #6a9fb5 50%, transparent 100%)',
            }}
          />
        </div>
      ),
      { ...size }
    );
  }

  // Fallback to text card (SVG images, missing images, etc.)
  return new ImageResponse(<TextCard post={post} />, { ...size });
}
