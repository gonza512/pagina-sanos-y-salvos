import React from 'react'
import { Contacto } from '../../types/admin'

interface ContactManagementProps {
  contactos: Contacto[]
  onMarcarLeido: (id: string) => void
  onEliminarContacto: (id: string) => void
}

export default function ContactManagement({ 
  contactos, 
  onMarcarLeido, 
  onEliminarContacto 
}: ContactManagementProps) {
  
  const handleEliminarContacto = (contacto: Contacto) => {
    if (!confirm('¿Estás seguro de eliminar este mensaje?')) return
    onEliminarContacto(contacto.id)
  }

  return (
    <div>
      <div className="section-header">
        <h1 className="admin-main-title">Mensajes de Contacto</h1>
        <p>
          {contactos.filter(c => !c.leido).length} mensajes sin leer de {contactos.length} total
        </p>
      </div>

      <div className="contactos-list">
        {contactos.length === 0 ? (
          <p className="no-data">No hay mensajes de contacto</p>
        ) : (
          contactos.map(contacto => (
            <div key={contacto.id} className={`contacto-card ${!contacto.leido ? 'unread' : ''}`}>
              <div className="contacto-header">
                <h3>{contacto.nombre}</h3>
                <span className="contacto-date">
                  {new Date(contacto.fecha).toLocaleDateString()}
                </span>
              </div>
              <p className="contacto-email">{contacto.correo}</p>
              <p className="contacto-message">{contacto.comentario}</p>
              <div className="contacto-actions">
                {!contacto.leido && (
                  <button 
                    onClick={() => onMarcarLeido(contacto.id)}
                    className="btn-secondary"
                  >
                    Marcar como leído
                  </button>
                )}
                <button 
                  onClick={() => handleEliminarContacto(contacto)}
                  className="btn-danger"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}