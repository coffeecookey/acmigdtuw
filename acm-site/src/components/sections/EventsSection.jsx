 import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const events = [
  {
    tag: 'Workshop',
    tagColor: '#00c4e0',
    date: 'Feb 2026',
    title: 'AI for Social Good',
    desc: 'Expert session on leveraging AI to counter online aggression and build safer digital communities.',
    objective: 'Explored technical strategies to identify and mitigate online hostility using AI systems.',
    participants: '25+',
    images: [
      '/events/ai-for-social-good-1.jpg',
      '/events/ai-for-social-good-2.jpg'
    ]
  },
  {
    tag: 'Workshop',
    tagColor: '#0082aa',
    date: 'Feb 2026',
    title: 'AI x Augmented Reality Workshop',
    desc: 'Hands-on workshop exploring AR/VR technologies and building real-world immersive experiences.',
    objective: 'Introduced students to AR/VR tools and guided them in building practical immersive applications.',
    participants: '30+',
    images: ['/events/acmxleanin.jpg']
  },
  {
    tag: 'Event',
    tagColor: '#005f7f',
    date: 'Feb 2026',
    title: 'Winter Workshop Felicitation',
    desc: 'Recognition ceremony celebrating participants, mentors, and coordinators.',
    objective: 'Recognised contributions and performance of participants in the ACM Winter Workshop program.',
    participants: '30+',
    images: [
      '/events/winter-workshop-fel-1.jpg',
      '/events/winter-workshop-fel-2.jpg'
    ]
  },
  {
    tag: 'Workshop',
    tagColor: '#00c4e0',
    date: 'Dec 2025 – Jan 2026',
    title: 'ACM Winter Workshop',
    desc: 'Structured program covering DSA, projects, resume building, and mentorship.',
    objective: 'Strengthened technical foundations through guided mentorship, DSA practice, and career preparation.',
    participants: '40+',
    images: ['/events/winter-workshop-1.png']
  },
  {
    tag: 'Event',
    tagColor: '#0082aa',
    date: 'Nov 2025',
    title: 'Online Orientation',
    desc: 'Virtual orientation session introducing ACM and opportunities.',
    objective: 'Introduced ACM initiatives, membership benefits, and engagement opportunities to new students.',
    participants: '40+',
    images: ['/events/online-orientation.jpeg']
  },
  {
    tag: 'Event',
    tagColor: '#005f7f',
    date: 'Oct 2025',
    title: 'Offline Orientation',
    desc: 'Introduction to ACM community with interactive activities.',
    objective: 'Built awareness about ACM activities and encouraged student participation through engagement.',
    participants: '40+',
    images: [
      '/events/offline-orientation-1.jpg',
      '/events/offline-orientation-2.jpg'
    ]
  },
  {
    tag: 'Competition',
    tagColor: '#00c4e0',
    date: 'Oct 2025',
    title: 'AI Comic Creation Challenge',
    desc: 'Creative competition using AI tools like DALL·E and Gemini to design engaging comic strips.',
    objective: 'Encouraged creative storytelling using generative AI tools.',
    participants: '20+',
    images: ['/events/comic-creation.jpeg']
  },
  {
    tag: 'Talk',
    tagColor: '#0082aa',
    date: 'Sep 2025',
    title: 'Alumni Connect',
    desc: 'Session on cybersecurity careers, certifications, and building industry-ready skillsets.',
    objective: 'Provided insights into cybersecurity careers and industry expectations.',
    participants: '15+',
    images: ['/events/alumini-connect.jpeg']
  },
  {
    tag: 'Talk',
    tagColor: '#00c4e0',
    date: 'Aug 2025',
    title: 'Future of Generative AI',
    desc: 'Expert session by Dr. Akshi Kumar on advancements in GenAI and sustainable AI systems.',
    objective: 'Explored real-world applications and future trends in generative AI.',
    participants: '350+',
    images: [
      '/events/future-of-genai-1.jpg',
      '/events/future-of-genai-2.jpg'
    ]
  },
  {
    tag: 'Program',
    tagColor: '#005f7f',
    date: 'Apr 2025',
    title: 'ACM Research Internship Conclusion',
    desc: 'Final evaluation and recognition of research internship projects with awards and certifications.',
    objective: 'Showcased research outcomes and recognized student achievements.',
    participants: '30+',
    images: []  
  },
  // {
  //   tag: 'Workshop',
  //   tagColor: '#0082aa',
  //   date: 'Feb 2025',
  //   title: 'Meditation and Happiness',
  //   desc: 'Session focused on mental well-being, mindfulness, and personal growth.',
  //   objective: 'Promoted mental well-being and stress management among students.',
  //   participants: '—',
  //   images: []
  // },
  // {
  //   tag: 'Talk',
  //   tagColor: '#00c4e0',
  //   date: 'Jan 2025',
  //   title: 'Career Options After B.Tech',
  //   desc: 'Guidance session on career paths, higher studies, and competitive exams.',
  //   objective: 'Guided students on various career pathways after graduation.',
  //   participants: '—',
  //   images: []
  // },
  // {
  //   tag: 'Talk',
  //   tagColor: '#0082aa',
  //   date: 'Nov 2024',
  //   title: 'Motivation and Higher Studies',
  //   desc: 'Session providing strategies for academic growth and higher education planning.',
  //   objective: 'Motivated students to pursue higher education and structured preparation.',
  //   participants: '—',
  //   images: []
  // }
]

