import { useRef, useEffect } from 'react'

/* ═══════════════════════════════════════════════════════════
   ANIMATION CONFIG — tweak these to taste
   ═══════════════════════════════════════════════════════════ */
const CFG = {
  float: {
    amplitude:  13,    // px, vertical bob height
    speed:      0.50,  // Hz — cycles per second
    driftAmp:   5,     // px, subtle horizontal drift
    driftSpeed: 0.25,  // Hz
  },
  rotation: {
    ySpeed:     16,    // deg/sec — slow, majestic Y spin
    xOscAmp:    5,     // deg — forward/back tilt oscillation
    xOscSpeed:  0.28,  // Hz
  },
  parallax: {
    maxDeg: 12,        // max tilt from mouse in degrees
    lerp:   0.055,     // smoothing factor (lower = more lag)
  },
  scroll: {
    translateMax: 38,  // px upward shift at full scroll
    scaleMin:     0.92, // min scale at full scroll
  },
  specular: {
    sweepWidth: 24,    // % width of the sheen band
  },
  glow: {
    color1: 'rgba(123,79,255,0.42)',   // inner glow color
    color2: 'rgba(0,194,255,0.13)',    // mid glow color
  },
}

/* ── Helpers ─────────────────────────────────────────────── */
const lerp = (a, b, t) => a + (b - a) * t

