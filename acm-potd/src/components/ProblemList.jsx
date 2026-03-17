import ProblemCard from './ProblemCard'

export default function ProblemList({ problems, event, phase }) {
  if (problems.length === 0) {
    return <EmptyState event={event} phase={phase} />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {problems.map(problem => (
        <ProblemCard key={problem.id} problem={problem} />
      ))}
    </div>
  )
}

function EmptyState({ event, phase }) {
  const phaseLabel = phase.charAt(0).toUpperCase() + phase.slice(1)
  let message = `No ${phaseLabel} problems posted yet.`
  let sub     = 'Check back soon — problems are uploaded daily during the active phase.'

  if (event?.phases?.[phase]) {
    const start = new Date(event.phases[phase].startDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (start > today) {
      message = `${phaseLabel} phase starts ${start.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.`
      sub     = 'Complete the previous phase to prepare.'
    }
  }

  return (
    <div style={{
      padding: '48px 24px', textAlign: 'center',
      background: 'var(--c-surface)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 14,
    }}>
      <div style={{ fontSize: 28, marginBottom: 12, opacity: 0.4 }}>—</div>
      <p style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 8 }}>{message}</p>
      <p style={{ fontSize: 13, color: 'var(--c-muted)' }}>{sub}</p>
    </div>
  )
}
