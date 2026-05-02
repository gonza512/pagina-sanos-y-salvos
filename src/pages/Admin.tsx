import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useAdminData } from '../hooks/useAdminData'
import AdminSidebar from '../components/admin/AdminSideBar'
import AdminDashboard from '../components/admin/AdminDashboard'
import UserManagement from '../components/admin/UserManagement'
import ProductManagement from '../components/admin/ProductManagement'
import ContactManagement from '../components/admin/ContactManagement'
import Statistics from '../components/admin/Statistics'
import { AdminSection } from '../types/admin'
import './Admin.css'

export default function Admin() {
  const { user } = useAuth()
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard')
  const adminData = useAdminData()

  if (adminData.loading) {
    return (
      <section className="main-article admin-article">
        <div className="loading-container">
          <p>Cargando panel de administración...</p>
        </div>
      </section>
    )
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <AdminDashboard estadisticas={adminData.estadisticas} usuarioActual={user} />
      
      case 'usuarios':
        return (
          <UserManagement
            usuarios={adminData.usuarios}
            onCambiarRol={adminData.cambiarRolUsuario}
            onEliminarUsuario={adminData.eliminarUsuario}
            usuarioActual={user}
          />
        )
      
      case 'productos':
        return (
          <ProductManagement
            productos={adminData.productos}
            onAgregarProducto={adminData.agregarProducto}
            onActualizarProducto={adminData.actualizarProducto}
            onEliminarProducto={adminData.eliminarProducto}
          />
        )
      
      case 'contactos':
        return (
          <ContactManagement
            contactos={adminData.contactos}
            onMarcarLeido={adminData.marcarContactoLeido}
            onEliminarContacto={adminData.eliminarContacto}
          />
        )
      
      case 'estadisticas':
        return (
          <Statistics
            estadisticas={adminData.estadisticas}
            usuarios={adminData.usuarios}
            productos={adminData.productos}
          />
        )
      
      default:
        return <AdminDashboard estadisticas={adminData.estadisticas} usuarioActual={user} />
    }
  }

  return (
    <section className="main-article admin-article">
      <div className="admin-container">
        <AdminSidebar 
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
        
        <section className="admin-main-panel">
          {renderSection()}
        </section>
      </div>
    </section>
  )
}