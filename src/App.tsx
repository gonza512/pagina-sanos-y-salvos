import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Admin from './pages/Admin'
import Nosotros from './pages/Nosotros'
import Blogs from './pages/Blogs'
import Blog1 from './pages/Blog1'
import Blog2 from './pages/Blog2'
import Contacto from './pages/Contacto'
import Mascotas from './pages/Mascotas'
import Consultas from './pages/Consultas'
import BuscarMascotas from './pages/BuscarMascotas'
import Resenas from './pages/Resenas'
import Login from './pages/Login'
import Registro from './pages/Registro'
import MiCuenta from './pages/MiCuenta'
import Navbar from './components/Navbar'
import { AuthProvider } from './context/AuthContext'
import { AlertProvider } from './context/AlertContext'
import PopupAlert from './components/PopupAlert'
import ProtectedRoute from './components/ProtectedRoute'
import { useDefaultAdmin } from './hooks/useDefaultAdmin'

// Componente para inicializar el admin por defecto
function AppInitializer() {
  useDefaultAdmin()
  return null
}

export default function App() {
  return (
    <AlertProvider>
      <AuthProvider>
        <AppInitializer />
        <div className="app-container">
          <header className="app-header">
            <Navbar />
          </header>

          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/nosotros" element={<Nosotros />} />
              <Route path="/blogs" element={<Blogs />} />
              <Route path="/blogs/1" element={<Blog1 />} />
              <Route path="/blogs/2" element={<Blog2 />} />
              <Route path="/contacto" element={<Contacto />} />
              <Route path="/mascotas" element={<Mascotas />} />
              <Route path="/consultas" element={<Consultas />} />
              <Route path="/buscar-mascotas" element={<BuscarMascotas />} />
              <Route path="/resenas" element={<Resenas />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Registro />} />
              <Route path="/mi-cuenta" element={<MiCuenta />} />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute> 
                    <Admin /> 
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>

          <footer>
            <p>&copy; 2026 Sanos y Salvos. Plataforma para la recuperacion de mascotas perdidas.</p>
          </footer>
        </div>
        <PopupAlert />
      </AuthProvider>
    </AlertProvider>
  )
}