import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const projects = [
  {
    number: '01',
    title: 'ACM Pathfinder',
    subtitle: 'AI-Powered Navigation',
    desc: 'Campus-wide smart navigation using computer vision and reinforcement learning to optimize pedestrian routes in real time.',
    tags: ['Python', 'OpenCV', 'TensorFlow', 'FastAPI'],
    color: '#0082aa',
    link: '#',
  },
  {
    number: '02',
    title: 'CampusConnect',
    subtitle: 'Student Platform',
    desc: 'A full-stack community platform integrating events, clubs, mentorship matching, and collaborative workspaces for 3,000+ students.',
    tags: ['React', 'Node.js', 'MongoDB', 'Socket.io'],
    color: '#00c4e0',
    link: '#',
  },
  {
    number: '03',
    title: 'CodeLens',
    subtitle: 'Competitive Programming Tool',
    desc: 'Browser extension that overlays complexity analysis, test-case generation, and editorial hints directly on Codeforces and LeetCode.',
    tags: ['TypeScript', 'Chrome API', 'GPT-4', 'Redis'],
    color: '#0082aa',
    link: '#',
  },
]

export default function ProjectsSection() {
  const sectionRef = useRef()

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('[data-proj-head]',
        { y: 60, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1.1, ease: 'expo.out',
          scrollTrigger: { trigger: '[data-proj-head]', start: 'top 82%', toggleActions: 'play none none reverse' },
        }
      )

      const cards = sectionRef.current.querySelectorAll('[data-proj-card]')
      cards.forEach((card, i) => {
        const dir = i % 2 === 0 ? -80 : 80
        gsap.fromTo(card,
          { x: dir, opacity: 0 },
          {
            x: 0, opacity: 1, duration: 1.1, ease: 'expo.out', delay: i * 0.1,
            scrollTrigger: { trigger: card, start: 'top 80%', toggleActions: 'play none none reverse' },
          }
        )
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      id="projects"
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
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(4,8,15,0) 0%, rgba(4,8,15,0.8) 15%, rgba(4,8,15,0.85) 85%, rgba(4,8,15,0) 100%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', width: '100%', margin: '0 auto' }}>

        {/* Header */}
        <div data-proj-head style={{ marginBottom: '56px' }}>
          <div style={{
            width: '48px', height: '2px', marginBottom: '22px',
            background: 'linear-gradient(90deg, #0082aa, #00c4e0)', borderRadius: '2px',
          }} />
          <p style={{
            fontFamily: "'Courier New', monospace",
            fontSize: '11px', letterSpacing: '0.14em',
            textTransform: 'uppercase', color: '#0082aa', marginBottom: '14px',
          }}>
            What we build
          </p>
          <h2 style={{
            fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 800,
            lineHeight: 1.05, letterSpacing: '-0.04em', color: '#ffffff', margin: 0,
          }}>
            Featured{' '}
            <span style={{ color: '#0082aa' }}>
              Projects
            </span>
          </h2>
        </div>

        {/* Project cards — alternating layout */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {projects.map((proj, i) => (
            <div
              key={proj.number}
              data-proj-card
              style={{
                display: 'flex',
                alignItems: 'stretch',
                gap: '0',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '18px',
                overflow: 'hidden',
                backdropFilter: 'blur(16px)',
                transition: 'all 0.35s ease',
                cursor: 'pointer',
                flexDirection: i % 2 === 1 ? 'row-reverse' : 'row',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = `${proj.color}44`
                e.currentTarget.style.boxShadow = `0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px ${proj.color}22`
                e.currentTarget.style.transform = 'scale(1.01)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              {/* Number accent panel */}
              <div style={{
                width: 'clamp(80px, 10vw, 140px)',
                flexShrink: 0,
                background: `linear-gradient(135deg, ${proj.color}22, ${proj.color}08)`,
                borderRight: i % 2 === 1 ? 'none' : `1px solid ${proj.color}22`,
                borderLeft: i % 2 === 1 ? `1px solid ${proj.color}22` : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{
                  fontSize: 'clamp(36px, 5vw, 64px)',
                  fontWeight: 900, color: `${proj.color}`,
                  opacity: 0.25, letterSpacing: '-0.05em',
                  fontFamily: "'Courier New', monospace",
                }}>
                  {proj.number}
                </span>
              </div>

              {/* Content */}
              <div style={{ padding: 'clamp(24px, 3vw, 40px)', flex: 1 }}>
                <div style={{
                  display: 'flex', alignItems: 'flex-start',
                  justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap',
                }}>
                  <div>
                    <p style={{
                      fontFamily: "'Courier New', monospace",
                      fontSize: '10px', letterSpacing: '0.12em',
                      textTransform: 'uppercase', color: proj.color,
                      marginBottom: '8px',
                    }}>
                      {proj.subtitle}
                    </p>
                    <h3 style={{
                      color: '#ffffff', fontSize: 'clamp(20px, 2.5vw, 28px)',
                      fontWeight: 800, margin: '0 0 14px', letterSpacing: '-0.03em',
                    }}>
                      {proj.title}
                    </h3>
                  </div>
                  <a href={proj.link} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '36px', height: '36px', borderRadius: '50%',
                    border: `1px solid ${proj.color}55`,
                    color: proj.color, textDecoration: 'none', fontSize: '16px',
                    flexShrink: 0, transition: 'all 0.2s ease',
                    marginTop: '4px',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = `${proj.color}22`
                    e.currentTarget.style.transform = 'scale(1.1) rotate(-45deg)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.transform = 'scale(1) rotate(0deg)'
                  }}
                  >
                    ↗
                  </a>
                </div>

                <p style={{
                  color: 'rgba(255,255,255,0.55)', fontSize: 'clamp(13px, 1.4vw, 15px)',
                  lineHeight: 1.72, margin: '0 0 20px', maxWidth: '560px',
                }}>
                  {proj.desc}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {proj.tags.map(tag => (
                    <span key={tag} style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'rgba(255,255,255,0.6)',
                      padding: '4px 11px', borderRadius: '6px',
                      fontSize: '11px', letterSpacing: '0.04em',
                      fontFamily: "'Courier New', monospace",
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
