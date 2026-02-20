import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import store             from './lib/store'
import Navbar            from './components/Navbar'
import Scene             from './components/3d/Scene'
import HeroSection       from './components/sections/HeroSection'
import AboutSection      from './components/sections/AboutSection'
import EventsSection     from './components/sections/EventsSection'
import ProjectsSection   from './components/sections/ProjectsSection'
import TeamSection       from './components/sections/TeamSection'
import CTASection        from './components/sections/CTASection'
import CustomCursor      from './components/ui/CustomCursor'
import ScrollProgress    from './components/ui/ScrollProgress'
import GameOverlay       from './components/ui/GameOverlay'

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  useEffect(() => {
    // Sync scroll progress → global store (read by R3F scene)
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      store.scroll.progress = max > 0 ? window.scrollY / max : 0
      store.scroll.y        = window.scrollY
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    // Sync mouse → global store (parallax in R3F)
    const onMouse = (e) => {
      store.mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2
      store.mouse.y = (e.clientY / window.innerHeight - 0.5) * -2
    }
    window.addEventListener('mousemove', onMouse, { passive: true })

    const onResize = () => ScrollTrigger.refresh()
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('scroll',    onScroll)
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('resize',    onResize)
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [])

  return (
    <div style={{ background: '#04080f', minHeight: '100vh', overflowX: 'hidden' }}>
      <CustomCursor />
      <ScrollProgress />
      <GameOverlay />
      <Navbar />

      {/* Fixed 3D universe — pointer-events: none inside Scene */}
      <Scene />

      {/* Scrollable HTML content on top */}
      <main style={{ position: 'relative', zIndex: 1 }}>
        <HeroSection     />
        <AboutSection    />
        <EventsSection   />
        <ProjectsSection />
        <TeamSection     />
        <CTASection      />
      </main>
    </div>
  )
}
