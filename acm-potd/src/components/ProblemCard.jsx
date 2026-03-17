import { Link } from 'react-router-dom'

const PHASE_COLORS = {
  beginner:     { text: '#4ade80', bg: 'rgba(74,222,128,0.08)',  border: 'rgba(74,222,128,0.18)'  },
  intermediate: { text: '#00c4e0', bg: 'rgba(0,196,224,0.08)',   border: 'rgba(0,196,224,0.18)'   },
  advanced:     { text: '#f97316', bg: 'rgba(249,115,22,0.08)',   border: 'rgba(249,115,22,0.18)'  },
}

function isToday(dateStr) {
  const d = new Date(dateStr)
  const t = new Date()
  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth()    === t.getMonth()    &&
    d.getDate()     === t.getDate()
  )
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export default function ProblemCard({ problem, showPhase = false }) {
  const { eventId, phase, day, date, title, problemLink, solutionLink } = problem
  const today    = isToday(date)
  const colors   = PHASE_COLORS[phase] ?? PHASE_COLORS.beginner

  return (
    <article className={`potd-card${today ? ' today' : ''} potd-fade-up`}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>

        {/* Left meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {today && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--c-teal-hi)',
              background: 'rgba(0,196,224,0.1)',
              border: '1px solid rgba(0,196,224,0.25)',
              borderRadius: 6, padding: '3px 8px',
            }}>
              <span className="potd-live-dot" style={{ width: 4, height: 4 }} />
              Today
            </span>
          )}

          {showPhase && (
            <span style={{
              fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: colors.text,
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              borderRadius: 6, padding: '3px 8px',
            }}>
              {phase}
            </span>
          )}

          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-teal)' }}>
            Day {day}
          </span>
        </div>

        {/* Date + detail link */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <span style={{ fontSize: 12, color: 'var(--c-muted)', whiteSpace: 'nowrap' }}>
            {formatDate(date)}
          </span>
          <Link
            to={`/event/${eventId}/${phase}/day/${day}`}
            style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.2)'}
            aria-label={`Detail view for ${title}`}
          >
            ↗
          </Link>
        </div>
      </div>

      {/* Title */}
      <h2 style={{
        fontSize: 'clamp(15px, 2vw, 17px)',
        fontWeight: 700, color: '#fff',
        letterSpacing: '-0.02em', marginBottom: 18,
        lineHeight: 1.3,
      }}>
        {title}
      </h2>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <a
          href={problemLink}
          target="_blank"
          rel="noopener noreferrer"
          className="potd-btn-primary"
          aria-label={`Solve Problem: ${title}`}
        >
          Solve Problem →
        </a>
        <a
          href={solutionLink}
          target="_blank"
          rel="noopener noreferrer"
          className="potd-btn-secondary"
          aria-label={`View Solution: ${title}`}
        >
          View Solution ↗
        </a>
      </div>
    </article>
  )
}
