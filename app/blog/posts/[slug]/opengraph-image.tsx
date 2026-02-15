import { ImageResponse } from 'next/og';
import { BackendService } from '@/lib/server';

export const runtime = 'nodejs';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  await BackendService.ensurePreprocessed();
  const backend = BackendService.getInstance();
  const post = await backend.getPost(slug);

  if (!post) {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0a0a0a',
          }}
        >
          <p style={{ fontSize: '48px', color: 'white' }}>Post Not Found</p>
        </div>
      ),
      { ...size }
    );
  }

  return new ImageResponse(
    (
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
        {/* Gradient overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 30% 30%, rgba(106, 159, 181, 0.15) 0%, transparent 60%)',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
            zIndex: 1,
          }}
        >
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
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

          {/* Title */}
          <h1
            style={{
              fontSize: post.title.length > 60 ? '52px' : '64px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #ffffff 0%, #94c9db 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              margin: 0,
              lineHeight: 1.2,
              maxWidth: '1000px',
            }}
          >
            {post.title}
          </h1>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '24px', color: '#94c9db', fontWeight: 'bold' }}>
                Wyatt Walsh
              </span>
              {post.created && (
                <span style={{ fontSize: '18px', color: '#6a9fb5', opacity: 0.8 }}>
                  {new Date(post.created).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              )}
            </div>
            {post.readingTime && (
              <span style={{ fontSize: '20px', color: '#6a9fb5' }}>
                {post.readingTime}
              </span>
            )}
          </div>
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '8px',
            background: 'linear-gradient(90deg, transparent 0%, #6a9fb5 50%, transparent 100%)',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
