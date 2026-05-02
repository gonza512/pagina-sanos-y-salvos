import React, { useEffect, useMemo, useRef, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import { CENTROS_REGION_CHILE } from '../config/ubicacionChile'

type Coordenadas = {
  lat: number
  lng: number
}

interface UbicacionExactaMapProps {
  region: string
  comuna: string
  value: Coordenadas | null
  onChange: (value: Coordenadas | null) => void
}

const DEFAULT_CENTER: Coordenadas = CENTROS_REGION_CHILE['Región Metropolitana de Santiago']

export default function UbicacionExactaMap({ region, comuna, value, onChange }: UbicacionExactaMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const leafletRef = useRef<typeof import('leaflet') | null>(null)
  const [mapReady, setMapReady] = useState(false)

  const center = useMemo(() => CENTROS_REGION_CHILE[region] || DEFAULT_CENTER, [region])

  useEffect(() => {
    let cancelled = false

    const initMap = async () => {
      if (!mapRef.current || mapInstanceRef.current) return

      const L = await import('leaflet')
      if (cancelled || !mapRef.current) return

      leafletRef.current = L

      const map = L.map(mapRef.current, {
        zoomControl: true,
        zoomAnimation: true,
      }).setView([center.lat, center.lng], region ? 14 : 11)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
      }).addTo(map)

      map.on('click', (event: any) => {
        const next = { lat: event.latlng.lat, lng: event.latlng.lng }
        onChange(next)
      })

      mapInstanceRef.current = map
      setMapReady(true)
    }

    void initMap()

    return () => {
      cancelled = true
      mapInstanceRef.current?.remove?.()
      mapInstanceRef.current = null
      markerRef.current = null
      leafletRef.current = null
      setMapReady(false)
    }
  }, [center.lat, center.lng, onChange, region])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    map.setView([center.lat, center.lng], region ? 14 : 11)
  }, [center.lat, center.lng, region])

  useEffect(() => {
    const map = mapInstanceRef.current
    const L = leafletRef.current
    if (!map || !L) return

    if (markerRef.current?.remove) {
      markerRef.current.remove()
      markerRef.current = null
    }

    if (value) {
      markerRef.current = L.marker([value.lat, value.lng]).addTo(map)
      map.panTo([value.lat, value.lng])
    }
  }, [value])

  const formatCoords = (coords: Coordenadas) => `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`

  return (
    <div className="location-picker-shell">
      <div className="location-picker-header">
        <div>
          <h3 className="section-title">Ubicación exacta en el mapa</h3>
          <p className="main-text location-picker-help">
            Haz clic sobre el mapa para marcar el punto exacto donde se vio por última vez a la mascota.
          </p>
        </div>
        <button
          type="button"
          className="btn-secondary-custom location-picker-clear"
          onClick={() => onChange(null)}
          disabled={!value}
        >
          Limpiar marcador
        </button>
      </div>

      <div className="location-picker-meta">
        <span>Región: {region || 'Sin seleccionar'}</span>
        <span>Comuna: {comuna || 'Sin seleccionar'}</span>
        <span>{value ? `Marcado: ${formatCoords(value)}` : 'Aún no seleccionas un punto exacto'}</span>
      </div>

      <div className="location-picker-map-wrap">
        <div ref={mapRef} className="location-picker-map" />
        {!mapReady && <div className="location-picker-loading">Cargando mapa...</div>}
      </div>

      {value && (
        <p className="main-text location-picker-summary">
          Coordenadas exactas guardadas: <strong>{formatCoords(value)}</strong>
        </p>
      )}
    </div>
  )
}