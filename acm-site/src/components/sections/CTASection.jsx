import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const benefits = [
  { icon: '⬡', text: 'Access to exclusive workshops & bootcamps' },
  { icon: '⬡', text: 'Mentorship from industry professionals' },
  { icon: '⬡', text: 'Networking with 200+ tech-driven peers' },
  { icon: '⬡', text: 'Priority access to hackathons & competitions' },
  { icon: '⬡', text: 'Collaborative projects that build real skills' },
  { icon: '⬡', text: 'Lifetime access to our alumni network' },
]

export default function CTASection() {
  const sectionRef = useRef()
  const logoRef    = useRef()
  const contentRef = useRef()
  const particleRef = useRef()

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate the climax logo
      gsap.fromTo(logoRef.current,
        { scale: 0.5, opacity: 0, rotation: -15 },
        {
          scale: 1, opacity: 1, rotation: 0,
          duration: 1.6, ease: 'expo.out',
          scrollTrigger: { trigger: logoRef.current, start: 'top 85%', toggleActions: 'play none none reverse' },
        }
      )

      // Stagger the content
      gsap.fromTo('[data-cta-item]',
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1, ease: 'expo.out', stagger: 0.1,
          scrollTrigger: { trigger: contentRef.current, start: 'top 78%', toggleActions: 'play none none reverse' },
        }
      )

      // Pulse the CTA button
      gsap.to('[data-cta-btn]', {
        boxShadow: '0 0 60px rgba(0,212,255,0.6), 0 0 120px rgba(0,130,170,0.3)',
        yoyo: true, repeat: -1, duration: 1.8, ease: 'sine.inOut',
        scrollTrigger: { trigger: '[data-cta-btn]', start: 'top 85%' },
      })

      // Floating particles
      const particles = particleRef.current?.querySelectorAll('[data-particle]') ?? []
      particles.forEach((p, i) => {
        gsap.to(p, {
          y: `${-20 - Math.random() * 40}px`,
          x: `${(Math.random() - 0.5) * 30}px`,
          opacity: 0,
          duration: 2 + Math.random() * 2,
          delay: i * 0.3,
          repeat: -1,
          ease: 'power1.out',
        })
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      id="join"
      ref={sectionRef}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(80px, 10vh, 140px) clamp(24px, 6vw, 80px)',
        position: 'relative',
        textAlign: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Gradient overlay — less opaque for climax */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(0,130,170,0.06) 0%, rgba(4,8,15,0.7) 60%, rgba(4,8,15,0.85) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Floating particles behind content */}
      <div ref={particleRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {Array.from({ length: 18 }, (_, i) => (
          <div
            key={i}
            data-particle
            style={{
              position: 'absolute',
              left: `${5 + (i / 18) * 90}%`,
              bottom: `${10 + Math.random() * 40}%`,
              width: `${3 + Math.random() * 5}px`,
              height: `${3 + Math.random() * 5}px`,
              borderRadius: '50%',
              background: i % 3 === 0 ? '#0082aa' : i % 3 === 1 ? '#00d4ff' : '#7B4FFF',
              opacity: 0.5,
              boxShadow: `0 0 10px currentColor`,
              filter: `blur(${Math.random() * 2}px)`,
            }}
          />
        ))}
      </div>

      {/* Logo (climax reveal) */}
      <div ref={logoRef} style={{
        width: 'clamp(100px, 14vw, 180px)',
        marginBottom: '36px',
        position: 'relative', zIndex: 2,
      }}>
        <img src="/acm-logo.svg" alt="ACM IGDTUW" style={{ width: '100%', height: 'auto' }} />
      </div>

      {/* Content */}
      <div ref={contentRef} style={{ position: 'relative', zIndex: 2, maxWidth: '680px', width: '100%' }}>

        <p data-cta-item style={{
          fontFamily: "'Courier New', monospace",
          fontSize: '11px', letterSpacing: '0.14em',
          textTransform: 'uppercase', color: '#0082aa', marginBottom: '16px',
        }}>
          Be part of the story
        </p>

        <h2 data-cta-item style={{
          fontSize: 'clamp(40px, 6vw, 80px)', fontWeight: 800,
          lineHeight: 1.02, letterSpacing: '-0.045em',
          color: '#e8f4f8', margin: '0 0 20px',
        }}>
          Ready to{' '}
          <span style={{ color: '#0082aa' }}>
            launch
          </span>
          ?
        </h2>

        <p data-cta-item style={{
          color: 'rgba(232,244,248,0.62)', fontSize: 'clamp(15px, 1.7vw, 18px)',
          lineHeight: 1.75, margin: '0 0 40px', maxWidth: '560px', marginLeft: 'auto', marginRight: 'auto',
        }}>
          Join ACM IGDTUW and become part of a community that builds, competes,
          and innovates together — turning ideas into impact.
        </p>

        {/* Benefits */}
        <div data-cta-item style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '10px',
          marginBottom: '44px',
          textAlign: 'left',
        }}>
          {benefits.map((b, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: '10px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '10px', padding: '12px 16px',
              backdropFilter: 'blur(8px)',
            }}>
              <span style={{ color: '#00d4ff', fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>
                {b.icon}
              </span>
              <span style={{ color: 'rgba(232,244,248,0.65)', fontSize: '13px', lineHeight: 1.5 }}>
                {b.text}
              </span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div data-cta-item style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href="https://forms.gle/join"
            data-cta-btn
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              background: 'linear-gradient(135deg, #0082aa, #005f7f)',
              color: '#fff', textDecoration: 'none',
              padding: '16px 40px', borderRadius: '12px',
              fontWeight: 700, fontSize: '15px', letterSpacing: '0.04em',
              boxShadow: '0 0 40px rgba(0,130,170,0.5), 0 4px 20px rgba(0,0,0,0.3)',
              transition: 'transform 0.2s ease',
              position: 'relative', overflow: 'hidden',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
          >
            {/* Shimmer */}
            <span style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%)',
              animation: 'acm-shimmer 3s linear infinite',
            }} />
            Join ACM IGDTUW →
          </a>
          <a
            href="mailto:acm@igdtuw.ac.in"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              background: 'rgba(255,255,255,0.04)',
              color: '#e8f4f8', textDecoration: 'none',
              padding: '16px 32px', borderRadius: '12px',
              fontWeight: 600, fontSize: '15px', letterSpacing: '0.04em',
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
            Get in touch
          </a>
        </div>

        {/* Social links */}
        <div data-cta-item style={{
          display: 'flex', gap: '20px', justifyContent: 'center',
          marginTop: '40px', paddingTop: '32px',
          borderTop: '1px solid rgba(255,255,255,0.07)',
        }}>
          {[
            { label: 'GitHub',    href: '#' },
            { label: 'LinkedIn',  href: '#' },
            { label: 'Instagram', href: '#' },
            { label: 'Twitter',   href: '#' },
          ].map(({ label, href }) => (
            <a key={label} href={href} style={{
              color: 'rgba(232,244,248,0.35)', fontSize: '12px',
              textDecoration: 'none', letterSpacing: '0.06em',
              fontFamily: "'Courier New', monospace",
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#00d4ff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(232,244,248,0.35)'}
            >
              {label}
            </a>
          ))}
        </div>

        {/* Footer note */}
        <p style={{
          color: 'rgba(232,244,248,0.2)', fontSize: '11px',
          marginTop: '32px', fontFamily: "'Courier New', monospace",
          letterSpacing: '0.06em',
        }}>
          © 2025 ACM Student Chapter · IGDTUW · All rights reserved
        </p>
      </div>
    </section>
  )
}
