import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useProblems } from '../hooks/useProblems'
import EventSelector from '../components/EventSelector'
import ProblemList   from '../components/ProblemList'

const PHASES = [
  { id: 'beginner',     label: 'Beginner'     },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced',     label: 'Advanced'     },
]

const CONTAINER = {
  maxWidth: 760,
  margin: '0 auto',
  padding: 'clamp(28px, 4vw, 52px) clamp(16px, 4vw, 32px) 80px',
}

function getPhaseStatus(event, phaseId) {
  if (!event?.phases?.[phaseId]) return null
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const start = new Date(event.phases[phaseId].startDate)
  const end   = new Date(event.phases[phaseId].endDate); end.setHours(23, 59, 59, 999)
  if (today < start) return 'upcoming'
  if (today > end)   return 'complete'
  return 'active'
}

function formatDateRange(event, phaseId) {
  if (!event?.phases?.[phaseId]) return ''
  const { startDate, endDate } = event.phases[phaseId]
  const fmt = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${fmt(startDate)} – ${fmt(endDate)}`
}

export default function EventPhase() {
  const { eventId } = useParams()
  const { data, loading, error, getEvent, getProblems, getActivePhase } = useProblems()
  const [openPhases, setOpenPhases] = useState(null)

  if (loading) return <StatusMsg text="Loading…" />
  if (error)   return <StatusMsg text={error} isError />
  if (!data)   return null

  const event  = getEvent(eventId)
  const events = data.events

  if (!event) return <StatusMsg text={`Event "${eventId}" not found.`} isError />

  // Auto-open the currently active phase on first render
  const open = openPhases ?? new Set([getActivePhase(event)])

  const toggle = (phaseId) => {
    const next = new Set(open)
    next.has(phaseId) ? next.delete(phaseId) : next.add(phaseId)
    setOpenPhases(next)
  }

  return (
    <div style={CONTAINER}>

      {/* Page header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexWrap: 'wrap',
        gap: 12, marginBottom: 36,
      }}>
        <div>
          <h1 style={{
            fontSize: 'clamp(20px, 3vw, 26px)',
            fontWeight: 800, letterSpacing: '-0.03em', color: '#fff',
          }}>
            Problem of the Day
          </h1>
        </div>

        <EventSelector events={events} currentEventId={eventId} />
      </div>

      {/* Accordion — one section per phase */}
      {PHASES.every(({ id }) => getProblems(eventId, id).length === 0) && (
        <p style={{ fontSize: 13, color: 'var(--c-muted)', textAlign: 'center', padding: '48px 0' }}>
          Problems coming soon — check back daily once the event starts.
        </p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {PHASES.map(({ id, label }) => {
          const problems = getProblems(eventId, id)
          if (problems.length === 0) return null

          const isOpen = open.has(id)
          const range  = formatDateRange(event, id)

          return (
            <div
              key={id}
              className={`potd-accordion-section${isOpen ? ' open' : ''}`}
            >
              {/* Header — click to toggle */}
              <button
                className="potd-accordion-header"
                onClick={() => toggle(id)}
                aria-expanded={isOpen}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: 'clamp(14px, 2vw, 15px)',
                    fontWeight: 700, color: '#fff', letterSpacing: '-0.01em',
                  }}>
                    {label}
                  </span>
                  {range && (
                    <span style={{ fontSize: 11, color: 'var(--c-muted)', fontWeight: 400 }}>
                      {range}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  <span style={{
                    fontSize: 11, color: 'var(--c-muted)',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 6, padding: '3px 8px', whiteSpace: 'nowrap',
                  }}>
                    {problems.length} {problems.length === 1 ? 'problem' : 'problems'}
                  </span>

                  {/* Chevron */}
                  <svg
                    className={`potd-accordion-chevron${isOpen ? ' open' : ''}`}
                    width="16" height="16" viewBox="0 0 16 16" fill="none"
                    aria-hidden="true"
                  >
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </button>

              {/* Expandable body */}
              <div className={`potd-accordion-body${isOpen ? ' open' : ''}`}>
                <div>
                  <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    padding: '14px 18px 18px',
                  }}>
                    <ProblemList problems={problems} event={event} phase={id} />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    active:   { label: 'Active',   color: '#00c4e0', bg: 'rgba(0,196,224,0.1)',   border: 'rgba(0,196,224,0.22)',  dot: true  },
    complete: { label: 'Complete', color: '#4ade80', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.2)',  dot: false },
    upcoming: { label: 'Upcoming', color: '#5e7d8a', bg: 'rgba(94,125,138,0.1)',  border: 'rgba(94,125,138,0.22)', dot: false },
  }
  const s = map[status]
  if (!s) return null
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
      color: s.color, background: s.bg, border: `1px solid ${s.border}`,
      borderRadius: 6, padding: '3px 8px',
    }}>
      {s.dot && <span className="potd-live-dot" style={{ width: 4, height: 4 }} />}
      {s.label}
    </span>
  )
}

function StatusMsg({ text, isError }) {
  return (
    <div style={{
      padding: '80px 24px', textAlign: 'center',
      color: isError ? '#f87171' : 'var(--c-muted)', fontSize: 14,
    }}>
      {text}
    </div>
  )
}
