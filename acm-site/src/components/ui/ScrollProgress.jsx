import { useEffect, useRef } from 'react'

export default function ScrollProgress() {
  const barRef = useRef()
  const dotRef = useRef()

  useEffect(() => {
    let raf
    let current = 0

    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const target = max > 0 ? window.scrollY / max : 0
      current += (target - current) * 0.1

      if (barRef.current) {
        barRef.current.style.transform = `scaleY(${current})`
      }
      if (dotRef.current) {
        // Move dot along the bar (2px margin from top, track height is ~80vh)
        const trackH = barRef.current?.parentElement?.offsetHeight ?? window.innerHeight * 0.8
        dotRef.current.style.transform = `translateY(${current * trackH}px)`
      }
      raf = requestAnimationFrame(update)
    }

    raf = requestAnimationFrame(update)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div style={{
      position: 'fixed', right: '24px', top: '50%',
      transform: 'translateY(-50%)',
      zIndex: 1000, display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: '0',
      height: '80px',
    }}>
      {/* Track */}
      <div style={{
        width: '1px', flex: 1,
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '1px', position: 'relative', overflow: 'visible',
      }}>
        {/* Fill */}
        <div
          ref={barRef}
          style={{
            position: 'absolute', top: 0, left: 0,
            width: '100%', height: '100%',
            background: 'linear-gradient(to bottom, #0082aa, #00d4ff)',
            transformOrigin: 'top center',
            transform: 'scaleY(0)',
            borderRadius: '1px',
          }}
        />
        {/* Dot */}
        <div
          ref={dotRef}
          style={{
            position: 'absolute', top: 0, left: '50%',
            transform: 'translate(-50%, 0)',
            width: '5px', height: '5px', borderRadius: '50%',
            background: '#00d4ff',
            boxShadow: '0 0 8px rgba(0,212,255,0.8)',
            marginLeft: '-2px',
          }}
        />
      </div>

      {/* Percentage label (hidden on small screens) */}
      <style>{`
        @media (max-width: 768px) { .scroll-progress-indicator { display: none !important; } }
      `}</style>
    </div>
  )
}
