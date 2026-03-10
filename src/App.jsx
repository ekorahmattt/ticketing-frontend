import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Ticket from './pages/Ticket'
import Monitor from './pages/Monitor'
import Admin from './pages/Admin'
import Login from './pages/Login'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Ticket />} />
        <Route path="/monitor" element={<Monitor />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  )
}

export default App
