import React, { useState } from 'react'
import { Usuario } from '../../types/admin'

interface UserManagementProps {
  usuarios: Usuario[]
  onCambiarRol: (id: string, rol: 'cliente' | 'admin') => void | Promise<void>
  onEliminarUsuario: (id: string) => void | Promise<void>
  usuarioActual: any
}

export default function UserManagement({ 
  usuarios, 
  onCambiarRol, 
  onEliminarUsuario, 
  usuarioActual 
}: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState('')
  
  const handleEliminarUsuario = async (usuario: Usuario) => {
    if (usuarioActual?.correo === usuario.correo) {
      alert('No puedes eliminar tu propia cuenta')
      return
    }
    
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return
    await onEliminarUsuario(usuario.id)
  }

  const filteredUsuarios = usuarios.filter(usuario =>
    usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.telefono.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <div className="section-header">
        <h1 className="admin-main-title">Gestión de Usuarios</h1>
        <p>Total: {usuarios.length} usuarios registrados</p>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Buscar por nombre, correo o teléfono..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {usuarios.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-icon">👥</p>
          <p className="empty-state-title">No hay usuarios registrados</p>
          <p className="empty-state-description">Los usuarios que se registren aparecerán aquí.</p>
        </div>
      ) : filteredUsuarios.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-icon">🔍</p>
          <p className="empty-state-title">Sin resultados</p>
          <p className="empty-state-description">Intenta con otro término de búsqueda.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Rol</th>
                <th>Fecha Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsuarios.map(usuario => (
              <tr key={usuario.id} className={usuarioActual?.correo === usuario.correo ? 'current-user' : ''}>
                <td>{usuario.nombre}</td>
                <td>{usuario.correo}</td>
                <td>{usuario.telefono || 'No especificado'}</td>
                <td>
                  <select
                    value={usuario.rol}
                    onChange={(e) => void onCambiarRol(usuario.id, e.target.value as 'cliente' | 'admin')}
                    disabled={usuarioActual?.correo === usuario.correo}
                    className="role-select"
                  >
                    <option value="cliente">Cliente</option>
                    <option value="admin">Administrador</option>
                  </select>
                </td>
                <td>{new Date(usuario.fechaRegistro).toLocaleDateString()}</td>
                <td>
                  <button
                    onClick={() => handleEliminarUsuario(usuario)}
                    disabled={usuarioActual?.correo === usuario.correo}
                    className="btn-danger"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}