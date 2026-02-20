import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { setPlaying } from '../../lib/store'

gsap.registerPlugin(ScrollTrigger)

const stats = [
  { value: '200+', label: 'Members'  },
  { value: '50+',  label: 'Events'   },
  { value: '20+',  label: 'Projects' },
]

export default function HeroSection() {
  const sectionRef = useRef()
  const badgeRef   = useRef()
  const headRef    = useRef()
  const subRef     = useRef()
  const btnsRef    = useRef()
  const statsRef   = useRef()
  const logoRef    = useRef()
  const scrollRef  = useRef()

  useEffect(() => {
    // ── Entrance ──────────────────────────────────────────────
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
      tl.fromTo(badgeRef.current,  { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1.0 }, 0.2)
        .fromTo(headRef.current,   { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1 }, 0.35)
        .fromTo(subRef.current,    { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.0 }, 0.5)
        .fromTo(btnsRef.current,   { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 }, 0.62)
        .fromTo(statsRef.current.children,
          { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.1 }, 0.72)
        .fromTo(logoRef.current,   { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.3, ease: 'expo.out' }, 0.1)

      // Scroll indicator pulse
      gsap.to(scrollRef.current, { opacity: 0.1, yoyo: true, repeat: -1, duration: 1.2, ease: 'sine.inOut' })
    }, sectionRef)

    // ── Scroll exit ───────────────────────────────────────────
    const exitCtx = gsap.context(() => {
      const exitTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end:   'bottom top',
          scrub: 1.2,
        },
      })
      exitTl
        .to(headRef.current,  { y: -120, opacity: 0 }, 0)
        .to(subRef.current,   { y: -80,  opacity: 0 }, 0.05)
        .to(btnsRef.current,  { y: -50,  opacity: 0 }, 0.1)
        .to(statsRef.current, { y: -30,  opacity: 0 }, 0.15)
        .to(logoRef.current,  { scale: 0.6, opacity: 0, y: -60 }, 0)
        .to(badgeRef.current, { y: -40,  opacity: 0 }, 0.05)
    }, sectionRef)

    return () => { ctx.revert(); exitCtx.revert() }
  }, [])

  return (
    <section
      id="hero"
      ref={sectionRef}
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: '0 clamp(24px, 6vw, 80px)',
      }}
    >
      {/* Left content */}
      <div style={{ flex: '1 1 auto', maxWidth: '580px', position: 'relative', zIndex: 2 }}>
        {/* Badge */}
        {/* this is for a small content bubble right above the left heading, I have removed it for now */}
        <div ref={badgeRef} style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          borderRadius: '100px', padding: '6px 16px',
          marginBottom: '28px',
          color: '#00d4ff', fontSize: '11px',
          fontFamily: "'Courier New', monospace",
          letterSpacing: '0.12em', textTransform: 'uppercase',
        }}>
          {/* <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: '#00d4ff', display: 'block',
            boxShadow: '0 0 8px #00d4ff',
            animation: 'acm-pulse 1.8s ease-in-out infinite',
          }} />
          IGDTUW · Est. 2013 */}
        </div>

        {/* Headline */}
        <h1 ref={headRef} style={{
          fontSize: 'clamp(52px, 8vw, 108px)',
          fontWeight: 800, lineHeight: 0.96,
          letterSpacing: '-0.045em', color: '#e8f4f8',
          margin: '0 0 22px',
        }}>
          ACM<br />
          <span style={{ color: '#0082aa' }}>
            IGDTUW
          </span>
        </h1>

        {/* Subtitle */}
        <p ref={subRef} style={{
          fontSize: 'clamp(14px, 1.6vw, 18px)',
          color: 'rgba(232,244,248,0.65)',
          lineHeight: 1.75, margin: '0 0 38px',
          maxWidth: '460px',
        }}>
          One of IGDTUW's oldest tech clubs, fostering a community of like minded geeks!
        </p>

        {/* CTA Buttons */}
        <div ref={btnsRef} style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <a
            href="#join"
            className="btn-primary"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'linear-gradient(135deg, #0082aa, #005f7f)',
              color: '#fff', textDecoration: 'none',
              padding: '14px 30px', borderRadius: '10px',
              fontWeight: 700, fontSize: '13px', letterSpacing: '0.04em',
              boxShadow: '0 0 28px rgba(0,130,170,0.45), 0 4px 16px rgba(0,0,0,0.3)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              position: 'relative', overflow: 'hidden',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 0 40px rgba(0,212,255,0.55), 0 8px 24px rgba(0,0,0,0.3)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 0 28px rgba(0,130,170,0.45), 0 4px 16px rgba(0,0,0,0.3)'
            }}
          >
            <span>POTD</span>
            <span style={{ opacity: 0.8 }}>→</span>
          </a>
          <a
            href="#events"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(255,255,255,0.04)',
              color: '#e8f4f8', textDecoration: 'none',
              padding: '14px 30px', borderRadius: '10px',
              fontWeight: 600, fontSize: '13px', letterSpacing: '0.04em',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(0,212,255,0.4)'
              e.currentTarget.style.background = 'rgba(0,130,170,0.08)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            Past Events
          </a>
        </div>

        {/* Stats */}
        <div
          ref={statsRef}
          style={{
            display: 'flex', gap: '36px', marginTop: '56px',
            paddingTop: '32px',
            borderTop: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          {/* {stats.map(({ value, label }) => (
            <div key={label}>
              <div style={{
                fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 800,
                color: '#00d4ff', lineHeight: 1,
              }}>
                {value}
              </div>
              <div style={{
                fontSize: '11px', color: 'rgba(232,244,248,0.45)',
                marginTop: '5px', letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontFamily: "'Courier New', monospace",
              }}>
                {label}
              </div>
            </div>
          ))} */}
        </div>
      </div>

      {/* ACM Logo + play hint — right side */}
      <div
        ref={logoRef}
        style={{
          flex: '0 0 auto',
          width: 'clamp(180px, 22vw, 340px)',
          marginLeft: 'auto',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        <img
          src="/acm-logo.svg"
          alt="ACM IGDTUW"
          style={{ width: '100%', height: 'auto' }}
        />

        {/* Play button — exits with logo on scroll, hidden by CSS when playing */}
        <button
          onClick={() => setPlaying(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'rgba(4,8,15,0.72)',
            border: '1px solid rgba(0,212,255,0.28)',
            borderRadius: '100px',
            padding: '7px 18px',
            backdropFilter: 'blur(12px)',
            color: '#00d4ff',
            fontSize: '11px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontFamily: "'Courier New', monospace",
            whiteSpace: 'nowrap',
            animation: 'acm-fade-up 0.8s ease both 1s',
            cursor: 'pointer',
            transition: 'background 0.2s ease, border-color 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(0,130,170,0.18)'
            e.currentTarget.style.borderColor = 'rgba(0,212,255,0.55)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(4,8,15,0.72)'
            e.currentTarget.style.borderColor = 'rgba(0,212,255,0.28)'
          }}
        >
          <span style={{
            display: 'inline-block', width: '6px', height: '6px',
            borderRadius: '50%', background: '#00d4ff',
            boxShadow: '0 0 8px #00d4ff',
            animation: 'acm-pulse 1.6s ease-in-out infinite',
          }} />
          ← → Play Breakout
          <span style={{
            display: 'inline-block', width: '6px', height: '6px',
            borderRadius: '50%', background: '#00d4ff',
            boxShadow: '0 0 8px #00d4ff',
            animation: 'acm-pulse 1.6s ease-in-out infinite 0.5s',
          }} />
        </button>
      </div>

      {/* Scroll indicator */}
      <div
        ref={scrollRef}
        style={{
          position: 'absolute', bottom: '36px', left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
          color: 'rgba(232,244,248,0.35)', fontSize: '10px',
          letterSpacing: '0.18em', textTransform: 'uppercase',
          fontFamily: "'Courier New', monospace",
        }}
      >
        scroll
        <div style={{
          width: '1px', height: '44px',
          background: 'linear-gradient(to bottom, rgba(0,212,255,0.8), transparent)',
          animation: 'acm-scroll-line 1.6s ease-in-out infinite',
        }} />
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          #hero { flex-direction: column; justify-content: center; padding-top: 100px !important; }
          #hero > div:last-child { display: none; }
        }
      `}</style>
    </section>
  )
}
