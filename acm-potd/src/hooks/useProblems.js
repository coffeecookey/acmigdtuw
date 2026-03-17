import { useState, useEffect } from 'react'

export function useProblems() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    fetch('/data/problems.json')
      .then(r => { if (!r.ok) throw new Error('Failed to load problems'); return r.json() })
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  // Returns the active event, or the first one if none is flagged active
  const getActiveEvent = () =>
    data?.events.find(e => e.isActive) ?? data?.events[0] ?? null

  // Returns the phase currently running based on today's date
  const getActivePhase = (event) => {
    if (!event?.phases) return 'beginner'
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    for (const [phase, range] of Object.entries(event.phases)) {
      const start = new Date(range.startDate)
      const end   = new Date(range.endDate)
      end.setHours(23, 59, 59, 999)
      if (today >= start && today <= end) return phase
    }
    // Past all phases → return advanced (latest)
    return 'advanced'
  }

  const getEvent = (eventId) =>
    data?.events.find(e => e.id === eventId) ?? null

  // Returns problems for an event+phase, sorted newest first. Drafts are excluded.
  const getProblems = (eventId, phase) =>
    (data?.problems ?? [])
      .filter(p => p.eventId === eventId && p.phase === phase && p.status !== 'draft')
      .sort((a, b) => b.day - a.day)

  const getProblem = (eventId, phase, day) =>
    data?.problems.find(
      p => p.eventId === eventId && p.phase === phase && p.day === Number(day)
    ) ?? null

  return { data, loading, error, getActiveEvent, getActivePhase, getEvent, getProblems, getProblem }
}
