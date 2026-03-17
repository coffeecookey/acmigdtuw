import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const events = [
  {
    tag: 'Contest',
    tagColor: '#0082aa',
    date: 'Oct 2024',
    title: 'ICPC Practice Camp',
    desc: 'Intensive 3-day programming camp with ex-ICPC regional contestants, covering graphs, DP, and competitive strategies.',
    participants: '120+',
  },
  {
    tag: 'Hackathon',
    tagColor: '#00c4e0',
    date: 'Aug 2024',
    title: 'HackIGDTUW \'24',
    desc: '24-hour hackathon with industry mentors, exciting prize pools, and challenges spanning AI, Web3, and sustainability.',
    participants: '200+',
  },
  {
    tag: 'Workshop',
    tagColor: '#005f7f',
    date: 'Sep 2024',
    title: 'ML Workshop Series',
    desc: 'Six-session hands-on deep dive into machine learning — from foundations to deploying production-ready models.',
    participants: '80+',
  },
  {
    tag: 'Talk',
    tagColor: '#0082aa',
    date: 'Jul 2024',
    title: 'Tech Talks Vol. 4',
    desc: 'Expert sessions with engineers from Google, Microsoft, and leading startups on careers, open source, and future of tech.',
    participants: '300+',
  },
]

export default function EventsSection() {
  const sectionRef = useRef()

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('[data-ev-head]',
        { y: 60, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1.1, ease: 'expo.out',
          scrollTrigger: { trigger: '[data-ev-head]', start: 'top 82%', toggleActions: 'play none none reverse' },
        }
      )
      gsap.fromTo('[data-ev-card]',
        { y: 80, opacity: 0, rotateX: 8 },
        {
          y: 0, opacity: 1, rotateX: 0, duration: 1.0, ease: 'expo.out', stagger: 0.14,
          scrollTrigger: { trigger: '[data-ev-card]', start: 'top 78%', toggleActions: 'play none none reverse' },
        }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      id="events"
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
        <div data-ev-head style={{ marginBottom: '52px' }}>
          <div style={{
            width: '48px', height: '2px', marginBottom: '22px',
            background: 'linear-gradient(90deg, #0082aa, #00c4e0)', borderRadius: '2px',
          }} />
          <p style={{
            fontFamily: "'Courier New', monospace",
            fontSize: '11px', letterSpacing: '0.14em',
            textTransform: 'uppercase', color: '#0082aa', marginBottom: '14px',
          }}>
            What we do
          </p>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <h2 style={{
              fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 800,
              lineHeight: 1.05, letterSpacing: '-0.04em', color: '#ffffff', margin: 0,
            }}>
              Featured{' '}
              <span style={{ color: '#0082aa' }}>
                Events
              </span>
            </h2>
            <a href="#" style={{
              color: '#0082aa', textDecoration: 'none', fontSize: '13px',
              letterSpacing: '0.05em', fontWeight: 600,
              borderBottom: '1px solid rgba(0,130,170,0.35)',
              paddingBottom: '2px', transition: 'color 0.2s ease',
            }}>
              View all →
            </a>
          </div>
        </div>

        {/* Event cards grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '18px',
        }}>
          {events.map((ev, i) => (
            <div
              key={ev.title}
              data-ev-card
              style={{
                background: 'rgba(255,255,255,0.035)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '16px', padding: '28px 24px',
                backdropFilter: 'blur(16px)',
                transition: 'all 0.3s ease', cursor: 'pointer',
                position: 'relative', overflow: 'hidden',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.01)'
                e.currentTarget.style.borderColor = `${ev.tagColor}44`
                e.currentTarget.style.boxShadow = `0 24px 50px rgba(0,0,0,0.4), 0 0 0 1px ${ev.tagColor}22, inset 0 0 30px ${ev.tagColor}08`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {/* Top accent line */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                height: '2px',
                background: `linear-gradient(90deg, ${ev.tagColor}, transparent)`,
              }} />

              {/* Tag + date */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <span style={{
                  background: `${ev.tagColor}22`,
                  border: `1px solid ${ev.tagColor}44`,
                  color: ev.tagColor,
                  fontSize: '10px', letterSpacing: '0.1em',
                  textTransform: 'uppercase', padding: '4px 10px',
                  borderRadius: '100px',
                  fontFamily: "'Courier New', monospace",
                }}>
                  {ev.tag}
                </span>
                <span style={{
                  color: 'rgba(255,255,255,0.35)', fontSize: '11px',
                  fontFamily: "'Courier New', monospace",
                }}>
                  {ev.date}
                </span>
              </div>

              {/* Title */}
              <h3 style={{
                color: '#ffffff', fontSize: '18px', fontWeight: 700,
                margin: '0 0 12px', letterSpacing: '-0.02em', lineHeight: 1.3,
              }}>
                {ev.title}
              </h3>

              {/* Desc */}
              <p style={{
                color: 'rgba(255,255,255,0.5)', fontSize: '13px',
                lineHeight: 1.7, margin: '0 0 22px',
              }}>
                {ev.desc}
              </p>

              {/* Participants */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                paddingTop: '18px', borderTop: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{ display: 'flex', gap: '-4px' }}>
                  {[0,1,2].map(j => (
                    <div key={j} style={{
                      width: '20px', height: '20px', borderRadius: '50%',
                      background: `hsl(${192 + j * 8}, 60%, 35%)`,
                      border: '2px solid rgba(4,8,15,0.8)',
                      marginLeft: j > 0 ? '-6px' : '0',
                    }} />
                  ))}
                </div>
                <span style={{
                  color: 'rgba(255,255,255,0.45)', fontSize: '12px',
                  fontFamily: "'Courier New', monospace",
                }}>
                  {ev.participants} attended
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
