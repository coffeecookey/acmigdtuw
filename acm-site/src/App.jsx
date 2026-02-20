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
        subtext="We are one of IGDTUW's oldest tech clubs, dedicated to fostering a community of tech geeks like us!"
        ctaPrimary={{ label: 'POTD', href: '#join' }}
        ctaSecondary={{ label: 'Past Events', href: '#events' }}
      />
    </main>
  )
}
