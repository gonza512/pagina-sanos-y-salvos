import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useAlert } from '../context/AlertContext'
import { changePassword } from '../services/authService'
import {
  getReportes,
  marcarReporteComoEncontrada,
  marcarReporteComoPerdida,
} from '../services/reportesService'
import type { ReporteMascota } from '../types/reportes'

export default function MiCuenta() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { showAlert } = useAlert()

  const [actualContrasena, setActualContrasena] = useState('')
  const [nuevaContrasena, setNuevaContrasena] = useState('')
  const [confirmarContrasena, setConfirmarContrasena] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [misMascotas, setMisMascotas] = useState<ReporteMascota[]>([])
  const [isLoadingMascotas, setIsLoadingMascotas] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  useEffect(() => {
    const loadMisMascotas = async () => {
      if (!user) {
        setMisMascotas([])
        return
      }

      setIsLoadingMascotas(true)
      try {
        const data = await getReportes()
        const propios = data.filter(reporte => {
          if (user.id != null && reporte.createdByUserId != null) {
            return Number(reporte.createdByUserId) === Number(user.id)
          }
          const samePhone = !!user.telefono && user.telefono.trim() === String(reporte.telefonoContacto || '').trim()
          const sameName = user.nombre.trim().toLowerCase() === String(reporte.nombreContacto || '').trim().toLowerCase()
          return samePhone || sameName
        })
        setMisMascotas(propios)
      } finally {
        setIsLoadingMascotas(false)
      }
    }

    loadMisMascotas()
  }, [user])

  const marcarComoEncontrada = async (reporte: ReporteMascota) => {
    try {
      setUpdatingId(reporte.id)
      const updated = await marcarReporteComoEncontrada(reporte.id, {
        nombreContacto: reporte.nombreContacto,
        telefonoContacto: reporte.telefonoContacto,
      })

      setMisMascotas(prev => prev.map(r => (r.id === updated.id ? updated : r)))
      showAlert('La mascota fue marcada como encontrada.', 'success')
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'No fue posible actualizar el estado.'
      showAlert(msg, 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  const marcarComoPerdida = async (reporte: ReporteMascota) => {
    try {
      setUpdatingId(reporte.id)
      const updated = await marcarReporteComoPerdida(reporte.id, {
        nombreContacto: reporte.nombreContacto,
        telefonoContacto: reporte.telefonoContacto,
      })

      setMisMascotas(prev => prev.map(r => (r.id === updated.id ? updated : r)))
      showAlert('La mascota fue marcada como perdida.', 'success')
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'No fue posible actualizar el estado.'
      showAlert(msg, 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.correo) {
      showAlert('No se pudo identificar tu cuenta.', 'error')
      return
    }

    if (actualContrasena.trim().length < 4) {
      showAlert('Ingresa tu contrasena actual.', 'error')
      return
    }

    if (nuevaContrasena.length < 4 || nuevaContrasena.length > 128) {
      showAlert('La nueva contrasena debe tener entre 4 y 128 caracteres.', 'error')
      return
    }

    if (nuevaContrasena !== confirmarContrasena) {
      showAlert('La confirmacion no coincide con la nueva contrasena.', 'error')
      return
    }

    setIsSaving(true)
    try {
      const result = await changePassword({
        actualContrasena,
        nuevaContrasena,
      })

      if (!result.success) {
        showAlert(result.error || 'No se pudo cambiar la contrasena.', 'error')
        return
      }

      showAlert('Contrasena actualizada correctamente.', 'success')
      setActualContrasena('')
      setNuevaContrasena('')
      setConfirmarContrasena('')
    } catch {
      showAlert('Error de conexion al cambiar la contrasena.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="main-article">
      <h1 className="main-title">Mi cuenta</h1>
      <p className="main-text">Actualiza tu contraseña (validada contra el servicio IAM con tu sesión actual).</p>

      <form onSubmit={handleSubmit} className="form-contacto">
        <label htmlFor="actualContrasena" className="main-text">Contrasena actual</label>
        <input
          id="actualContrasena"
          className="input-contacto"
          type="password"
          value={actualContrasena}
          onChange={e => setActualContrasena(e.target.value)}
          required
        />

        <label htmlFor="nuevaContrasena" className="main-text">Nueva contrasena</label>
        <input
          id="nuevaContrasena"
          className="input-contacto"
          type="password"
          value={nuevaContrasena}
          onChange={e => setNuevaContrasena(e.target.value)}
          minLength={4}
          maxLength={128}
          required
        />

        <label htmlFor="confirmarContrasena" className="main-text">Confirmar nueva contrasena</label>
        <input
          id="confirmarContrasena"
          className="input-contacto"
          type="password"
          value={confirmarContrasena}
          onChange={e => setConfirmarContrasena(e.target.value)}
          minLength={4}
          maxLength={128}
          required
        />

        <button className="btn-custom" type="submit" disabled={isSaving}>
          {isSaving ? 'Guardando...' : 'Cambiar contrasena'}
        </button>
      </form>

      <div style={{ marginTop: '28px' }}>
        <h2 className="section-title">Mis mascotas reportadas</h2>
        {isLoadingMascotas ? (
          <p className="main-text">Cargando tus reportes...</p>
        ) : misMascotas.length === 0 ? (
          <p className="main-text">Aun no tienes mascotas reportadas con tu contacto.</p>
        ) : (
          <ul className="list-group" style={{ marginBottom: '20px' }}>
            {misMascotas.map(reporte => (
              <li key={`mi-${reporte.id}`} className="list-group-item">
                <strong>{reporte.nombreMascota}</strong> - Estado: {reporte.estado}
                <br />
                Zona: {reporte.zona} | Fecha: {reporte.fechaReporte}
                {reporte.estado === 'perdida' ? (
                  <>
                    <br />
                    <button
                      type="button"
                      className="btn-custom"
                      onClick={() => marcarComoEncontrada(reporte)}
                      disabled={updatingId === reporte.id}
                      style={{ marginTop: '8px' }}
                    >
                      {updatingId === reporte.id ? 'Actualizando...' : 'Marcar como encontrada'}
                    </button>
                  </>
                ) : (
                  <>
                    <br />
                    <button
                      type="button"
                      className="btn-custom"
                      onClick={() => marcarComoPerdida(reporte)}
                      disabled={updatingId === reporte.id}
                      style={{ marginTop: '8px', backgroundColor: '#666' }}
                    >
                      {updatingId === reporte.id ? 'Actualizando...' : 'Marcar como perdida'}
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
