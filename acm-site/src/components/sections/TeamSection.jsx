import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const team = [
  { name: 'xxx',    role: 'President',       initials: 'initials', color: '#0082aa' },
  { name: 'xxx',    role: 'Vice President',  initials: 'PS', color: '#00d4ff' },
  { name: 'xxx',    role: 'Tech Lead',       initials: 'AG', color: '#7B4FFF' },
  { name: 'xxx',      role: 'Design Lead',     initials: 'RV', color: '#0082aa' },
  { name: 'xxx',    role: 'Events Lead',     initials: 'SK', color: '#00d4ff' },
  { name: 'xxx',      role: 'Outreach Lead',   initials: 'DN', color: '#7B4FFF' },
]

export default function TeamSection() {
  const sectionRef = useRef()

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('[data-team-head]',
        { y: 60, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1.1, ease: 'expo.out',
          scrollTrigger: { trigger: '[data-team-head]', start: 'top 82%', toggleActions: 'play none none reverse' },
        }
      )
      gsap.fromTo('[data-team-card]',
        { y: 60, opacity: 0, scale: 0.92 },
        {
          y: 0, opacity: 1, scale: 1, duration: 0.9, ease: 'expo.out', stagger: 0.1,
          scrollTrigger: { trigger: '[data-team-card]', start: 'top 78%', toggleActions: 'play none none reverse' },
        }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      id="team"
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
        background: 'linear-gradient(180deg, rgba(4,8,15,0) 0%, rgba(4,8,15,0.78) 15%, rgba(4,8,15,0.82) 85%, rgba(4,8,15,0) 100%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', width: '100%', margin: '0 auto' }}>

        {/* Header */}
        <div data-team-head style={{ marginBottom: '52px', textAlign: 'center' }}>
          <div style={{
            width: '48px', height: '2px', margin: '0 auto 22px',
            background: 'linear-gradient(90deg, #0082aa, #00d4ff)', borderRadius: '2px',
          }} />
          <p style={{
            fontFamily: "'Courier New', monospace",
            fontSize: '11px', letterSpacing: '0.14em',
            textTransform: 'uppercase', color: '#0082aa', marginBottom: '14px',
          }}>
            Core team
          </p>
          <h2 style={{
            fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 800,
            lineHeight: 1.05, letterSpacing: '-0.04em', color: '#e8f4f8', margin: '0 0 16px',
          }}>
            The{' '}
            <span style={{ color: '#0082aa' }}>
              People
            </span>
            {' '}Behind it All
          </h2>
          <p style={{
            color: 'rgba(232,244,248,0.5)', fontSize: 'clamp(14px, 1.6vw, 17px)',
            maxWidth: '500px', margin: '0 auto', lineHeight: 1.7,
          }}>
            A passionate group of students driving innovation, events, and community at ACM IGDTUW.
          </p>
        </div>

        {/* Team grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
          gap: '18px',
        }}>
          {team.map((member) => (
            <div
              key={member.name}
              data-team-card
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '18px', padding: '32px 20px 24px',
                backdropFilter: 'blur(12px)',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: '14px', textAlign: 'center',
                transition: 'all 0.3s ease', cursor: 'default',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-10px)'
                e.currentTarget.style.borderColor = `${member.color}55`
                e.currentTarget.style.boxShadow = `0 24px 50px rgba(0,0,0,0.4), 0 0 0 1px ${member.color}22`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {/* Avatar */}
              <div style={{
                width: '68px', height: '68px', borderRadius: '50%',
                background: `linear-gradient(135deg, ${member.color}33, ${member.color}11)`,
                border: `2px solid ${member.color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px', fontWeight: 800, color: member.color,
                boxShadow: `0 0 24px ${member.color}33`,
                letterSpacing: '-0.02em',
                position: 'relative',
              }}>
                {member.initials}
                {/* Orbit dot */}
                <div style={{
                  position: 'absolute', top: '4px', right: '4px',
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: member.color,
                  boxShadow: `0 0 8px ${member.color}`,
                  animation: 'acm-pulse 2s ease-in-out infinite',
                }} />
              </div>

              {/* Name + role */}
              <div>
                <div style={{
                  color: '#e8f4f8', fontWeight: 700, fontSize: '15px',
                  letterSpacing: '-0.01em', marginBottom: '5px',
                }}>
                  {member.name}
                </div>
                <div style={{
                  color: member.color, fontSize: '11px',
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  fontFamily: "'Courier New', monospace",
                }}>
                  {member.role}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* "Join the team" hint */}
        <div style={{
          textAlign: 'center', marginTop: '48px',
          color: 'rgba(232,244,248,0.35)', fontSize: '13px',
          fontFamily: "'Courier New', monospace", letterSpacing: '0.08em',
        }}>
        </div>
      </div>
    </section>
  )
}
