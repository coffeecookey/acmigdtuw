import { useParams, Link } from 'react-router-dom'
import { useProblems } from '../hooks/useProblems'
import ProblemCard from '../components/ProblemCard'

const PHASE_LABELS = {
  beginner:     'Beginner',
  intermediate: 'Intermediate',
  advanced:     'Advanced',
}

const CONTAINER = {
  maxWidth: 720,
  margin: '0 auto',
  padding: 'clamp(28px, 4vw, 48px) clamp(16px, 4vw, 32px) 80px',
}

export default function ProblemDetail() {
  const { eventId, phase, day } = useParams()
  const { data, loading, error, getEvent, getProblem } = useProblems()

  if (loading) return <div style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--c-muted)' }}>Loading…</div>
  if (error)   return <div style={{ padding: '80px 24px', textAlign: 'center', color: '#f87171' }}>{error}</div>
  if (!data)   return null

  const event   = getEvent(eventId)
  const problem = getProblem(eventId, phase, day)

  if (!problem) {
    return (
      <div style={{ ...CONTAINER, textAlign: 'center' }}>
        <p style={{ color: 'var(--c-muted)', marginBottom: 16 }}>Problem not found.</p>
        <Link to={`/event/${eventId}/${phase}`} style={{ color: 'var(--c-teal-hi)', textDecoration: 'none' }}>
          ← Back to {PHASE_LABELS[phase]} phase
        </Link>
      </div>
    )
  }

  return (
    <div style={CONTAINER}>

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <Link
          to={`/event/${eventId}/${phase}`}
          style={{
            fontSize: 13, color: 'var(--c-muted)',
            textDecoration: 'none', transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--c-muted)'}
        >
          ← {event?.name ?? eventId}
        </Link>
        <span style={{ color: 'var(--c-border)', fontSize: 13 }}>/</span>
        <span style={{ fontSize: 13, color: 'var(--c-muted)' }}>
          {PHASE_LABELS[phase]} Phase
        </span>
        <span style={{ color: 'var(--c-border)', fontSize: 13 }}>/</span>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
          Day {day}
        </span>
      </nav>

      {/* Problem card — full width, detail view */}
      <ProblemCard problem={problem} showPhase />

      {/* Navigation between days */}
      <DayNav eventId={eventId} phase={phase} day={Number(day)} data={data} />
    </div>
  )
}

function DayNav({ eventId, phase, day, data }) {
  const problems = (data?.problems ?? [])
    .filter(p => p.eventId === eventId && p.phase === phase)
    .sort((a, b) => a.day - b.day)

  const idx  = problems.findIndex(p => p.day === day)
  const prev = problems[idx - 1]
  const next = problems[idx + 1]

  if (!prev && !next) return null

  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      marginTop: 28, paddingTop: 24,
      borderTop: '1px solid var(--c-border)',
      gap: 12,
    }}>
      {prev ? (
        <Link
          to={`/event/${eventId}/${phase}/day/${prev.day}`}
          className="potd-btn-secondary"
        >
          ← Day {prev.day}
        </Link>
      ) : <span />}

      {next && (
        <Link
          to={`/event/${eventId}/${phase}/day/${next.day}`}
          className="potd-btn-secondary"
        >
          Day {next.day} →
        </Link>
      )}
    </div>
  )
}
