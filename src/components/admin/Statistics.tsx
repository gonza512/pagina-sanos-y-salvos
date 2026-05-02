import React from 'react'
import { AdminStats, Usuario, Producto } from '../../types/admin'

interface StatisticsProps {
  estadisticas: AdminStats
  usuarios: Usuario[]
  productos: Producto[]
}

export default function Statistics({ estadisticas, usuarios, productos }: StatisticsProps) {
  const productosPorCategoria = productos.reduce((acc, producto) => {
    acc[producto.categoria] = (acc[producto.categoria] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const usuariosRecientes = usuarios
    .sort((a, b) => new Date(b.fechaRegistro).getTime() - new Date(a.fechaRegistro).getTime())
    .slice(0, 5)

  return (
    <div>
      <h1 className="admin-main-title">Estadísticas del Sistema</h1>
      
      <div className="stats-grid detailed">
        <div className="stat-card large">
          <h3>Resumen General</h3>
          <div className="stat-details">
            <p>👥 Usuarios totales: <strong>{estadisticas.totalUsuarios}</strong></p>
            <p>👑 Administradores: <strong>{estadisticas.totalAdmins}</strong></p>
            <p>🛍️ Productos activos: <strong>{estadisticas.totalProductos}</strong></p>
            <p>📧 Mensajes recibidos: <strong>{estadisticas.totalContactos}</strong></p>
          </div>
        </div>

        <div className="stat-card large">
          <h3>Productos por Categoría</h3>
          <div className="stat-details">
            {Object.entries(productosPorCategoria).map(([categoria, cantidad]) => (
              <p key={categoria}>
                {categoria.charAt(0).toUpperCase() + categoria.slice(1)}: <strong>{cantidad}</strong>
              </p>
            ))}
          </div>
        </div>

        <div className="stat-card large">
          <h3>Alertas del Sistema</h3>
          <div className="stat-details">
            {estadisticas.productosBajoStock > 0 && (
              <p className="alert-item">⚠️ {estadisticas.productosBajoStock} productos con stock bajo</p>
            )}
            {estadisticas.contactosNoLeidos > 0 && (
              <p className="alert-item">📧 {estadisticas.contactosNoLeidos} mensajes sin leer</p>
            )}
            {estadisticas.productosBajoStock === 0 && estadisticas.contactosNoLeidos === 0 && (
              <p>✅ Todo en orden</p>
            )}
          </div>
        </div>
      </div>

      <div className="stats-grid detailed" style={{ marginTop: '2rem' }}>
        <div className="stat-card large">
          <h3>Últimos Usuarios Registrados</h3>
          <div className="stat-details">
            {usuariosRecientes.length === 0 ? (
              <p>No hay usuarios registrados</p>
            ) : (
              usuariosRecientes.map(usuario => (
                <p key={usuario.id}>
                  <strong>{usuario.nombre}</strong> ({usuario.correo}) - {new Date(usuario.fechaRegistro).toLocaleDateString()}
                </p>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}