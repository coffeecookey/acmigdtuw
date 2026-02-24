import { useEffect, useState } from 'react'
import { setPlaying } from '../../lib/store'

export default function GameOverlay() {
  const [playing, setPlayingState] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      setPlayingState(e.detail.playing)
      document.body.dataset.playing = e.detail.playing ? 'true' : 'false'
    }
    window.addEventListener('acm-playing', handler)
    return () => window.removeEventListener('acm-playing', handler)
  }, [])

  const goBack = () => setPlaying(false)

  return (
    <>
      {/* ── Back button — shown when zoomed in to play ── */}
      {playing && (
        <>
          <button
            onClick={goBack}
            style={{
              position: 'fixed',
              top: '78px',
              left: '24px',
              zIndex: 1200,
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(4,8,15,0.88)',
              border: '1px solid rgba(0,196,224,0.4)',
              borderRadius: '10px',
              padding: '10px 20px',
              color: '#00c4e0',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              fontFamily: 'Inter, system-ui, sans-serif',
              cursor: 'pointer',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 0 20px rgba(0,196,224,0.2)',
              transition: 'all 0.2s ease',
              animation: 'acm-fade-up 0.35s ease both',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(0,130,170,0.25)'
              e.currentTarget.style.boxShadow  = '0 0 32px rgba(0,196,224,0.4)'
              e.currentTarget.style.transform   = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(4,8,15,0.88)'
              e.currentTarget.style.boxShadow  = '0 0 20px rgba(0,196,224,0.2)'
              e.currentTarget.style.transform   = 'translateY(0)'
            }}
          >
            ← Back to site
          </button>

          {/* ESC hint — top right */}
          <div
            aria-hidden="true"
            style={{
              position: 'fixed',
              top: '82px',
              right: '28px',
              zIndex: 1200,
              pointerEvents: 'none',
              color: 'rgba(255,255,255,0.35)',
              fontSize: '11px',
              fontFamily: "'Courier New', monospace",
              letterSpacing: '0.1em',
              animation: 'acm-fade-up 0.35s ease both',
            }}
          >
            ESC to exit
          </div>

          {/* Controls reminder — bottom centre */}
          <div
            aria-hidden="true"
            style={{
              position: 'fixed',
              bottom: '28px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1200,
              pointerEvents: 'none',
              display: 'flex',
              gap: '18px',
              color: 'rgba(255,255,255,0.4)',
              fontSize: '11px',
              fontFamily: "'Courier New', monospace",
              letterSpacing: '0.08em',
              animation: 'acm-fade-up 0.4s ease both',
            }}
          >
            <span style={{ padding: '4px 10px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px' }}>← Left</span>
            <span style={{ padding: '4px 10px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px' }}>→ Right</span>
          </div>
        </>
      )}
    </>
  )
}
