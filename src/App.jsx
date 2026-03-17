import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Ticket from './pages/Ticket'
import Monitor from './pages/Monitor'
import Login from './pages/Login'
import AdminLayout from './components/layout/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import Monitoring from './pages/admin/Monitoring'
import Devices from './pages/admin/Devices'
import Users from './pages/admin/Users'
import TicketDetail from './pages/admin/TicketDetail'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Ticket />} />
        <Route path="/monitor" element={<Monitor />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="monitoring" element={<Monitoring />} />
          <Route path="devices" element={<Devices />} />
          <Route path="users" element={<Users />} />
          <Route path="ticket/:id" element={<TicketDetail />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
