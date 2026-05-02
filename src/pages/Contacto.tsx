import React, { useState } from 'react'

export default function Contacto() {
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [comentario, setComentario] = useState('')
  const [mensaje, setMensaje] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre || !correo || !comentario) {
      setMensaje('Por favor completa todos los campos')
      return
    }
    const envios = JSON.parse(localStorage.getItem('contactos') || '[]')
    envios.push({ nombre, correo, comentario, fecha: new Date().toISOString() })
    localStorage.setItem('contactos', JSON.stringify(envios))
    setMensaje('Mensaje enviado. Gracias!')
    setNombre('')
    setCorreo('')
    setComentario('')
  }

  return (
    <section className="main-article">
      <h1 className="main-title">Contacto</h1>
      <form className="form-contacto" onSubmit={handleSubmit} id="form-contacto">
        <label className="main-text">Nombre:</label>
        <input className="input-contacto" id="nombre" value={nombre} onChange={e => setNombre(e.target.value)} maxLength={100} required />

        <label className="main-text">Correo:</label>
        <input className="input-contacto" id="correo" type="email" value={correo} onChange={e => setCorreo(e.target.value)} maxLength={100} required />

        <label className="main-text">Comentario:</label>
        <textarea className="input-contacto" id="comentario" value={comentario} onChange={e => setComentario(e.target.value)} maxLength={500} required />

        <button type="submit" className="btn-custom">Enviar</button>
        <div className="mensaje-error">{mensaje}</div>
      </form>

      <div>
        <h2 className="section-title">Información de contacto</h2>
        <p className="main-text">Dirección: Av. Mascotas 123, Ciudad</p>
        <p className="main-text">Teléfono: +56 9 1234 5678</p>
        <p className="main-text">Email: contacto@veterinaria.cl</p>
      </div>
    </section>
  )
}
