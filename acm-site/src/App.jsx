import Navbar from './components/Navbar'
import PixelGridHero from './components/PixelGridHero'

export default function App() {
  return (
    <main>
      <Navbar />
      <PixelGridHero
        imageSrc="/acm-logo.svg"
        imageAlt="ACM logo"
        zoneSize={300}
        // {eyebrow=""}
        headline={<>Build the <span className="pgx-grad">Future</span><br />of Computing</>}
        subtext="Join a community of makers, builders, and thinkers. Explore cutting-edge projects, workshops, and events that push the boundaries of CS."
        ctaPrimary={{ label: 'Join ACM →', href: '#join' }}
        ctaSecondary={{ label: 'Explore Events', href: '#events' }}
      />
    </main>
  )
}
