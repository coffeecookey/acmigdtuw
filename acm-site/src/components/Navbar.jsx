import { useState, useEffect } from 'react'
import React from 'react'

const NAV_LINKS = [
  { label: 'About',    href: '#about' },
  { label: 'Events',   href: '#events' },
  { label: 'Projects', href: '#projects' },
  { label: 'Team',     href: '#team' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <style>{`
        .nb-link {
          padding: 7px 15px;
          border-radius: 8px;
          font-size: 13.5px;
          font-weight: 500;
          color: rgba(0,0,0,0.6);
          text-decoration: none;
          position: relative;
          transition: color 0.15s;
        }
        .nb-link::after {
          content: '';
          position: absolute;
          bottom: 3px; left: 15px; right: 15px;
          height: 1.5px;
          border-radius: 2px;
          background: #0082aa;
          transform: scaleX(0);
          transform-origin: center;
          transition: transform 0.2s cubic-bezier(0.16,1,0.3,1);
        }
        .nb-link:hover { color: #0082aa; }
        .nb-link:hover::after { transform: scaleX(1); }

        .nb-join {
          padding: 9px 22px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 650;
          background: #0082aa;
          color: #fff;
          text-decoration: none;
          box-shadow: 0 2px 12px rgba(0,130,170,0.3), inset 0 1px 0 rgba(255,255,255,0.15);
          transition: transform 0.15s, box-shadow 0.15s;
          letter-spacing: -0.01em;
        }
        .nb-join:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 22px rgba(0,130,170,0.4), inset 0 1px 0 rgba(255,255,255,0.2);
        }
        .nb-join:active { transform: translateY(0); }

        @media (max-width: 640px) {
          .nb-links { display: none !important; }
          .nb-burger { display: flex !important; }
          .nb-join   { padding: 8px 16px !important; font-size: 12px !important; }
        }
      `}</style>

      {/* ── Nav bar ──────────────────────────────────────────── */}
      <nav
        role="navigation"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          zIndex: 1000, height: 64,
          display: 'flex', alignItems: 'center',
          padding: '0 clamp(16px, 4vw, 56px)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          background: scrolled
            ? 'rgba(255,255,255,0.92)'
            : 'rgba(255,255,255,0.7)',
          borderBottom: scrolled
            ? '1px solid rgba(0,0,0,0.09)'
            : '1px solid rgba(0,0,0,0.05)',
          transition: 'background 0.35s ease, border-color 0.35s ease',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        {/* Brand */}
        <a
          href="#"
          style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(0,130,170,0.1)',
            border: '1px solid rgba(0,130,170,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 900, color: '#0082aa',
            boxShadow: '0 2px 8px rgba(0,130,170,0.1)',
          }}>
            ◆
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: '#0d1117', lineHeight: 1.1, letterSpacing: '-0.025em' }}>
              ACM IGDTUW
            </div>
            <div style={{ fontSize: 9.5, fontWeight: 600, color: 'rgba(0,0,0,0.38)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Student Chapter
            </div>
          </div>
        </a>

        {/* Desktop links */}
        <div className="nb-links" style={{ display: 'flex', gap: 2, margin: '0 auto' }}>
          {NAV_LINKS.map(({ label, href }) => (
            <a key={label} href={href} className="nb-link">
              {label}
            </a>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <a href="#join" className="nb-join">
            Join Us →
          </a>

          {/* Hamburger */}
          <button
            className="nb-burger"
            onClick={() => setMenuOpen(m => !m)}
            aria-label="Toggle menu"
            style={{
              display: 'none',
              flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5,
              width: 38, height: 38, padding: 0,
              background: 'rgba(0,0,0,0.04)',
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: 8, cursor: 'pointer',
            }}
          >
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                display: 'block',
                width: menuOpen && i === 1 ? 0 : 18,
                height: 1.5, borderRadius: 2,
                background: '#333',
                transition: 'all 0.22s ease',
                transform: menuOpen
                  ? (i === 0 ? 'translateY(6.5px) rotate(45deg)'
                    : i === 2 ? 'translateY(-6.5px) rotate(-45deg)'
                    : 'none')
                  : 'none',
                opacity: menuOpen && i === 1 ? 0 : 1,
              }} />
            ))}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div style={{
        position: 'fixed', top: 64, left: 0, right: 0,
        zIndex: 999,
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        padding: menuOpen ? '16px 24px 28px' : '0 24px',
        maxHeight: menuOpen ? 320 : 0,
        overflow: 'hidden',
        transition: 'max-height 0.35s cubic-bezier(0.16,1,0.3,1), padding 0.3s ease',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>
        {NAV_LINKS.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            onClick={() => setMenuOpen(false)}
            style={{
              display: 'block',
              padding: '13px 0',
              fontSize: 15, fontWeight: 500,
              color: 'rgba(0,0,0,0.72)',
              textDecoration: 'none',
              borderBottom: '1px solid rgba(0,0,0,0.07)',
            }}
          >
            {label}
          </a>
        ))}
        <a
          href="#join"
          onClick={() => setMenuOpen(false)}
          style={{
            display: 'block', marginTop: 16,
            padding: '13px', borderRadius: 10, textAlign: 'center',
            background: '#0082aa', color: '#fff',
            fontSize: 15, fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          Join Us →
        </a>
      </div>
    </>
  )
}
