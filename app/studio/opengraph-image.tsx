import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Generative Art Studio'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #0f0f23, #1a1a2e, #16213e)',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        {/* Decorative gradient accent */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'radial-gradient(circle at 30% 40%, rgba(106, 159, 181, 0.15) 0%, transparent 60%)',
          }}
        />
        <div
          style={{
            fontSize: 72,
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #ffffff, #94c9db)',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Generative Art Studio
        </div>
        <div style={{ fontSize: 32, color: '#94c9db', marginTop: 16 }}>
          Create &bull; Share &bull; Remix
        </div>
        <div style={{ fontSize: 24, color: '#6a9fb5', marginTop: 8 }}>
          w4w.dev/studio
        </div>
        {/* Bottom accent line */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 8,
            background:
              'linear-gradient(90deg, transparent 0%, #6a9fb5 50%, transparent 100%)',
          }}
        />
      </div>
    ),
    { ...size }
  )
}
