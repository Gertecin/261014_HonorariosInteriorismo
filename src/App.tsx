import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import NuevoProyecto from './pages/NuevoProyecto'
import DetalleProyecto from './pages/DetalleProyecto'

function App() {
  return (
    <div className="min-h-screen bg-bianchi-white">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/nuevo" element={<NuevoProyecto />} />
        <Route path="/proyecto/:id" element={<DetalleProyecto />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
