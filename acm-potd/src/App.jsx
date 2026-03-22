import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar       from './components/Navbar'
import Home         from './pages/Home'
import EventPhase   from './pages/EventPhase'
import ProblemDetail from './pages/ProblemDetail'
import { Analytics } from "@vercel/analytics/next"

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Analytics />
      <main>
        <Routes>
          <Route path="/"                                    element={<Home />} />
          <Route path="/event/:eventId"                      element={<EventPhase />} />
          <Route path="/event/:eventId/day/:day"             element={<ProblemDetail />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
