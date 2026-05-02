import React, { useEffect, useState } from 'react'
import { getMascotasCercanasLineales } from '../services/reportesService'
import type { MascotaCercanaLinea } from '../types/reportes'

export default function Resenas() {
  const [mascotasCercanas, setMascotasCercanas] = useState<MascotaCercanaLinea[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      const data = await getMascotasCercanasLineales()
      setMascotasCercanas(data)
      setIsLoading(false)
    }
    load()
  }, [])

  return (
    <section className="main-article">
      <h1 className="main-title">Mascotas Más Cercanas</h1>
      <p className="main-text">
        La lista muestra una mascota por tarjeta, ordenada desde la más cercana hasta la más lejana respecto al reporte perdido más próximo.
      </p>

      <div>
        <h2 className="section-title">Ranking de mascotas cercanas</h2>
        {isLoading ? (
          <p className="main-text">Buscando mascotas cercanas...</p>
        ) : mascotasCercanas.length === 0 ? (
          <p className="main-text">No hay mascotas con ubicación suficiente para calcular cercanía.</p>
        ) : (
          <div className="nearby-list">
            {mascotasCercanas.map((item, idx) => (
              <article key={`${item.mascota.id}-${idx}`} className="nearby-row mascota-card mascota-card-modern">
                <div className="mascota-card-media nearby-row-media">
                  {item.mascota.fotoUrl ? (
                    <img
                      src={item.mascota.fotoUrl}
                      alt={item.mascota.nombreMascota}
                      className="mascota-card-image"
                    />
                  ) : (
                    <div className="mascota-card-placeholder">🐾</div>
                  )}
                  <div className="mascota-card-badge">{item.mascota.estado === 'perdida' ? 'PERDIDA' : 'ENCONTRADA'}</div>
                </div>

                <div className="mascota-card-body nearby-row-body">
                  <div className="nearby-row-topline">
                    <div>
                      <p className="search-page-eyebrow">#{idx + 1} más cercana</p>
                      <h3 className="mascota-card-title">{item.mascota.nombreMascota}</h3>
                    </div>
                    <p className="main-text nearby-group-meta">
                      Cerca de {item.referencia.nombreMascota} · {item.distanciaKm.toFixed(2)} km
                    </p>
                  </div>

                  <div className="mascota-card-meta nearby-card-meta">
                    <p><strong>Teléfono:</strong> {item.mascota.telefonoContacto || 'Sin número'}</p>
                    <p><strong>Zona:</strong> {item.mascota.zona || 'Sin zona'}</p>
                    <p><strong>Referencia:</strong> {item.referencia.nombreMascota}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
