import React, { useEffect, useState } from 'react'
import { getReportes } from '../services/reportesService'
import MapaMascotas from '../components/MapaMascotas'
import type { ReporteMascota } from '../types/reportes'

export default function BuscarMascotas() {
  const [reportesPerdidos, setReportesPerdidos] = useState<ReporteMascota[]>([])
  const [reportesEncontrados, setReportesEncontrados] = useState<ReporteMascota[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      const data = await getReportes()
      const mascotasPerdidas = data.filter(r => r.estado === 'perdida')
      const mascotasEncontradas = data.filter(r => r.estado === 'encontrada')
      setReportesPerdidos(mascotasPerdidas)
      setReportesEncontrados(mascotasEncontradas)
      setIsLoading(false)
    }

    load()
  }, [])

  const reportesConFoto = reportesPerdidos.filter(reporte => Boolean(reporte.fotoUrl)).length
  const reportesConUbicacion = reportesPerdidos.filter(reporte => Boolean(reporte.latitud && reporte.longitud)).length
  const reportesRecientes = reportesPerdidos.slice(0, 3)

  return (
    <section className="main-article main-article-wide search-page">
      <div className="search-page-hero">
        <div className="search-page-hero-text">
          <p className="search-page-eyebrow">Rescate y seguimiento</p>
          <h1 className="main-title search-page-title">Buscar Mascotas Perdidas</h1>
          <p className="main-text search-page-subtitle">
            Encuentra mascotas perdidas, revisa su ubicación en el mapa y contacta rápidamente a sus dueños.
          </p>
        </div>

        <div className="search-page-summary">
          <div className="search-page-summary-card">
            <span>No encontradas</span>
            <strong>{reportesPerdidos.length}</strong>
          </div>
          <div className="search-page-summary-card">
            <span>Encontradas</span>
            <strong>{reportesEncontrados.length}</strong>
          </div>
          <div className="search-page-summary-card">
            <span>Con foto</span>
            <strong>{reportesConFoto}</strong>
          </div>
          <div className="search-page-summary-card">
            <span>Con ubicación</span>
            <strong>{reportesConUbicacion}</strong>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="search-page-loading">
          <div className="search-page-loading-card">
            <div className="search-page-loading-dot" />
            <p className="main-text">Cargando mapa y reportes...</p>
          </div>
        </div>
      ) : (
        <MapaMascotas reportes={reportesPerdidos} />
      )}

      <div className="search-page-results">
        <div className="search-page-results-header">
          <h2 className="section-title">Mascotas perdidas encontradas</h2>
          <p className="main-text search-page-results-count">{reportesPerdidos.length} reportes activos</p>
        </div>

        {reportesPerdidos.length === 0 ? (
          <div className="search-page-empty-state">
            <p className="main-text">No hay mascotas perdidas registradas por ahora.</p>
            <span>Cuando existan reportes, aparecerán aquí y en el mapa.</span>
          </div>
        ) : (
          <div className="search-page-card-grid">
            {reportesPerdidos.map((reporte, index) => (
              <div
                key={reporte.id}
                className="mascota-card mascota-card-modern"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="mascota-card-media">
                  {reporte.fotoUrl ? (
                    <img
                      src={reporte.fotoUrl}
                      alt={reporte.nombreMascota}
                      className="mascota-card-image"
                    />
                  ) : (
                    <div className="mascota-card-placeholder">🐾</div>
                  )}
                  <div className="mascota-card-badge">PERDIDA</div>
                </div>

                <div className="mascota-card-body">
                  <h3 className="mascota-card-title">{reporte.nombreMascota}</h3>

                  <div className="mascota-card-details">
                    <div>
                      <span>Especie</span>
                      <strong>{reporte.especie.charAt(0).toUpperCase() + reporte.especie.slice(1)}</strong>
                    </div>
                    <div>
                      <span>Raza</span>
                      <strong>{reporte.raza}</strong>
                    </div>
                    <div>
                      <span>Color</span>
                      <strong>{reporte.color}</strong>
                    </div>
                    <div>
                      <span>Tamaño</span>
                      <strong>{reporte.tamano.charAt(0).toUpperCase() + reporte.tamano.slice(1)}</strong>
                    </div>
                  </div>

                  <div className="mascota-card-meta">
                    <p><strong>Zona:</strong> {reporte.zona}</p>
                    <p><strong>Fecha:</strong> {reporte.fechaReporte}</p>
                  </div>

                  {reporte.ultimaUbicacion && (
                    <div className="mascota-card-last-location">
                      <p>
                        <strong>Última ubicación:</strong>
                        {reporte.ultimaUbicacion}
                      </p>
                    </div>
                  )}

                  <div className="mascota-card-description">
                    <p>
                      <strong>Descripción:</strong>
                      {reporte.descripcion}
                    </p>
                  </div>

                  <div className="mascota-card-contact">
                    <p>{reporte.nombreContacto}</p>
                    <p>{reporte.telefonoContacto}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {reportesRecientes.length > 0 && (
          <div className="search-page-recent-strip">
            <p>Recientes</p>
            <div>
              {reportesRecientes.map(reporte => (
                <span key={reporte.id}>{reporte.nombreMascota}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}