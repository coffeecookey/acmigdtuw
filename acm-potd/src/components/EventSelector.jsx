import { useNavigate } from 'react-router-dom'

export default function EventSelector({ events, currentEventId }) {
  const navigate = useNavigate()

  const handleChange = (e) => {
    navigate(`/event/${e.target.value}`)
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <select
        className="potd-select"
        value={currentEventId}
        onChange={handleChange}
        aria-label="Select event"
        style={{ paddingRight: 36 }}
      >
        {events.map(ev => (
          <option key={ev.id} value={ev.id}>
            {ev.name}{ev.isActive ? ' · Active' : ''}
          </option>
        ))}
      </select>
      {/* Chevron */}
      <span style={{
        position: 'absolute', right: 12, top: '50%',
        transform: 'translateY(-50%)',
        pointerEvents: 'none',
        color: 'var(--c-muted)', fontSize: 10,
      }}>▼</span>
    </div>
  )
}
