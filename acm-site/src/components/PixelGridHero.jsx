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
    paddingLeft:   'clamp(28px, 4.5vw, 72px)',
    paddingRight:  'clamp(28px, 4.5vw, 72px)',
  }

  return (
    <>
      <style>{`
        .pgx-grad {
          color: #0082aa;
        }
        /* Inside the inverted layer, override gradient text to white */
        .pgx-inv .pgx-grad {
          background: none;
          -webkit-background-clip: unset;
          background-clip: unset;
          -webkit-text-fill-color: white;
        }
        @keyframes pgx-in {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pgx-blink {
          0%,100% { opacity: 1; } 50% { opacity: 0.3; }
        }
        @keyframes pgx-bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50%       { transform: translateX(-50%) translateY(7px); }
        }
        .pgx-in   { animation: pgx-in 0.9s cubic-bezier(0.16,1,0.3,1) both; }
        .pgx-in-2 { animation: pgx-in 0.9s 0.1s cubic-bezier(0.16,1,0.3,1) both; }
        .pgx-in-3 { animation: pgx-in 0.9s 0.2s cubic-bezier(0.16,1,0.3,1) both; }
        .pgx-dot  { animation: pgx-blink 2.4s ease-in-out infinite; }
        .pgx-scroll { animation: pgx-bounce 2.2s ease-in-out infinite; }
        .pgx-hint { transition: opacity 0.6s ease; }

        @media (max-width: 768px) {
          .pgx-hero { min-height: auto !important; }
          .pgx-left { width: 100% !important; }
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
          background: '#ffffff',
          overflow: 'hidden',
          cursor: 'none',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        }}
      >

        {/* Logo canvas — full section, logo drawn in right half */}
        <canvas ref={logoCanvasRef} style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }}/>

        {/* Cursor canvas — right half teal circle only */}
        <canvas
          ref={cursorCanvasRef}
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 9 }}
        />

        {/* ══ LEFT — normal text (dark on white) ══════════════ */}
        <div
          className="pgx-left"
          style={{
            width: '50%',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            padding: 'clamp(40px,5vw,88px) clamp(28px,4.5vw,72px)',
            position: 'relative', zIndex: 1,
          }}
        >

          <h1 className="pgx-in-2" style={{
            margin: 0,
            fontSize: 'clamp(32px, 4vw, 58px)',
            fontWeight: 800, lineHeight: 1.07, letterSpacing: '-0.032em',
            color: '#0d1117', marginBottom: 20,
          }}>
            {headline}
          </h1>

          <p className="pgx-in-2" style={{
            margin: 0, marginBottom: 36,
            fontSize: 'clamp(13px, 1.35vw, 16px)',
            lineHeight: 1.78, color: 'rgba(0,0,0,0.52)', maxWidth: 400,
          }}>
            {subtext}
          </p>

          <div className="pgx-in-3" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a
              href={ctaPrimary.href}
              style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '12px 26px', borderRadius: 10,
                fontSize: 14, fontWeight: 700, color: '#fff',
                background: 'linear-gradient(135deg, #0082aa, #005f7f)',
                boxShadow: '0 4px 20px rgba(0,130,170,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
                textDecoration: 'none',
                transition: 'box-shadow .18s, transform .18s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,130,170,0.5), inset 0 1px 0 rgba(255,255,255,0.2)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,130,170,0.35), inset 0 1px 0 rgba(255,255,255,0.15)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              {ctaPrimary.label}
            </a>
            <a
              href={ctaSecondary.href}
              style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '12px 26px', borderRadius: 10,
                fontSize: 14, fontWeight: 600, color: 'rgba(0,0,0,0.65)',
                border: '1px solid rgba(0,0,0,0.15)',
                textDecoration: 'none',
                transition: 'border-color .18s, color .18s, background .18s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(0,130,170,0.5)'
                e.currentTarget.style.color = '#0082aa'
                e.currentTarget.style.background = 'rgba(0,130,170,0.04)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(0,0,0,0.15)'
                e.currentTarget.style.color = 'rgba(0,0,0,0.65)'
                e.currentTarget.style.background = 'transparent'
              }}
            >
              {ctaSecondary.label}
            </a>
          </div>
        </div>

        {/* ══ Inverted layer — teal bg + white text, clips to cursor ══
            Only covers left half. Clip-path is updated directly via ref
            (no React state) so it follows the cursor with zero lag.
            white bg  → reveals teal background = teal cursor ✓
            dark text → white text shows through = white on teal  ✓
            teal elem → white text on teal = readable ✓               */}
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
            fontSize: 'clamp(32px, 4vw, 58px)',
            fontWeight: 800, lineHeight: 1.07, letterSpacing: '-0.032em',
            color: 'white', marginBottom: 20,
          }}>
            {headline}
          </h1>

          <p style={{
            margin: 0, marginBottom: 36,
            fontSize: 'clamp(13px, 1.35vw, 16px)',
            lineHeight: 1.78, color: 'rgba(255,255,255,0.85)', maxWidth: 400,
          }}>
            {subtext}
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '12px 26px', borderRadius: 10,
              fontSize: 14, fontWeight: 700, color: '#0082aa', background: 'white',
            }}>
              {ctaPrimary.label}
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '12px 26px', borderRadius: 10,
              fontSize: 14, fontWeight: 600, color: 'white',
              border: '1px solid rgba(255,255,255,0.5)',
            }}>
              {ctaSecondary.label}
            </div>
          </div>
        </div>

        <img
          ref={imgRef} src={imageSrc} alt={imageAlt}
          crossOrigin="anonymous" aria-hidden="true"
          style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 1, height: 1 }}
        />

        <div
          ref={hintRef}
          className="pgx-hint"
          aria-hidden="true"
          style={{
            position: 'absolute', bottom: 20, right: '10%',
            fontSize: 10, fontWeight: 600,
            color: 'rgba(0,80,110,0.45)',
            letterSpacing: '0.12em', textTransform: 'uppercase',
            pointerEvents: 'none', zIndex: 2, whiteSpace: 'nowrap',
          }}
        >
          hover to explore
        </div>

        {/* Scroll chevron */}
        <div
          aria-hidden="true"
          className="pgx-scroll"
          style={{
            position: 'absolute', bottom: 24, left: '25%',
            opacity: 0.4, pointerEvents: 'none',
          }}
        >
          <svg width="18" height="10" viewBox="0 0 18 10" fill="none">
            <path d="M1 1L9 9L17 1" stroke="#0082aa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

      </section>
    </>
  )
}
