import React from 'react'
import { AdminStats } from '../../types/admin'

interface AdminDashboardProps {
  estadisticas: AdminStats
  usuarioActual: any
}

export default function AdminDashboard({ estadisticas, usuarioActual }: AdminDashboardProps) {
  return (
    <div>
      <h1 className="admin-main-title">Dashboard de Administración</h1>
      <p className="welcome-message">Bienvenido, {usuarioActual?.nombre} 👋</p>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Usuarios</h3>
          <p className="stat-number">{estadisticas.totalUsuarios}</p>
        </div>
        <div className="stat-card">
          <h3>Administradores</h3>
          <p className="stat-number">{estadisticas.totalAdmins}</p>
        </div>
        <div className="stat-card">
          <h3>Productos</h3>
          <p className="stat-number">{estadisticas.totalProductos}</p>
        </div>
        <div className="stat-card">
          <h3>Mensajes Nuevos</h3>
          <p className="stat-number">{estadisticas.contactosNoLeidos}</p>
        </div>
      </div>

      <div className="alerts-section">
        {estadisticas.productosBajoStock > 0 && (
          <div className="alert alert-warning">
                {estadisticas.productosBajoStock} productos con stock bajo
          </div>
        )}
        {estadisticas.contactosNoLeidos > 0 && (
          <div className="alert alert-info">
            📧 Tienes {estadisticas.contactosNoLeidos} mensajes sin leer
          </div>
        )}
      </div>
    </div>
  )
}