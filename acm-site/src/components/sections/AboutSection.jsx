import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const pillars = [
  {
    icon: '◈',
    title: 'Learn',
    desc: 'Workshops, talks, and hands-on sessions on cutting‑edge technologies — from AI to systems programming.',
    color: '#0082aa',
  },
  {
    icon: '◉',
    title: 'Build',
    desc: 'Hackathons, project collaborations, and open-source contributions that create real-world impact.',
    color: '#00d4ff',
  },
  {
    icon: '◌',
    title: 'Connect',
    desc: 'A thriving network of students, alumni, and industry professionals who share your passion for tech.',
    color: '#7B4FFF',
  },
  {
    icon: '◎',
    title: 'Compete',
    desc: 'ICPC prep, competitive programming, and inter-college competitions to sharpen your problem-solving skills.',
    color: '#0082aa',
  },
]

export default function AboutSection() {
  const sectionRef = useRef()

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Section reveal
      gsap.fromTo('[data-about-head]',
        { y: 60, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1.1, ease: 'expo.out',
          scrollTrigger: { trigger: '[data-about-head]', start: 'top 82%', toggleActions: 'play none none reverse' },
        }
      )
      gsap.fromTo('[data-about-sub]',
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1, ease: 'expo.out', delay: 0.12,
          scrollTrigger: { trigger: '[data-about-sub]', start: 'top 82%', toggleActions: 'play none none reverse' },
        }
      )
      gsap.fromTo('[data-pillar]',
        { y: 50, opacity: 0, scale: 0.95 },
        {
          y: 0, opacity: 1, scale: 1, duration: 0.9, ease: 'expo.out', stagger: 0.12,
          scrollTrigger: { trigger: '[data-pillar]', start: 'top 80%', toggleActions: 'play none none reverse' },
        }
      )
      gsap.fromTo('[data-about-bar]',
        { scaleX: 0 },
        {
          scaleX: 1, duration: 1.4, ease: 'expo.out', transformOrigin: 'left center',
          scrollTrigger: { trigger: '[data-about-bar]', start: 'top 85%' },
        }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      id="about"
      ref={sectionRef}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 'clamp(80px, 10vh, 140px) clamp(24px, 6vw, 80px)',
        position: 'relative',
      }}
    >
      {/* Dark overlay so text is readable over 3D scene */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(4,8,15,0) 0%, rgba(4,8,15,0.75) 20%, rgba(4,8,15,0.8) 80%, rgba(4,8,15,0) 100%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', width: '100%', margin: '0 auto' }}>

        {/* Label */}
        <div data-about-bar style={{
          width: '48px', height: '2px', marginBottom: '22px',
          background: 'linear-gradient(90deg, #0082aa, #00d4ff)',
          borderRadius: '2px',
        }} />

        <div style={{ display: 'flex', gap: 'clamp(40px, 6vw, 100px)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Left — headline */}
          <div style={{ flex: '1 1 280px', minWidth: '240px' }}>
            <p data-about-head style={{
              fontFamily: "'Courier New', monospace",
              fontSize: '11px', letterSpacing: '0.14em',
              textTransform: 'uppercase', color: '#0082aa',
              marginBottom: '16px',
            }}>
              About us
            </p>
            <h2 data-about-head style={{
              fontSize: 'clamp(36px, 5vw, 64px)',
              fontWeight: 800, lineHeight: 1.05,
              letterSpacing: '-0.04em', color: '#e8f4f8',
              margin: 0,
            }}>
              Where<br />
              <span style={{ color: '#0082aa' }}>
                tech meets
              </span>
              <br />community
            </h2>
          </div>

          {/* Right — description */}
          <div data-about-sub style={{ flex: '2 1 320px' }}>
            <p style={{
              fontSize: 'clamp(15px, 1.7vw, 18px)',
              color: 'rgba(232,244,248,0.72)', lineHeight: 1.8,
              marginBottom: '28px', maxWidth: '560px',
            }}>
              ACM IGDTUW is the student chapter of the Association for Computing Machinery at
              Indira Gandhi Delhi Technical University for Women. Since 2013, we have been
              at the forefront of technical excellence — nurturing the next generation of
              engineers, developers, and tech leaders.
            </p>
            <p style={{
              fontSize: 'clamp(14px, 1.5vw, 16px)',
              color: 'rgba(232,244,248,0.5)', lineHeight: 1.8, maxWidth: '540px',
            }}>
              We run year-round programs including workshops, hackathons, coding contests,
              and speaker sessions with industry experts — giving every member the tools
              to learn, grow, and succeed in the world of computing.
            </p>
          </div>
        </div>

        {/* Pillars grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '18px',
          marginTop: '60px',
        }}>
          {pillars.map((p) => (
            <div
              key={p.title}
              data-pillar
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid rgba(255,255,255,0.07)`,
                borderRadius: '14px',
                padding: '28px 24px',
                backdropFilter: 'blur(12px)',
                transition: 'transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
                cursor: 'default',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-6px)'
                e.currentTarget.style.borderColor = `${p.color}55`
                e.currentTarget.style.boxShadow = `0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px ${p.color}22`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{
                fontSize: '22px', marginBottom: '14px',
                color: p.color,
              }}>
                {p.icon}
              </div>
              <h3 style={{
                color: '#e8f4f8', fontSize: '17px',
                fontWeight: 700, margin: '0 0 10px',
                letterSpacing: '-0.01em',
              }}>
                {p.title}
              </h3>
              <p style={{
                color: 'rgba(232,244,248,0.5)',
                fontSize: '14px', lineHeight: 1.65, margin: 0,
              }}>
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