/* ═══════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function HeroFloat({
  /* ── Swap your asset here ── */
  imageSrc  = '/my-object.png',
  imageAlt  = 'Floating object',

  /* ── Hero copy — customise for your brand ── */
  eyebrow   = '',
  headline  = <>Build the <span className="grad-text">Future</span><br />of Computing</>,
  subtext   = 'Join a community of makers, builders, and thinkers. Explore cutting-edge projects, workshops, and events.',
  ctaPrimary  = { label: 'Join ACM →', href: '#' },
  ctaSecondary = { label: 'Explore Events', href: '#' },
}) {
  /* ── DOM refs ──────────────────────────────────────────── */
  const heroRef      = useRef(null)
  const rigRef       = useRef(null)
  const wrapperRef   = useRef(null)
  const specularRef  = useRef(null)
  const rimRef       = useRef(null)
  const glowRef      = useRef(null)
  const shadowRef    = useRef(null)
  const imgRef       = useRef(null)

  /* ── Mutable animation state (refs = no re-renders) ────── */
  const state = useRef({
    mx: 0, my: 0,          // normalised mouse position −1..1
    tiltX: 0, tiltY: 0,    // current lerped parallax tilt
    scrollT: 0,            // 0..1 scroll progress through hero
    startTime: null,
    raf: null,
  })

  useEffect(() => {
    const hero    = heroRef.current
    const rig     = rigRef.current
    const wrapper = wrapperRef.current
    const specEl  = specularRef.current
    const rimEl   = rimRef.current
    const glowEl  = glowRef.current
    const shadowEl = shadowRef.current
    const s       = state.current

    if (!hero || !rig || !wrapper) return

    /* ── Event handlers ──────────────────────────────────── */
    const onMouseMove = (e) => {
      const r = hero.getBoundingClientRect()
      s.mx = ((e.clientX - r.left) / r.width  - 0.5) * 2
      s.my = ((e.clientY - r.top)  / r.height - 0.5) * 2
    }
    const onMouseLeave = () => { s.mx = 0; s.my = 0 }

    const onTouchMove = (e) => {
      const t = e.touches[0]
      const r = hero.getBoundingClientRect()
      s.mx = ((t.clientX - r.left) / r.width  - 0.5) * 2
      s.my = ((t.clientY - r.top)  / r.height - 0.5) * 2
    }

    const onScroll = () => {
      const { top, height } = hero.getBoundingClientRect()
      s.scrollT = Math.max(0, Math.min(1, -top / height))
    }

    /* ── RAF tick ────────────────────────────────────────── */
    function tick(ts) {
      if (!s.startTime) s.startTime = ts
      const t = (ts - s.startTime) * 0.001   // elapsed seconds

      /* — Floating motion — */
      const floatY = Math.sin(t * CFG.float.speed * Math.PI * 2) * CFG.float.amplitude
      const driftX = Math.sin(t * CFG.float.driftSpeed * Math.PI * 2) * CFG.float.driftAmp

      /* — Continuous Y rotation + subtle X oscillation — */
      const rotY      = t * CFG.rotation.ySpeed
      const rotX_osc  = Math.sin(t * CFG.rotation.xOscSpeed * Math.PI * 2) * CFG.rotation.xOscAmp

      /* — Mouse parallax (lerp toward target) — */
      s.tiltY = lerp(s.tiltY,  s.mx * CFG.parallax.maxDeg, CFG.parallax.lerp)
      s.tiltX = lerp(s.tiltX, -s.my * CFG.parallax.maxDeg, CFG.parallax.lerp)

      /* — Apply combined transform to 3D rig — */
      rig.style.transform = [
        `translateX(${driftX.toFixed(2)}px)`,
        `translateY(${floatY.toFixed(2)}px)`,
        `rotateX(${(rotX_osc + s.tiltX).toFixed(2)}deg)`,
        `rotateY(${(rotY    + s.tiltY).toFixed(2)}deg)`,
      ].join(' ')

      /* ── Specular sheen ─────────────────────────────────
         A light band sweeps left→right as the object rotates.
         The gradient position (sheenPos) tracks rotY 0→360. */
      const sheenPos = ((rotY % 360) / 360) * 120 - 10  // −10% → 110%
      const sw = CFG.specular.sweepWidth
      specEl.style.background = [
        'linear-gradient(105deg,',
        `transparent                                   ${(sheenPos - sw).toFixed(1)}%,`,
        `rgba(255,255,255,0.05)  ${(sheenPos - sw * 0.5).toFixed(1)}%,`,
        `rgba(255,255,255,0.26)                        ${sheenPos.toFixed(1)}%,`,
        `rgba(255,255,255,0.05)  ${(sheenPos + sw * 0.5).toFixed(1)}%,`,
        `transparent                                   ${(sheenPos + sw).toFixed(1)}%`,
        ')',
      ].join(' ')

      /* ── Rim light ───────────────────────────────────────
         Edge glow shifts blue→purple as rotation sweeps L↔R. */
      const rimAngle = ((rotY % 360) / 360) * Math.PI * 2
      const rimL = Math.max(0, Math.sin(rimAngle + Math.PI * 0.5)) * 0.38
      const rimR = Math.max(0, Math.sin(rimAngle - Math.PI * 0.5)) * 0.38
      rimEl.style.boxShadow = [
        `${-5 - rimL * 14}px 0 ${14 + rimL * 26}px rgba(0,194,255,${(0.07 + rimL).toFixed(2)})`,
        `${5  + rimR * 14}px 0 ${14 + rimR * 26}px rgba(123,79,255,${(0.07 + rimR).toFixed(2)})`,
      ].join(',')

      /* ── Ambient glow pulse ──────────────────────────────  */
      const glowScale   = 1 + Math.sin(t * 0.85) * 0.055
      const glowOpacity = 0.80 + Math.sin(t * 1.25) * 0.20
      glowEl.style.transform = `translate(-50%,-50%) scale(${glowScale.toFixed(3)})`
      glowEl.style.opacity   = glowOpacity.toFixed(3)

      /* ── Drop shadow (shrinks when object is high) ───────  */
      const shadowScale = 1 - (floatY / CFG.float.amplitude) * 0.20
      const shadowAlpha = Math.max(0.18, 0.58 - (floatY / CFG.float.amplitude) * 0.22)
      shadowEl.style.transform = `translateX(-50%) scaleX(${shadowScale.toFixed(3)})`
      shadowEl.style.opacity   = shadowAlpha.toFixed(3)

      /* ── Scroll: translateY + scale + fade out ───────────  */
      const sTranslate = s.scrollT * CFG.scroll.translateMax
      const sScale     = 1 - s.scrollT * (1 - CFG.scroll.scaleMin)
      const sOpacity   = Math.max(0, 1 - s.scrollT * 1.9).toFixed(3)
      wrapper.style.transform = `translateY(-${sTranslate.toFixed(2)}px) scale(${sScale.toFixed(4)})`
      wrapper.style.opacity   = sOpacity

      s.raf = requestAnimationFrame(tick)
    }

    /* ── Image fallback (canvas placeholder) ─────────────── */
    const img = imgRef.current
    if (img) {
      img.onerror = () => {
        const canvas = document.createElement('canvas')
        canvas.width = 320; canvas.height = 320
        const ctx = canvas.getContext('2d')

        const bg = ctx.createRadialGradient(160,160,0,160,160,155)
        bg.addColorStop(0, '#1a1030'); bg.addColorStop(1, '#0d0a1a')
        ctx.fillStyle = bg
        ctx.beginPath(); ctx.arc(160,160,155,0,Math.PI*2); ctx.fill()

        ctx.strokeStyle = 'rgba(123,79,255,0.55)'
        ctx.lineWidth = 1.5; ctx.stroke()

        const band = ctx.createLinearGradient(50,160,270,160)
        band.addColorStop(0, 'rgba(123,79,255,0.9)')
        band.addColorStop(1, 'rgba(0,194,255,0.9)')
        ctx.strokeStyle = band; ctx.lineWidth = 2.5
        ctx.beginPath(); ctx.moveTo(65,160); ctx.lineTo(255,160); ctx.stroke()

        ctx.fillStyle = 'rgba(255,255,255,0.55)'
        ctx.font = '600 13px system-ui'
        ctx.textAlign = 'center'
        ctx.fillText('YOUR LOGO HERE', 160, 172)

        img.src = canvas.toDataURL()
      }
    }

    /* ── Pause RAF when tab is hidden ────────────────────── */
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(s.raf)
      } else {
        s.startTime = null
        s.raf = requestAnimationFrame(tick)
      }
    }

    /* ── Attach events ───────────────────────────────────── */
    hero.addEventListener('mousemove',  onMouseMove,  { passive: true })
    hero.addEventListener('mouseleave', onMouseLeave, { passive: true })
    hero.addEventListener('touchmove',  onTouchMove,  { passive: true })
    window.addEventListener('scroll',   onScroll,     { passive: true })
    document.addEventListener('visibilitychange', onVisibility)

    onScroll()                            // init scroll state
    s.raf = requestAnimationFrame(tick)   // kick off loop

    /* ── Cleanup ─────────────────────────────────────────── */
    return () => {
      cancelAnimationFrame(s.raf)
      hero.removeEventListener('mousemove',  onMouseMove)
      hero.removeEventListener('mouseleave', onMouseLeave)
      hero.removeEventListener('touchmove',  onTouchMove)
      window.removeEventListener('scroll',   onScroll)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  /* ════════════════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════════════════ */
  return (
    <>
      {/* Gradient text utility — injected once */}
      <style>{`
        .grad-text {
          background: linear-gradient(95deg, #7B4FFF 0%, #00C2FF 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-anim-copy   { animation: fadeSlideUp 0.82s cubic-bezier(0.16,1,0.3,1) both; }
        .hero-anim-object { animation: fadeSlideUp 0.82s 0.18s cubic-bezier(0.16,1,0.3,1) both; }
        .badge-dot { animation: blink 2.4s ease-in-out infinite; }
      `}</style>

      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ background: '#060609' }}
      >
        {/* ── Background layers ──────────────────────────── */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background: [
              'radial-gradient(ellipse 90% 70% at 58% 44%, rgba(123,79,255,0.13) 0%, transparent 65%)',
              'radial-gradient(ellipse 50% 38% at 78% 24%, rgba(0,194,255,0.07) 0%, transparent 55%)',
            ].join(','),
          }}
        />

        {/* Star-field dot grid */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: [
              'radial-gradient(circle, rgba(255,255,255,0.17) 1px, transparent 1px)',
              'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
            ].join(','),
            backgroundSize: '62px 62px, 34px 34px',
            backgroundPosition: '0 0, 31px 17px',
          }}
        />

        {/* Top-edge accent line */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-1/2 -translate-x-1/2 h-px pointer-events-none"
          style={{
            width: '680px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(123,79,255,0.7) 35%, rgba(0,194,255,0.7) 65%, transparent 100%)',
            filter: 'blur(0.4px)',
          }}
        />

        {/* ── Main layout ────────────────────────────────── */}
        <div className="relative z-10 flex flex-col-reverse md:flex-row items-center justify-between gap-10 md:gap-12 w-full max-w-6xl px-6 md:px-12 py-24 md:py-0">

          {/* ── Copy side ────────────────────────────────── */}
          <div className="hero-anim-copy flex-1 max-w-[530px] text-center md:text-left">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest mb-6"
              style={{
                color: '#00C2FF',
                borderColor: 'rgba(0,194,255,0.22)',
                background: 'rgba(0,194,255,0.06)',
                letterSpacing: '0.13em',
              }}
            >
              <span
                className="badge-dot inline-block w-1.5 h-1.5 rounded-full"
                style={{ background: '#00C2FF', boxShadow: '0 0 8px rgba(0,194,255,0.9)' }}
              />
              {eyebrow}
            </div>

            {/* Headline */}
            <h1
              className="font-extrabold leading-[1.04] tracking-tight mb-5"
              style={{
                fontSize: 'clamp(38px, 5.2vw, 66px)',
                letterSpacing: '-0.035em',
                background: 'linear-gradient(135deg, #ffffff 40%, rgba(255,255,255,0.52))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {headline}
            </h1>

            {/* Sub-text */}
            <p
              className="leading-relaxed mb-9"
              style={{
                fontSize: 'clamp(15px, 1.55vw, 17px)',
                color: 'rgba(255,255,255,0.42)',
                maxWidth: '420px',
                margin: '0 auto 36px',
              }}
            >
              {subtext}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 justify-center md:justify-start">
              <a
                href={ctaPrimary.href}
                className="inline-flex items-center gap-2 rounded-xl font-semibold transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  padding: '13px 26px',
                  fontSize: '14px',
                  color: '#fff',
                  background: 'linear-gradient(135deg, #7B4FFF 0%, #5a2dde 100%)',
                  boxShadow: '0 0 24px rgba(123,79,255,0.28), inset 0 1px 0 rgba(255,255,255,0.12)',
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 44px rgba(123,79,255,0.48), inset 0 1px 0 rgba(255,255,255,0.2)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 24px rgba(123,79,255,0.28), inset 0 1px 0 rgba(255,255,255,0.12)'}
              >
                {ctaPrimary.label}
              </a>
              <a
                href={ctaSecondary.href}
                className="inline-flex items-center gap-2 rounded-xl font-semibold transition-all duration-200"
                style={{
                  padding: '13px 26px',
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.62)',
                  border: '1px solid rgba(255,255,255,0.11)',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.11)'; e.currentTarget.style.color = 'rgba(255,255,255,0.62)' }}
              >
                {ctaSecondary.label}
              </a>
            </div>
          </div>

          {/* ── Object stage ─────────────────────────────── */}
          <div className="hero-anim-object flex-1 flex items-center justify-center relative min-h-[340px] md:min-h-[440px]">

            {/* Scroll wrapper: translateY + scale + opacity on scroll */}
            <div ref={wrapperRef} className="relative" style={{ willChange: 'transform, opacity' }}>

              {/* Perspective scene */}
              <div style={{ perspective: '900px', perspectiveOrigin: '50% 50%' }}>

                {/* 3-D rig: receives all rotations + float */}
                <div
                  ref={rigRef}
                  style={{ willChange: 'transform', transformStyle: 'preserve-3d' }}
                >
                  {/* Object frame */}
                  <div
                    className="relative"
                    style={{ width: 'clamp(210px, 25vw, 310px)', height: 'clamp(210px, 25vw, 310px)' }}
                  >
                    {/* ★ YOUR IMAGE — change src prop on <HeroFloat> ★ */}
                    <img
                      ref={imgRef}
                      src={imageSrc}
                      alt={imageAlt}
                      className="relative w-full h-full object-contain block pointer-events-none select-none"
                      style={{
                        zIndex: 2,
                        WebkitUserDrag: 'none',
                        filter: 'drop-shadow(0 0 30px rgba(123,79,255,0.52))',
                      }}
                    />

                    {/* Specular sheen — sweeps with rotation */}
                    <div
                      ref={specularRef}
                      className="absolute inset-0 rounded-full pointer-events-none"
                      style={{ zIndex: 3, mixBlendMode: 'overlay', opacity: 0.88 }}
                    />

                    {/* Rim light — edge glow shifts L↔R */}
                    <div
                      ref={rimRef}
                      className="absolute rounded-full pointer-events-none"
                      style={{ inset: '-3px', zIndex: 4 }}
                    />
                  </div>
                </div>
              </div>

              {/* Ambient glow disc — behind, pulsing */}
              <div
                ref={glowRef}
                aria-hidden="true"
                className="absolute rounded-full pointer-events-none"
                style={{
                  top: '50%', left: '50%',
                  width: 'clamp(210px, 25vw, 310px)',
                  height: 'clamp(210px, 25vw, 310px)',
                  zIndex: -1,
                  background: `radial-gradient(circle, ${CFG.glow.color1} 0%, ${CFG.glow.color2} 45%, transparent 72%)`,
                  filter: 'blur(30px)',
                }}
              />

              {/* Drop shadow — scales with float height */}
              <div
                ref={shadowRef}
                aria-hidden="true"
                className="absolute pointer-events-none"
                style={{
                  bottom: '-28px',
                  left: '50%',
                  width: 'clamp(90px, 11vw, 150px)',
                  height: '14px',
                  borderRadius: '50%',
                  zIndex: -1,
                  background: 'radial-gradient(ellipse, rgba(0,0,0,0.68) 0%, transparent 75%)',
                  filter: 'blur(6px)',
                }}
              />
            </div>
          </div>

        </div>
      </section>
    </>
  )
}
