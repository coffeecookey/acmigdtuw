import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProblems } from '../hooks/useProblems'

export default function Home() {
  const { data, loading, error, getActiveEvent } = useProblems()
  const navigate = useNavigate()

  useEffect(() => {
    if (!data) return
    const event = getActiveEvent()
    if (!event) return
    navigate(`/event/${event.id}`, { replace: true })
  }, [data]) // eslint-disable-line react-hooks/exhaustive-deps

  if (error) return (
    <div style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--c-muted)' }}>
      Failed to load problems. Check <code>/data/problems.json</code>.
    </div>
  )

  return (
    <div style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--c-muted)' }}>
      {loading ? 'Loading…' : 'Redirecting…'}
    </div>
  )
}
