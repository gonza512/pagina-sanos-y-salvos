import React from 'react'
import { AdminSection } from '../../types/admin'

interface AdminSidebarProps {
  activeSection: AdminSection
  onSectionChange: (section: AdminSection) => void
}

const menuItems: { key: AdminSection; label: string; icon: string }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: '📊' },
  { key: 'usuarios', label: 'Gestión de Usuarios', icon: '👥' },
  { key: 'productos', label: 'Gestión de Productos', icon: '🛍️' },
  { key: 'contactos', label: 'Mensajes de Contacto', icon: '📧' },
  { key: 'estadisticas', label: 'Estadísticas', icon: '📈' }
]

export default function AdminSidebar({ activeSection, onSectionChange }: AdminSidebarProps) {
  return (
    <aside className="admin-sidebar">
      <h2 className="admin-menu-title">Panel de Administración</h2>
      <ul className="admin-menu-list">
        {menuItems.map(item => (
          <li key={item.key} className={`admin-menu-item ${activeSection === item.key ? 'active' : ''}`}>
            <button 
              onClick={() => onSectionChange(item.key)} 
              className="admin-menu-link"
            >
              {item.icon} {item.label}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}