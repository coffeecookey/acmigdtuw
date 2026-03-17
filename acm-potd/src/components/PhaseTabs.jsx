import { useNavigate } from 'react-router-dom'

const PHASES = [
  { id: 'beginner',     label: 'Beginner'     },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced',     label: 'Advanced'     },
]

export default function PhaseTabs({ eventId, currentPhase, event }) {
  const navigate = useNavigate()

  const getPhaseStatus = (phaseId) => {
    if (!event?.phases?.[phaseId]) return null
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const start = new Date(event.phases[phaseId].startDate)
    const end   = new Date(event.phases[phaseId].endDate)
    end.setHours(23, 59, 59, 999)
    if (today < start) return 'upcoming'
    if (today > end)   return 'complete'
    return 'active'
  }

  return (
    <div style={{
      display: 'flex', gap: 6, flexWrap: 'wrap',
    }}>
      {PHASES.map(({ id, label }) => {
        const status = getPhaseStatus(id)
        const isActive = id === currentPhase
        return (
          <button
            key={id}
            className={`potd-tab${isActive ? ' active' : ''}`}
            onClick={() => navigate(`/event/${eventId}/${id}`)}
          >
            {label}
            {status === 'active' && (
              <span style={{
                display: 'inline-block', width: 5, height: 5, borderRadius: '50%',
                background: 'var(--c-teal-hi)', marginLeft: 6,
                boxShadow: '0 0 4px var(--c-teal-hi)',
                verticalAlign: 'middle',
              }} />
            )}
            {status === 'upcoming' && (
              <span style={{
                fontSize: 10, color: 'var(--c-muted)', marginLeft: 6,
                fontWeight: 400, verticalAlign: 'middle',
              }}>soon</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
