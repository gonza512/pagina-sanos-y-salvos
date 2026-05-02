import React, { useContext, useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom' 
import { AuthContext } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate() // Inicializa el hook de navegación
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Función de navegacion
  const handleNavigation = (path: string) => {
    navigate(path)
    setIsMenuOpen(false) //Cierra el menú
  }

  const handleLogout = () => {
    logout() // Ejecuta logout
    setIsMenuOpen(false) // Cierra menú
  }

  //Efecto para cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden' 
    } else {
      document.body.style.overflow = 'unset' 
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  return (
    <nav className="nav-bar" ref={menuRef}>
      <div className="nav-topbar">
        <span>Ayudemos a encontrar tu mascota</span>
        <span>contacto@sanosysalvos.cl</span>
      </div>

      <div className="nav-main">
        <button className="nav-brand" onClick={() => handleNavigation('/')}>
          <img src="/assets/img/logo-sanos-salvos.png" alt="Sanos y Salvos - Rescate de Mascotas" className="nav-brand-logo" />
          <span className="nav-logo">Sanos y Salvos</span>
        </button>

        <div className="nav-header">
          <button 
            className={`nav-menu-toggle ${isMenuOpen ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        <div className={`nav-menu ${isMenuOpen ? 'nav-menu-open' : ''}`}>
          <div className="nav-menu-content">
            <button onClick={() => handleNavigation('/')} className="nav-btn">Inicio</button>
            <button onClick={() => handleNavigation('/nosotros')} className="nav-btn">Quienes Somos</button>
            <button onClick={() => handleNavigation('/contacto')} className="nav-btn">Contactanos</button>

            {user && (
              <>
                <button onClick={() => handleNavigation('/mascotas')} className="nav-btn">Publica tu Mascota</button>
                <button onClick={() => handleNavigation('/buscar-mascotas')} className="nav-btn">Encontrar Mascota</button>
                <button onClick={() => handleNavigation('/consultas')} className="nav-btn">Mapa por Region</button>
                <button onClick={() => handleNavigation('/resenas')} className="nav-btn">Coincidencias</button>
                <button onClick={() => handleNavigation('/mi-cuenta')} className="nav-btn">Mi cuenta</button>
                {user.rol === 'admin' && (
                  <button onClick={() => handleNavigation('/admin')} className="nav-btn">Admin</button>
                )}
              </>
            )}
            
            <div className="nav-divider"></div>
            
            {!user ? (
              <>
                <button onClick={() => handleNavigation('/registro')} className="nav-btn nav-btn-secondary">Registrate</button>
                <button onClick={() => handleNavigation('/login')} className="nav-btn nav-btn-primary">Iniciar sesion</button>
              </>
            ) : (
              <button onClick={handleLogout} className="nav-btn nav-btn-logout">Cerrar sesion</button>
            )}
          </div>
        </div>
      </div>
      
      {isMenuOpen && <div className="nav-overlay" onClick={() => setIsMenuOpen(false)}></div>}
    </nav>
  )
}