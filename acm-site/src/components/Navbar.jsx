import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const NAV_LINKS = [
  { label: 'About',    href: '#about'    },
  { label: 'Events',   href: '#events'   },
  { label: 'Projects', href: '#projects' },
  { label: 'Team',     href: '#team'     },
]

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const navRef = useRef()

  useEffect(() => {
    // Entrance
    gsap.fromTo(navRef.current,
      { y: -80, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.0, ease: 'expo.out', delay: 0.15 }
    )
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <style>{`
        .nb-link {
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          color: rgba(232,244,248,0.58);
          text-decoration: none;
          position: relative;
          transition: color 0.2s ease, background 0.2s ease;
        }
        .nb-link::after {
          content: '';
          position: absolute;
          bottom: 4px; left: 14px; right: 14px;
          height: 1.5px; border-radius: 2px;
          background: #00d4ff;
          transform: scaleX(0);
          transform-origin: center;
          transition: transform 0.22s cubic-bezier(0.16,1,0.3,1);
        }
        .nb-link:hover {
          color: #00d4ff;
          background: rgba(0,130,170,0.08);
        }
        .nb-link:hover::after { transform: scaleX(1); }

        .nb-join {
          padding: 8px 20px;
          border-radius: 9px;
          font-size: 13px; font-weight: 700;
          background: linear-gradient(135deg, #0082aa, #005f7f);
          color: #fff; text-decoration: none;
          box-shadow: 0 0 20px rgba(0,130,170,0.38);
          transition: transform 0.18s ease, box-shadow 0.18s ease;
          letter-spacing: 0.02em;
        }
        .nb-join:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 32px rgba(0,212,255,0.55);
        }

        @media (max-width: 640px) {
          .nb-links  { display: none !important; }
          .nb-burger { display: flex !important; }
        }
        @media (min-width: 641px) {
          .nb-mobile-drawer { display: none !important; }
        }
      `}</style>

      {/* Nav */}
      <nav
        ref={navRef}
        role="navigation"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          zIndex: 1000, height: '64px',
          display: 'flex', alignItems: 'center',
          padding: '0 clamp(16px, 4vw, 56px)',
          backdropFilter: 'blur(24px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.6)',
          background: scrolled
            ? 'rgba(4,8,15,0.92)'
            : 'rgba(4,8,15,0.35)',
          borderBottom: scrolled
            ? '1px solid rgba(0,130,170,0.18)'
            : '1px solid rgba(255,255,255,0.05)',
          transition: 'background 0.35s ease, border-color 0.35s ease',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        {/* Logo / brand */}
        <a href="#hero" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}>
          <img
            src="/acm-logo.svg"
            alt="ACM"
            style={{
              height: '30px', width: 'auto',
              filter: 'drop-shadow(0 0 8px rgba(0,130,170,0.7))',
            }}
          />
          <span style={{
            color: '#e8f4f8', fontWeight: 700, fontSize: '14px',
            letterSpacing: '-0.01em',
          }}>
          </span>
        </a>

        {/* Desktop links */}
        <div className="nb-links" style={{ display: 'flex', gap: '2px', margin: '0 auto' }}>
          {NAV_LINKS.map(({ label, href }) => (
            <a key={label} href={href} className="nb-link">{label}</a>
          ))}
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <a href="#join" className="nb-join">Join Us</a>

          {/* Hamburger */}
          <button
            className="nb-burger"
            onClick={() => setMenuOpen(m => !m)}
            aria-label="Toggle menu"
            style={{
              display: 'none',
              flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: '5px',
              width: '38px', height: '38px', padding: 0,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px', cursor: 'pointer',
            }}
          >
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                display: 'block',
                width: menuOpen && i === 1 ? 0 : '18px',
                height: '1.5px', borderRadius: '2px',
                background: '#e8f4f8',
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
      <div
        className="nb-mobile-drawer"
        style={{
          position: 'fixed', top: '64px', left: 0, right: 0,
          zIndex: 999,
          background: 'rgba(4,8,15,0.97)',
          backdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(0,130,170,0.12)',
          padding: menuOpen ? '16px 24px 28px' : '0 24px',
          maxHeight: menuOpen ? '320px' : 0,
          overflow: 'hidden',
          transition: 'max-height 0.35s cubic-bezier(0.16,1,0.3,1), padding 0.3s ease',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        {NAV_LINKS.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            onClick={() => setMenuOpen(false)}
            style={{
              display: 'block', padding: '13px 0',
              fontSize: '15px', fontWeight: 500,
              color: 'rgba(232,244,248,0.7)', textDecoration: 'none',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {label}
          </a>
        ))}
        <a
          href="#join"
          onClick={() => setMenuOpen(false)}
          style={{
            display: 'block', marginTop: '16px',
            padding: '13px', borderRadius: '10px', textAlign: 'center',
            background: 'linear-gradient(135deg, #0082aa, #005f7f)',
            color: '#fff', fontSize: '15px', fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          Join Us
        </a>
      </div>
    </>
  )
}
