import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { coreTeamGroups } from '../../data/coreTeam'

gsap.registerPlugin(ScrollTrigger)

function LinkedInIcon({ color = '#00c4e0' }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.94 6.5a1.94 1.94 0 1 1-3.88 0 1.94 1.94 0 0 1 3.88 0ZM3.6 20.4V9.1h3.1v11.3H3.6Zm5.7-11.3h3v1.55h.05c.42-.8 1.45-1.65 2.99-1.65 3.2 0 3.79 2.1 3.79 4.84v6.56h-3.1v-5.82c0-1.39-.02-3.18-1.94-3.18-1.95 0-2.25 1.52-2.25 3.08v5.92h-3.1V9.1Z"
        fill={color}
        opacity="0.95"
      />
    </svg>
  )
}

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
      gsap.fromTo('[data-team-group]',
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, ease: 'expo.out', stagger: 0.06,
          scrollTrigger: { trigger: '[data-team-group]', start: 'top 84%', toggleActions: 'play none none reverse' },
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
            background: 'linear-gradient(90deg, #0082aa, #00c4e0)', borderRadius: '2px',
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
            lineHeight: 1.05, letterSpacing: '-0.04em', color: '#ffffff', margin: '0 0 16px',
          }}>
            The{' '}
            <span style={{ color: '#0082aa' }}>
              People
            </span>
            {' '}Behind it All
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.5)', fontSize: 'clamp(14px, 1.6vw, 17px)',
            maxWidth: '500px', margin: '0 auto', lineHeight: 1.7,
          }}>
            A passionate group of students driving innovation, events, and community at ACM IGDTUW.
          </p>
        </div>

        {/* Team grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '34px' }}>
          {coreTeamGroups.map((group) => (
            <div key={group.title} data-team-group>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '14px', marginBottom: '18px',
              }}>
                <div style={{
                  height: '1px', flex: 1,
                  background: 'linear-gradient(90deg, rgba(0,130,170,0), rgba(0,130,170,0.22))',
                }} />
                <div style={{
                  color: 'rgba(255,255,255,0.75)',
                  fontSize: '11px',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  fontFamily: "'Courier New', monospace",
                }}>
                  {group.title}
                </div>
                <div style={{
                  height: '1px', flex: 1,
                  background: 'linear-gradient(90deg, rgba(0,196,224,0.22), rgba(0,196,224,0))',
                }} />
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 170px))',
                gap: '18px',
                justifyContent: 'center',
              }}>
                {group.members.map((member) => (
                  <div
                    key={`${group.title}-${member.name}-${member.role}`}
                    data-team-card
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: '18px', padding: '32px 20px 24px',
                      backdropFilter: 'blur(12px)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      gap: '14px', textAlign: 'center',
                      transition: 'all 0.3s ease', cursor: 'default',
                      position: 'relative',
                    }}
                    onMouseEnter={e => {
                      const c = member.color ?? '#0082aa'
                      e.currentTarget.style.transform = 'translateY(-10px)'
                      e.currentTarget.style.borderColor = `${c}55`
                      e.currentTarget.style.boxShadow = `0 24px 50px rgba(0,0,0,0.4), 0 0 0 1px ${c}22`
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    {member.linkedin ? (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${member.name} on LinkedIn`}
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          width: '30px',
                          height: '30px',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          backdropFilter: 'blur(10px)',
                          textDecoration: 'none',
                          transition: 'transform 0.18s ease, border-color 0.18s ease, background 0.18s ease',
                        }}
                        onMouseEnter={e => {
                          const c = member.color ?? '#0082aa'
                          e.currentTarget.style.transform = 'translateY(-2px)'
                          e.currentTarget.style.borderColor = `${c}55`
                          e.currentTarget.style.background = 'rgba(0,130,170,0.08)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                          e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                        }}
                      >
                        <LinkedInIcon color={member.color ?? '#00c4e0'} />
                      </a>
                    ) : null}

                    <div style={{
                      width: '68px', height: '68px', borderRadius: '50%',
                      background: `linear-gradient(135deg, ${(member.color ?? '#0082aa')}33, ${(member.color ?? '#0082aa')}11)`,
                      border: `2px solid ${(member.color ?? '#0082aa')}44`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '20px', fontWeight: 800, color: member.color ?? '#0082aa',
                      boxShadow: `0 0 24px ${(member.color ?? '#0082aa')}33`,
                      letterSpacing: '-0.02em',
                      position: 'relative',
                      overflow: 'hidden',
                    }}>
                      {member.image ? (
                        <img
                          src={member.image}
                          alt={member.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                        />
                      ) : (
                        member.initials
                      )}
                      <div style={{
                        position: 'absolute', top: '4px', right: '4px',
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: member.color ?? '#0082aa',
                        boxShadow: `0 0 8px ${member.color ?? '#0082aa'}`,
                        animation: 'acm-pulse 2s ease-in-out infinite',
                      }} />
                    </div>

                    <div>
                      <div style={{
                        color: '#ffffff', fontWeight: 700, fontSize: '15px',
                        letterSpacing: '-0.01em', marginBottom: '5px',
                      }}>
                        {member.name}
                      </div>
                      {member.role ? (
                        <div style={{
                          color: member.color ?? '#0082aa', fontSize: '11px',
                          letterSpacing: '0.08em', textTransform: 'uppercase',
                          fontFamily: "'Courier New', monospace",
                          marginBottom: '8px',
                        }}>
                          {member.role}
                        </div>
                      ) : null}
                      <div style={{
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: '11px',
                        letterSpacing: '0.08em',
                        fontFamily: "'Courier New', monospace",
                        textTransform: 'uppercase',
                        lineHeight: 1.4,
                      }}>
                        {member.course ? <div>{member.course}</div> : null}
                        {member.year ? <div>{member.year}</div> : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* "Join the team" hint */}
        <div style={{
          textAlign: 'center', marginTop: '48px',
          color: 'rgba(255,255,255,0.35)', fontSize: '13px',
          fontFamily: "'Courier New', monospace", letterSpacing: '0.08em',
        }}>
        </div>
      </div>
    </section>
  )
}
