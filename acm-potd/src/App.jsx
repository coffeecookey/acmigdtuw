import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar       from './components/Navbar'
import Home         from './pages/Home'
import EventPhase   from './pages/EventPhase'
import ProblemDetail from './pages/ProblemDetail'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
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
