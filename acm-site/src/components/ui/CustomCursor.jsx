import { useEffect, useRef } from 'react'
import store from '../../lib/store'

export default function CustomCursor() {
  const dotRef   = useRef()
  const ringRef  = useRef()

  useEffect(() => {
    // Hide on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return

    document.body.style.cursor = 'none'

    let rx = 0, ry = 0
    let mx = 0, my = 0
    let isHovering = false
    let raf

    const onMove = (e) => {
      mx = e.clientX
      my = e.clientY
      store.mouse.raw.x = mx
      store.mouse.raw.y = my
      store.mouse.x = (mx / window.innerWidth  - 0.5) * 2
      store.mouse.y = (my / window.innerHeight - 0.5) * -2

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mx - 4}px, ${my - 4}px)`
      }
    }

    const onEnter = () => { isHovering = true  }
    const onLeave = () => { isHovering = false }

    const interactiveSelector = 'a, button, [role="button"], input, label, select, textarea, [data-hover]'
    document.querySelectorAll(interactiveSelector).forEach(el => {
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
    })

    const animate = () => {
      rx += (mx - rx) * 0.09
      ry += (my - ry) * 0.09

      if (ringRef.current) {
        const scale = isHovering ? 1.8 : 1
        ringRef.current.style.transform = `translate(${rx - 20}px, ${ry - 20}px) scale(${scale})`
        ringRef.current.style.borderColor = isHovering
          ? 'rgba(0,212,255,0.9)'
          : 'rgba(0,212,255,0.45)'
      }
      raf = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    raf = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
      document.body.style.cursor = ''
    }
  }, [])

  return (
    <>
      {/* Dot — instant */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed', width: '8px', height: '8px',
          borderRadius: '50%', background: '#00d4ff',
          pointerEvents: 'none', zIndex: 99999,
          willChange: 'transform', mixBlendMode: 'screen',
          boxShadow: '0 0 12px rgba(0,212,255,0.8)',
          top: 0, left: 0,
        }}
      />
      {/* Ring — lagged */}
      <div
        ref={ringRef}
        style={{
          position: 'fixed', width: '40px', height: '40px',
          borderRadius: '50%', border: '1.5px solid rgba(0,212,255,0.45)',
          pointerEvents: 'none', zIndex: 99998,
          willChange: 'transform', top: 0, left: 0,
          transition: 'border-color 0.3s ease, transform 0.3s ease',
        }}
      />
    </>
  )
}
