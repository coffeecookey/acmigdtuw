import { useRef, useEffect } from 'react'
import React from 'react'

// ── Config ─────────────────────────────────────────────────────
const RADIUS       = 20
const ZONE_W       = 0.88
const ZONE_H       = 0.82
const SAMPLE_RES   = 1024
const WHITE_THRESH = 160

const ACCENT = { r: 0, g: 130, b: 170 }
const luma   = (r, g, b) => 0.299*r + 0.587*g + 0.114*b

// ══════════════════════════════════════════════════════════════
export default function PixelGridHero({
  imageSrc     = '/acm-logo.svg',
  imageAlt     = 'ACM Logo',
  zoneSize     = 300,
  headline     = (<>Build the <span className="pgx-grad">Future</span><br/>of Computing</>),
  subtext      = 'Join a community of makers, builders, and thinkers. Explore cutting-edge projects, workshops, and events that push the boundaries of CS.',
  ctaPrimary   = { label: 'Join ACM →', href: '#join' },
  ctaSecondary = { label: 'Explore Events', href: '#events' },
}) {
  const logoCanvasRef    = useRef(null)  // logo + teal-fill (full section canvas)
  const cursorCanvasRef  = useRef(null)  // right-half teal cursor circle canvas
  const invertedLayerRef = useRef(null)  // left-half teal+white clip-path layer
  const imgRef           = useRef(null)
  const sectionRef       = useRef(null)
  const hintRef          = useRef(null)

  useEffect(() => {
    const logoCanvas    = logoCanvasRef.current
    const cursorCanvas  = cursorCanvasRef.current
    const invertedLayer = invertedLayerRef.current
    const img           = imgRef.current
    const section       = sectionRef.current
    if (!logoCanvas || !cursorCanvas || !invertedLayer || !img || !section) return

    const lCtx = logoCanvas.getContext('2d')
    const cCtx = cursorCanvas.getContext('2d')
    const dpr  = Math.min(window.devicePixelRatio || 1, 2)

    const S = {
      CW: 0, CH: 0, offL: 0, offT: 0,
      mouse: { x: -9999, y: -9999 },
      zoneX: 0, zoneY: 0, zoneW: 0, zoneH: 0,
      glowE: 0,
      invCanvas: null,
      raf: null,
    }

    // ── Resize ────────────────────────────────────────────────
    function resize() {
      const secR = section.getBoundingClientRect()
      S.CW   = secR.width
      S.CH   = secR.height
      S.offL = secR.left
      S.offT = secR.top

      for (const cvs of [logoCanvas, cursorCanvas]) {
        cvs.width        = Math.round(S.CW * dpr)
        cvs.height       = Math.round(S.CH * dpr)
        cvs.style.width  = S.CW + 'px'
        cvs.style.height = S.CH + 'px'
      }
      lCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
      cCtx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Logo zone — centered in right half (section-local)
      const rightHalfCX = S.CW * 3 / 4
      const rightHalfW  = S.CW / 2
      const z  = Math.min(zoneSize, rightHalfW * ZONE_W, S.CH * ZONE_H)
      S.zoneX  = rightHalfCX - z / 2
      S.zoneY  = S.CH / 2 - z / 2
      S.zoneW  = z
      S.zoneH  = z
    }

    // ── Pre-compute color-inverted logo ───────────────────────
    function prepareInverted() {
      const off = document.createElement('canvas')
      off.width = off.height = SAMPLE_RES
      const oc = off.getContext('2d')
      try { oc.drawImage(img, 0, 0, SAMPLE_RES, SAMPLE_RES) }
      catch { return }

      const imageData = oc.getImageData(0, 0, SAMPLE_RES, SAMPLE_RES)
      const d = imageData.data
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] < 20) continue
        const L = luma(d[i], d[i + 1], d[i + 2])
        if (L >= WHITE_THRESH) {
          d[i] = ACCENT.r; d[i + 1] = ACCENT.g; d[i + 2] = ACCENT.b
        } else {
          d[i] = 255; d[i + 1] = 255; d[i + 2] = 255
        }
      }
      const inv = document.createElement('canvas')
      inv.width = inv.height = SAMPLE_RES
      inv.getContext('2d').putImageData(imageData, 0, 0)
      S.invCanvas = inv
    }

    // ── Animation tick ────────────────────────────────────────
    function tick() {
      const { CW, CH, mouse, zoneX, zoneY, zoneW, zoneH } = S
      const mx = mouse.x
      const my = mouse.y

      // ── Logo canvas ──────────────────────────────────────────
      lCtx.clearRect(0, 0, CW, CH)
      if (img.complete && img.naturalWidth) {
        lCtx.shadowColor = 'rgba(0,60,90,0.22)'
        lCtx.shadowBlur  = 14
        lCtx.drawImage(img, zoneX, zoneY, zoneW, zoneH)
        lCtx.shadowColor = 'transparent'
        lCtx.shadowBlur  = 0
      }

      const inZone = mx >= zoneX && mx <= zoneX + zoneW &&
                     my >= zoneY && my <= zoneY + zoneH
      S.glowE += ((inZone ? 1 : 1) - S.glowE) * 0.1
      if (S.glowE < 0.001) S.glowE = 0

      if (S.glowE > 0) {
        lCtx.save()
        lCtx.beginPath()
        lCtx.rect(zoneX, zoneY, zoneW, zoneH)
        lCtx.clip()
        lCtx.beginPath()
        lCtx.arc(mx, my, RADIUS, 0, Math.PI * 2)
        lCtx.clip()
        lCtx.globalAlpha = S.glowE
        lCtx.fillStyle = '#0082aa'
        lCtx.fillRect(0, 0, CW, CH)
        if (S.invCanvas) lCtx.drawImage(S.invCanvas, zoneX, zoneY, zoneW, zoneH)
        lCtx.globalAlpha = 1
        lCtx.restore()
      }

      // ── Cursor canvas — right half only, teal circle minus logo zone ──
      // Left half is handled by the invertedLayer clip-path (DOM, no canvas needed).
      cCtx.clearRect(0, 0, CW, CH)
      if (mx > -100) {
        cCtx.save()
        // Restrict drawing to right half
        cCtx.beginPath()
        cCtx.rect(CW / 2, 0, CW / 2, CH)
        cCtx.clip()
        // Draw teal circle
        cCtx.beginPath()
        cCtx.arc(mx, my, RADIUS, 0, Math.PI * 2)
        cCtx.fillStyle = '#0082aa'
        cCtx.fill()
        // Cut out logo zone — logo canvas handles inversion there
        cCtx.clearRect(zoneX, zoneY, zoneW, zoneH)
        cCtx.restore()
      }

      S.raf = requestAnimationFrame(tick)
    }

    // ── Events ────────────────────────────────────────────────
    function setClip(mx, my) {
      invertedLayer.style.clipPath = `circle(${RADIUS}px at ${mx}px ${my}px)`
    }
    function clearClip() {
      invertedLayer.style.clipPath = 'circle(0px at -9999px -9999px)'
    }

    function onMouseMove(e) {
      S.mouse.x = e.clientX - S.offL
      S.mouse.y = e.clientY - S.offT
      setClip(S.mouse.x, S.mouse.y)
      if (hintRef.current && hintRef.current.style.opacity !== '0') {
        hintRef.current.style.opacity = '0'
      }
    }
    function onLeave() {
      S.mouse.x = -9999; S.mouse.y = -9999
      clearClip()
    }
    function onTouch(e) {
      S.mouse.x = e.touches[0].clientX - S.offL
      S.mouse.y = e.touches[0].clientY - S.offT
      setClip(S.mouse.x, S.mouse.y)
      if (hintRef.current) hintRef.current.style.opacity = '0'
    }

    // ── Init ──────────────────────────────────────────────────
    resize()
    if (img.complete && img.naturalWidth) prepareInverted()
    else img.addEventListener('load', prepareInverted)

    section.addEventListener('mousemove',  onMouseMove, { passive: true })
    section.addEventListener('mouseleave', onLeave,     { passive: true })
    section.addEventListener('touchmove',  onTouch,     { passive: true })
    window.addEventListener('resize',      resize,      { passive: true })

    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(S.raf)
      else S.raf = requestAnimationFrame(tick)
    }
    document.addEventListener('visibilitychange', onVis)
    S.raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(S.raf)
      section.removeEventListener('mousemove',  onMouseMove)
      section.removeEventListener('mouseleave', onLeave)
      section.removeEventListener('touchmove',  onTouch)
      window.removeEventListener('resize',      resize)
      document.removeEventListener('visibilitychange', onVis)
      img.removeEventListener('load', prepareInverted)
    }
  }, [imageSrc, zoneSize])

  // ══════════════════════════════════════════════════════════════
  //  RENDER
  // ══════════════════════════════════════════════════════════════
  const leftPad = {
    paddingTop:    'calc(64px + clamp(40px, 5vw, 88px))',
    paddingBottom: 'clamp(40px, 5vw, 88px)',
    paddingLeft:   'clamp(44px, 6vw, 96px)',
    paddingRight:  'clamp(28px, 4.5vw, 72px)',
  }

  const STATS = [
    { n: '200+', label: 'Members' },
    { n: '50+',  label: 'Events'  },
    { n: '20+',  label: 'Projects'},
  ]

  return (
    <>
      <style>{`
        .pgx-grad { color: #0082aa; }
        .pgx-inv .pgx-grad { color: white; }

        @keyframes pgx-in {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pgx-scrollline {
          0%   { transform: scaleY(0); transform-origin: top center;    opacity: 0; }
          25%  { transform: scaleY(1); transform-origin: top center;    opacity: 1; }
          75%  { transform: scaleY(1); transform-origin: bottom center; opacity: 1; }
          100% { transform: scaleY(0); transform-origin: bottom center; opacity: 0; }
        }
        .pgx-in   { animation: pgx-in 1s cubic-bezier(0.16,1,0.3,1) both; }
        .pgx-in-2 { animation: pgx-in 1s 0.12s cubic-bezier(0.16,1,0.3,1) both; }
        .pgx-in-3 { animation: pgx-in 1s 0.22s cubic-bezier(0.16,1,0.3,1) both; }
        .pgx-in-4 { animation: pgx-in 1s 0.34s cubic-bezier(0.16,1,0.3,1) both; }
        .pgx-hint { transition: opacity 0.6s ease; }
        .pgx-scrollline { animation: pgx-scrollline 2.4s ease-in-out infinite; }

        .pgx-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 28px; border-radius: 12px;
          font-size: 14px; font-weight: 700; color: #fff;
          background: linear-gradient(135deg, #0082aa 0%, #005f7f 100%);
          box-shadow: 0 4px 24px rgba(0,130,170,0.32), inset 0 1px 0 rgba(255,255,255,0.18);
          text-decoration: none; letter-spacing: -0.01em;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .pgx-btn-primary:hover {
          box-shadow: 0 10px 32px rgba(0,130,170,0.48), inset 0 1px 0 rgba(255,255,255,0.22);
          transform: translateY(-2px);
        }
        .pgx-btn-primary:hover .pgx-arrow { transform: translateX(4px); }

        .pgx-btn-secondary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 28px; border-radius: 12px;
          font-size: 14px; font-weight: 600;
          color: rgba(0,0,0,0.62);
          border: 1px solid rgba(0,0,0,0.13);
          text-decoration: none;
          transition: border-color 0.18s, color 0.18s, background 0.18s, transform 0.18s;
        }
        .pgx-btn-secondary:hover {
          border-color: rgba(0,130,170,0.45);
          color: #0082aa;
          background: rgba(0,130,170,0.04);
          transform: translateY(-1px);
        }
        .pgx-arrow {
          display: inline-block;
          transition: transform 0.22s cubic-bezier(0.16,1,0.3,1);
        }

        @media (max-width: 768px) {
          .pgx-hero { min-height: auto !important; }
          .pgx-left { width: 100% !important; padding-left: 24px !important; padding-right: 24px !important; }
        }
      `}</style>

      <section
        ref={sectionRef}
        className="pgx-hero"
        style={{
          position: 'relative',
          display: 'flex',
          width: '100vw', minHeight: '100vh',
          paddingTop: 64,
          background: '#fafafa',
          overflow: 'hidden',
          cursor: 'none',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        }}
      >

        {/* ── Ambient glow orbs ──────────────────────────────── */}
        <div aria-hidden="true" style={{
          position: 'absolute', top: -160, right: -120,
          width: 640, height: 640, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,130,170,0.09) 0%, transparent 65%)',
          pointerEvents: 'none', zIndex: 0,
        }}/>
        <div aria-hidden="true" style={{
          position: 'absolute', bottom: -80, left: '30%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,130,170,0.05) 0%, transparent 65%)',
          pointerEvents: 'none', zIndex: 0,
        }}/>

        {/* ── Decorative concentric rings (logo center) ──────── */}
        {[300, 420, 560].map((s, i) => (
          <div key={s} aria-hidden="true" style={{
            position: 'absolute',
            top: '50%', left: '75%',
            transform: 'translate(-50%, -50%)',
            width: s, height: s, borderRadius: '50%',
            border: `1px solid rgba(0,130,170,${0.11 - i * 0.03})`,
            pointerEvents: 'none', zIndex: 0,
          }}/>
        ))}

        {/* ── Subtle top rule ────────────────────────────────── */}
        <div aria-hidden="true" style={{
          position: 'absolute', top: 64, left: 0, right: 0,
          height: 1, background: 'rgba(0,0,0,0.05)',
          pointerEvents: 'none', zIndex: 0,
        }}/>

        {/* ── Left vertical label ────────────────────────────── */}
        <div aria-hidden="true" style={{
          position: 'absolute', left: 0, top: 64, bottom: 0,
          width: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none', zIndex: 1,
        }}>
          <span style={{
            transform: 'rotate(-90deg)',
            fontSize: 9, fontWeight: 600,
            letterSpacing: '0.22em', color: 'rgba(0,0,0,0.18)',
            textTransform: 'uppercase', whiteSpace: 'nowrap',
          }}>
            ACM · Student Chapter · IGDTUW
          </span>
        </div>

        {/* Logo canvas — full section, logo drawn in right half */}
        <canvas ref={logoCanvasRef} style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }}/>

        {/* Cursor canvas — right half teal circle only */}
        <canvas
          ref={cursorCanvasRef}
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 9 }}
        />

        {/* ══ LEFT — normal text (dark) ════════════════════════ */}
        <div
          className="pgx-left"
          style={{
            width: '50%',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            padding: 'clamp(40px,5vw,88px) clamp(28px,4.5vw,72px)',
            paddingLeft: 'clamp(44px, 6vw, 96px)',
            position: 'relative', zIndex: 1,
          }}
        >
          <h1 className="pgx-in" style={{
            margin: 0,
            fontSize: 'clamp(40px, 5.5vw, 76px)',
            fontWeight: 900, lineHeight: 1.02, letterSpacing: '-0.04em',
            color: '#0d1117', marginBottom: 22,
          }}>
            {headline}
          </h1>

          <p className="pgx-in-2" style={{
            margin: 0, marginBottom: 32,
            fontSize: 'clamp(13px, 1.3vw, 15.5px)',
            lineHeight: 1.82, color: 'rgba(0,0,0,0.48)', maxWidth: 380,
            fontWeight: 400,
          }}>
            {subtext}
          </p>

          <div className="pgx-in-3" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <a href={ctaPrimary.href} className="pgx-btn-primary">
              {ctaPrimary.label}
              <span className="pgx-arrow">→</span>
            </a>
            <a href={ctaSecondary.href} className="pgx-btn-secondary">
              {ctaSecondary.label}
            </a>
          </div>

          {/* Stats row */}
          <div className="pgx-in-4" style={{
            display: 'flex', gap: 0, marginTop: 40,
            paddingTop: 28, borderTop: '1px solid rgba(0,0,0,0.07)',
          }}>
            {STATS.map(({ n, label }, i) => (
              <div key={label} style={{
                flex: 1,
                paddingRight: i < 2 ? 20 : 0,
                borderRight: i < 2 ? '1px solid rgba(0,0,0,0.07)' : 'none',
                paddingLeft: i > 0 ? 20 : 0,
              }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#0d1117', letterSpacing: '-0.04em', lineHeight: 1 }}>{n}</div>
                <div style={{ fontSize: 10.5, color: 'rgba(0,0,0,0.38)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 5 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ══ Inverted layer — teal bg + white text ════════════ */}
        <div
          ref={invertedLayerRef}
          className="pgx-inv"
          style={{
            position: 'absolute', top: 0, left: 0,
            width: '50%', height: '100%',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            ...leftPad,
            background: '#0082aa',
            color: 'white',
            zIndex: 8,
            pointerEvents: 'none',
            clipPath: 'circle(0px at -9999px -9999px)',
            overflow: 'hidden',
          }}
        >
          <h1 style={{
            margin: 0,
            fontSize: 'clamp(40px, 5.5vw, 76px)',
            fontWeight: 900, lineHeight: 1.02, letterSpacing: '-0.04em',
            color: 'white', marginBottom: 22,
          }}>
            {headline}
          </h1>

          <p style={{
            margin: 0, marginBottom: 32,
            fontSize: 'clamp(13px, 1.3vw, 15.5px)',
            lineHeight: 1.82, color: 'rgba(255,255,255,0.82)', maxWidth: 380,
          }}>
            {subtext}
          </p>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '13px 28px', borderRadius: 12,
              fontSize: 14, fontWeight: 700, color: '#0082aa', background: 'white',
            }}>
              {ctaPrimary.label} <span>→</span>
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '13px 28px', borderRadius: 12,
              fontSize: 14, fontWeight: 600, color: 'white',
              border: '1px solid rgba(255,255,255,0.4)',
            }}>
              {ctaSecondary.label}
            </div>
          </div>

          {/* Stats row — inverted */}
          <div style={{
            display: 'flex', gap: 0, marginTop: 40,
            paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.2)',
          }}>
            {STATS.map(({ n, label }, i) => (
              <div key={label} style={{
                flex: 1,
                paddingRight: i < 2 ? 20 : 0,
                borderRight: i < 2 ? '1px solid rgba(255,255,255,0.2)' : 'none',
                paddingLeft: i > 0 ? 20 : 0,
              }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'white', letterSpacing: '-0.04em', lineHeight: 1 }}>{n}</div>
                <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.6)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 5 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        <img
          ref={imgRef} src={imageSrc} alt={imageAlt}
          crossOrigin="anonymous" aria-hidden="true"
          style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 1, height: 1 }}
        />

        {/* Hover hint */}
        <div
          ref={hintRef}
          className="pgx-hint"
          aria-hidden="true"
          style={{
            position: 'absolute', bottom: 22, right: '12%',
            fontSize: 9.5, fontWeight: 600,
            color: 'rgba(0,80,110,0.35)',
            letterSpacing: '0.15em', textTransform: 'uppercase',
            pointerEvents: 'none', zIndex: 2, whiteSpace: 'nowrap',
          }}
        >
          hover to explore
        </div>

        {/* Scroll indicator — animated line */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', bottom: 28, left: 'clamp(44px, 6vw, 96px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
            pointerEvents: 'none', zIndex: 1,
          }}
        >
          <span style={{
            fontSize: 8.5, fontWeight: 700, letterSpacing: '0.22em',
            color: 'rgba(0,0,0,0.22)', textTransform: 'uppercase',
          }}>Scroll</span>
          <div className="pgx-scrollline" style={{
            width: 1, height: 44,
            background: 'linear-gradient(to bottom, #0082aa, rgba(0,130,170,0))',
          }}/>
        </div>

      </section>
    </>
  )
}
