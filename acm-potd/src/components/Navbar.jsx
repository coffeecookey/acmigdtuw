// Copy acm-logo.svg from acm-site/public/ into potd/public/
const MAIN_SITE_URL = 'https://acmigdtuw.github.io/acmigdtuw/'

export default function Navbar() {
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      height: 56,
      display: 'flex', alignItems: 'center',
      padding: '0 clamp(16px, 4vw, 48px)',
      background: 'rgba(4,8,15,0.88)',
      backdropFilter: 'blur(20px) saturate(1.4)',
      WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
      borderBottom: '1px solid rgba(0,130,170,0.12)',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>

      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <img
          src="/acm-logo.svg"
          alt="ACM IGDTUW"
          style={{ height: 26, width: 'auto', filter: 'drop-shadow(0 0 6px rgba(0,130,170,0.6))' }}
        />
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 13, letterSpacing: '-0.01em' }}>
          ACM IGDTUW
        </span>
      </div>

      <div style={{ flex: 1 }} />

      {/* Back to main site */}
      <a
        href={MAIN_SITE_URL}
        style={{
          fontSize: 12, fontWeight: 500,
          color: 'rgba(255,255,255,0.38)',
          textDecoration: 'none',
          transition: 'color 0.18s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.38)'}
      >
        ← acmigdtuw.com
      </a>
    </nav>
  )
}
