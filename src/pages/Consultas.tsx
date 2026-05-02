import React, { useEffect, useState } from 'react'
import { getReportes, getZonasConIncidencia } from '../services/reportesService'
import type { ReporteMascota } from '../types/reportes'

export default function Consultas() {
  const [zonas, setZonas] = useState<Array<{ zona: string; total: number }>>([])
  const [reportes, setReportes] = useState<ReporteMascota[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      const [zonasData, reportesData] = await Promise.all([getZonasConIncidencia(), getReportes()])
      setZonas(zonasData)
      setReportes(reportesData)
      setIsLoading(false)
    }
    load()
  }, [])

  const totalPerdidas = reportes.filter(r => r.estado === 'perdida').length
  const totalEncontradas = reportes.filter(r => r.estado === 'encontrada').length

  return (
    <section className="main-article">
      <h1 className="main-title">Sistema de Geolocalizacion</h1>
      <p className="main-text">
        Vista consolidada de zonas con mayor incidencia para priorizar operativos de busqueda.
      </p>

      <div className="blogs-list">
        <article className="blog-card">
          <h2 className="section-title">Resumen de reportes</h2>
          <p className="main-text">Perdidas: <strong>{totalPerdidas}</strong></p>
          <p className="main-text">Encontradas: <strong>{totalEncontradas}</strong></p>
          <p className="main-text">Total: <strong>{reportes.length}</strong></p>
        </article>

        <article className="blog-card">
          <h2 className="section-title">Mapa (modo demo)</h2>
          <p className="main-text">
            En la entrega de backend, este bloque debe conectarse al microservicio de geolocalizacion
            y renderizar coordenadas reales sobre un mapa interactivo.
          </p>
        </article>
      </div>

      <div>
        <h2 className="section-title">Zonas con mayor incidencia</h2>
        {isLoading ? (
          <p className="main-text">Cargando incidencia por zonas...</p>
        ) : zonas.length === 0 ? (
          <p className="main-text">No hay reportes suficientes para calcular incidencia.</p>
        ) : (
          <ul id="listaConsultas">
            {zonas.map((zona, index) => (
              <li key={zona.zona} className="list-group-item">
                #{index + 1} {zona.zona}: <strong>{zona.total}</strong> reportes
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