export default function EventsSection() {
  const sectionRef = useRef()
  const scrollRef = useRef()
  const [selectedEvent, setSelectedEvent] = useState(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('[data-ev-head]',
        { y: 60, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1.1, ease: 'expo.out',
          scrollTrigger: { trigger: '[data-ev-head]', start: 'top 82%' },
        }
      )

      gsap.fromTo('[data-ev-card]',
        { y: 80, opacity: 0, rotateX: 8 },
        {
          y: 0, opacity: 1, rotateX: 0,
          duration: 1, stagger: 0.12, ease: 'expo.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id = 'events'
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
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, rgba(4,8,15,0) 0%, rgba(4,8,15,0.8) 20%, rgba(4,8,15,0.85) 80%, rgba(4,8,15,0) 100%)',
        pointerEvents: 'none'
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <div data-ev-head style={{ marginBottom: '52px' }}>
          <h2 style={{
            fontSize: 'clamp(36px,5vw,64px)',
            fontWeight: 800,
            color: '#fff'
          }}>
            Featured <span style={{ color: '#0082aa' }}>Events</span>
          </h2>
        </div>

        {/* Scroll wrapper */}
        <div style={{ position: 'relative' }}>

          {/* Left */}
          <button
            onClick={() => scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' })}
            style={{
              position: 'absolute',
              left: '-20px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.035)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.07)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '18px'
            }}
          >←</button>

          {/* Right */}
          <button
            onClick={() => scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' })}
            style={{
              position: 'absolute',
              right: '-20px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.035)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.07)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '18px'
            }}
          >→</button>

          {/* Cards */}
          <div
            ref={scrollRef}
            className="events-scroll"
            style={{
              display: 'flex',
              gap: '18px',
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              paddingBottom: '10px',
              scrollbarWidth: 'none',
            }}
          >
            {events.map((ev) => (
              <div
                key={ev.title}
                data-ev-card
                onClick={() => setSelectedEvent(ev)}
                style={{
                  minWidth: '260px',
                  maxWidth: '260px',
                  flex: '0 0 auto',
                  scrollSnapAlign: 'start',

                  background: 'rgba(255,255,255,0.035)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '16px',
                  padding: '28px 24px',
                  backdropFilter: 'blur(16px)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{
                    background: `${ev.tagColor}22`,
                    border: `1px solid ${ev.tagColor}44`,
                    color: ev.tagColor,
                    fontSize: '10px',
                    padding: '4px 10px',
                    borderRadius: '100px',
                  }}>
                    {ev.tag}
                  </span>

                  <span style={{ fontSize: '11px', color: '#aaa' }}>
                    {ev.date}
                  </span>
                </div>
                <h3 style={{ color: '#fff' }}>{ev.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)' }}>{ev.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedEvent && (
        <div
          onClick={() => setSelectedEvent(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(4,8,15,0.85)',
            backdropFilter: 'blur(10px)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '40px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr',
              gap: '32px',
              maxWidth: '1000px',
              width: '100%',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '12px',
              padding: '32px'
            }}
          >
            <div>
              <h2 style={{ color: '#fff' }}>{selectedEvent.title}</h2>
              <p style={{ color: 'rgba(255,255,255,0.55)' }}>{selectedEvent.desc}</p>
              <p style={{ color: '#fff' }}>
                <strong>Objective:</strong> {selectedEvent.objective}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.45)' }}>
                {selectedEvent.participants} attendees
              </p>
            </div>

            <div style={{ display: 'grid', gap: '12px' }}>
              {selectedEvent.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  style={{
                    width: '100%',
                    height: '120px',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}