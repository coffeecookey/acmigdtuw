import Navbar from './components/Navbar'
import PixelGridHero from './components/PixelGridHero'
import React from 'react'

export default function App() {
  return (
    <main>
      <Navbar />
      <PixelGridHero
        imageSrc="/acm-logo.svg"
        imageAlt="ACM logo"
        zoneSize={300}
        headline={<>Welcome to <span className="pgx-grad">ACM IGDTUW</span><br /></>}
        subtext="xxx"
        ctaPrimary={{ label: 'POTD →', href: '#join' }}
        ctaSecondary={{ label: 'Past Events', href: '#events' }}
      />
    </main>
  )
}
