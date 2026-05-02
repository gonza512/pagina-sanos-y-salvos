import React, { useState, useEffect, useRef } from 'react'
import { useAlert } from '../context/AlertContext'
import {
  getReportes,
  saveReporte,
} from '../services/reportesService'
import { useAuth } from '../context/AuthContext'
import type { EstadoReporte, ReporteMascota, TamanoMascota } from '../types/reportes'
import { CENTROS_REGION_CHILE, REGIONES_CHILE } from '../config/ubicacionChile'
import UbicacionExactaMap from '../components/UbicacionExactaMap'

type CoordenadasExactas = {
  lat: number
  lng: number
}

export default function Mascotas() {
  const { showAlert } = useAlert()
  const { user } = useAuth()
  const [reportes, setReportes] = useState<ReporteMascota[]>([])
  const [estado, setEstado] = useState<EstadoReporte>('perdida')
  const [nombreMascota, setNombreMascota] = useState('')
  const [especie, setEspecie] = useState('perro')
  const [raza, setRaza] = useState('')
  const [color, setColor] = useState('')
  const [tamano, setTamano] = useState<TamanoMascota>('mediano')
  const [region, setRegion] = useState('')
  const [comuna, setComuna] = useState('')
  const [zona, setZona] = useState('')
  const [ultimaUbicacion, setUltimaUbicacion] = useState('')
  const [ubicacionExacta, setUbicacionExacta] = useState<CoordenadasExactas | null>(null)
  const [fechaReporte, setFechaReporte] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [nombreContacto, setNombreContacto] = useState('')
  const [telefonoContacto, setTelefonoContacto] = useState('')
  const [fotoUrl, setFotoUrl] = useState('')
  const [fotoPreview, setFotoPreview] = useState('')
  const [fotoNombre, setFotoNombre] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const fotoInputRef = useRef<HTMLInputElement | null>(null)
  const todayISO = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .split('T')[0]

  const handleFotoCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showAlert('Selecciona una imagen valida.', 'error')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      setFotoPreview(result)
      setFotoNombre(file.name)
      setFotoUrl(result)
    }
    reader.readAsDataURL(file)
  }

  const handleEliminarFoto = () => {
    setFotoUrl('')
    setFotoPreview('')
    setFotoNombre('')
    if (fotoInputRef.current) {
      fotoInputRef.current.value = ''
    }
  }

  useEffect(() => {
    if (!user) return
    setNombreContacto(prev => prev || user.nombre || '')
    setTelefonoContacto(prev => prev || user.telefono || '')
  }, [user])

  useEffect(() => {
    if (estado !== 'perdida') {
      setUbicacionExacta(null)
    }
  }, [estado])

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      const data = await getReportes()
      setReportes(data)
      setIsLoading(false)
    }
    load()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nombreMascota || !raza || !color || !zona || !fechaReporte || !descripcion || !nombreContacto || !telefonoContacto) {
      showAlert('Completa todos los campos obligatorios del reporte.', 'error')
      return
    }

    if (!region || !comuna) {
      showAlert('Debes seleccionar región y comuna.', 'error')
      return
    }

    if (estado === 'perdida' && !ultimaUbicacion.trim()) {
      showAlert('En reportes de perdida debes indicar la ultima ubicacion vista.', 'error')
      return
    }

    if (estado === 'perdida' && !ubicacionExacta) {
      showAlert('En reportes de perdida debes marcar la ubicacion exacta en el mapa.', 'error')
      return
    }

    if (fechaReporte > todayISO) {
      showAlert('La fecha del reporte no puede ser futura.', 'error')
      return
    }

    try {
      setIsLoading(true)
      const centroRegion = CENTROS_REGION_CHILE[region]
      const latitudFinal = centroRegion?.lat
      const longitudFinal = centroRegion?.lng
      const latitudReporte = estado === 'perdida' ? ubicacionExacta?.lat ?? latitudFinal : latitudFinal
      const longitudReporte = estado === 'perdida' ? ubicacionExacta?.lng ?? longitudFinal : longitudFinal

      const next = saveReporte({
        nombreMascota: nombreMascota.trim(),
        estado,
        especie,
        raza: raza.trim(),
        color: color.trim(),
        tamano,
        zona: comuna.trim(),
        ultimaUbicacion: ultimaUbicacion.trim() || undefined,
        latitud: latitudReporte,
        longitud: longitudReporte,
        fechaReporte,
        descripcion: descripcion.trim(),
        nombreContacto: nombreContacto.trim(),
        telefonoContacto: telefonoContacto.trim(),
        fotoUrl: fotoUrl.trim() || undefined,
      })

      const created = await next
      setReportes(prev => [created, ...prev])
      showAlert('Reporte registrado correctamente.', 'success')
      setNombreMascota('')
      setRaza('')
      setColor('')
      setRegion('')
      setComuna('')
      setZona('')
      setUltimaUbicacion('')
      setUbicacionExacta(null)
      setFechaReporte('')
      setDescripcion('')
      setNombreContacto('')
      setTelefonoContacto('')
      setFotoUrl('')
      setFotoPreview('')
      setFotoNombre('')
    } catch {
      showAlert('No fue posible guardar el reporte.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="main-article">
      <h1 className="main-title">Gestion de Mascotas Perdidas y Encontradas</h1>
      <p className="main-text">
        Registra reportes estructurados para alimentar el sistema de geolocalizacion y el motor de coincidencias.
      </p>
      <form id="formMascota" onSubmit={handleSubmit} className="form-contacto">
        <label className="main-text">Tipo de reporte</label>
        <select className="input-contacto" value={estado} onChange={e => setEstado(e.target.value as EstadoReporte)}>
          <option value="perdida">Mascota perdida</option>
          <option value="encontrada">Mascota encontrada</option>
        </select>

        <label className="main-text">Nombre de la mascota</label>
        <input className="input-contacto" value={nombreMascota} onChange={e => setNombreMascota(e.target.value)} placeholder="Ej: Max, Luna, Firulais" required />

        <label className="main-text">Foto de la mascota (camara o galeria)</label>
        <input
          ref={fotoInputRef}
          className="input-contacto"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFotoCapture}
        />

        {fotoPreview && (
          <div>
            <p className="main-text">Vista previa de la foto capturada</p>
            <img src={fotoPreview} alt="Foto capturada de mascota" className="blog-card-img" style={{ maxWidth: '360px' }} />
            <p className="main-text">Archivo: {fotoNombre}</p>
            <button type="button" className="btn-custom" onClick={handleEliminarFoto}>
              Eliminar foto
            </button>
          </div>
        )}

        <label className="main-text">Especie</label>
        <select className="input-contacto" value={especie} onChange={e => setEspecie(e.target.value)}>
          <option value="perro">Perro</option>
          <option value="gato">Gato</option>
          <option value="otro">Otro</option>
        </select>

        <label className="main-text">Raza</label>
        <input className="input-contacto" value={raza} onChange={e => setRaza(e.target.value)} required />

        <label className="main-text">Color principal</label>
        <input className="input-contacto" value={color} onChange={e => setColor(e.target.value)} required />

        <label className="main-text">Tamano</label>
        <select className="input-contacto" value={tamano} onChange={e => setTamano(e.target.value as TamanoMascota)}>
          <option value="pequeno">Pequeno</option>
          <option value="mediano">Mediano</option>
          <option value="grande">Grande</option>
        </select>

        <label className="main-text">Region</label>
        <select
          className="input-contacto"
          value={region}
          onChange={e => {
            setRegion(e.target.value)
            setComuna('')
            setZona('')
          }}
          required
        >
          <option value="">-- Selecciona una region --</option>
          {Object.keys(REGIONES_CHILE).map(nombreRegion => (
            <option key={nombreRegion} value={nombreRegion}>
              {nombreRegion}
            </option>
          ))}
        </select>

        <label className="main-text">Comuna</label>
        <select
          className="input-contacto"
          value={comuna}
          onChange={e => {
            setComuna(e.target.value)
            setZona(e.target.value)
          }}
          disabled={!region}
          required
        >
          <option value="">-- Selecciona una comuna --</option>
          {(REGIONES_CHILE[region] || []).map(nombreComuna => (
            <option key={nombreComuna} value={nombreComuna}>
              {nombreComuna}
            </option>
          ))}
        </select>

        <p className="main-text" style={{ fontSize: '0.9em', color: '#666', margin: '5px 0 15px 0' }}>
          El mapa ubicara la mascota usando la region y comuna seleccionadas.
        </p>

        {estado === 'perdida' && (
          <div>
            <h3 className="section-title">Agregar ultima ubicacion</h3>
            <p className="main-text">Indica el ultimo lugar exacto donde el dueno vio a su mascota.</p>
            <label className="main-text">Ultima ubicacion vista por el dueno</label>
            <input
              className="input-contacto"
              value={ultimaUbicacion}
              onChange={e => setUltimaUbicacion(e.target.value)}
              placeholder="Ej: Plaza de Maipu, Av. Pajaritos con 5 de Abril"
              required
            />

            <UbicacionExactaMap
              region={region}
              comuna={comuna}
              value={ubicacionExacta}
              onChange={setUbicacionExacta}
            />
          </div>
        )}

        <label className="main-text">Fecha del reporte</label>
        <input
          className="input-contacto"
          type="date"
          value={fechaReporte}
          max={todayISO}
          onChange={e => setFechaReporte(e.target.value)}
          required
        />

        <label className="main-text">Descripción de la mascota</label>
        <textarea className="input-contacto" value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Describe a la mascota: características físicas, señas particulares, collar, comportamiento, etc." required />

        <label className="main-text">Nombre de contacto</label>
        <input className="input-contacto" value={nombreContacto} onChange={e => setNombreContacto(e.target.value)} required />

        <label className="main-text">Telefono de contacto</label>
        <input className="input-contacto" value={telefonoContacto} onChange={e => setTelefonoContacto(e.target.value)} required />

        <button type="submit" className="btn-custom" disabled={isLoading}>
          {isLoading ? 'Guardando...' : 'Registrar reporte'}
        </button>
      </form>

      <div>
        <h2 className="section-title">Reportes recientes</h2>
        {isLoading && reportes.length === 0 ? (
          <p className="main-text">Cargando reportes...</p>
        ) : reportes.length === 0 ? (
          <p className="main-text">Aun no existen reportes registrados.</p>
        ) : (
          <ul id="listaMascotas">
            {reportes.map(reporte => (
              <li key={reporte.id} className="list-group-item">
                <strong>{reporte.estado === 'perdida' ? 'PERDIDA' : 'ENCONTRADA'}</strong> - {reporte.nombreMascota} ({reporte.especie}, {reporte.raza}, {reporte.color})
                <br />
                Zona: {reporte.zona} | Fecha: {reporte.fechaReporte} | Contacto: {reporte.nombreContacto} ({reporte.telefonoContacto})
                {reporte.estado === 'perdida' && reporte.ultimaUbicacion && (
                  <>
                    <br />
                    Ultima ubicacion: {reporte.ultimaUbicacion}
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
