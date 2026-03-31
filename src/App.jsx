
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Overview from './pages/Overview'
import Alerts from './pages/Alerts'
import AlertDetail from './pages/AlertDetail'
import Tickets from './pages/Tickets'
import TicketDetail from './pages/TicketDetail'
import Incidents from './pages/Incidents'
import IncidentDetail from './pages/IncidentDetail'
import Escalations from './pages/Escalations'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/alerts/:id" element={<AlertDetail />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/tickets/:id" element={<TicketDetail />} />
          <Route path="/incidents" element={<Incidents />} />
          <Route path="/incidents/:id" element={<IncidentDetail />} />
          <Route path="/escalations" element={<Escalations />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
