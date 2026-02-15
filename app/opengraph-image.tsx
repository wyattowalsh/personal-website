import { ImageResponse } from 'next/og';
import { getConfig } from '@/lib/core';

export const runtime = 'nodejs';
export const alt = 'Wyatt Walsh';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  const config = getConfig();

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          backgroundImage: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
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
            background: 'radial-gradient(circle at 50% 50%, rgba(106, 159, 181, 0.15) 0%, transparent 70%)',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px',
            zIndex: 1,
          }}
        >
          {/* Title */}
          <h1
            style={{
              fontSize: '80px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #6a9fb5 0%, #94c9db 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              margin: 0,
              marginBottom: '24px',
              textAlign: 'center',
            }}
          >
            {config.site.title}
          </h1>

          {/* Description */}
          <p
            style={{
              fontSize: '32px',
              color: '#94c9db',
              margin: 0,
              textAlign: 'center',
              maxWidth: '900px',
              opacity: 0.9,
            }}
          >
            {config.site.description}
          </p>
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
