import React, { useEffect, useMemo, useRef, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import type { ReporteMascota } from '../types/reportes'

declare global {
  interface Window {
    google?: any
    gm_authFailure?: () => void
  }
}

interface MapaMascotasProps {
  reportes: ReporteMascota[]
}

const API_KEY = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || ''

const looksLikePlaceholderKey = (apiKey: string): boolean => {
  const key = apiKey.trim().toLowerCase()
  if (!key) return true
  return (
    key === 'your_api_key' ||
    key === 'pega_aqui_tu_api_key' ||
    key.includes('tuapikey') ||
    key.includes('tu_api_key')
  )
}

const loadGoogleMapsScript = async (apiKey: string): Promise<void> => {
  if (window.google?.maps?.importLibrary) return

  await new Promise<void>((resolve, reject) => {
    const g = { key: apiKey, v: 'weekly' }
    const p = 'The Google Maps JavaScript API'
    const c = 'google'
    const l = 'importLibrary'
    const q = '__ib__'
    const m = document
    let h: Promise<void> | undefined
    let a: HTMLScriptElement | undefined
    let k: string
    const b = window as any
    const d = (b[c] = b[c] || {})
    const maps = (d.maps = d.maps || {})
    const r = new Set<string>()
    const e = new URLSearchParams()

    const u = () =>
      h ||
      (h = new Promise<void>(async (f, n) => {
        a = m.createElement('script')
        e.set('libraries', [...r].join(','))
        for (k in g) {
          e.set(k.replace(/[A-Z]/g, t => `_${t[0].toLowerCase()}`), (g as any)[k])
        }
        e.set('callback', `${c}.maps.${q}`)
        a.src = `https://maps.${c}apis.com/maps/api/js?${e.toString()}`
        maps[q] = f
        a.onerror = () => {
          h = undefined
          n(new Error(`${p} could not load.`))
        }
        a.nonce = m.querySelector('script[nonce]')?.nonce || ''
        m.head.append(a)
      }))

    if (maps[l]) {
      resolve()
      return
    }

    maps[l] = (f: string, ...n: any[]) => r.add(f) && u().then(() => maps[l](f, ...n))

    u().then(resolve).catch(reject)
  })
}

const buildUserLocationSvg = () => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="17" fill="#1f9d6a" stroke="#ffffff" stroke-width="2" />
      <circle cx="18" cy="13" r="4" fill="#ffffff" />
      <path d="M11 28c0-3.9 3.1-7 7-7s7 3.1 7 7" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
    </svg>
  `

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

export default function MapaMascotas({ reportes }: MapaMascotasProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const userLocationMarkerRef = useRef<any>(null)
  const autoLocateRequestedRef = useRef(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const [provider, setProvider] = useState<'google' | 'osm'>('google')
  const [locating, setLocating] = useState(false)

  const reportesConCoordenadas = useMemo(
    () => reportes.filter(r => r.latitud && r.longitud),
    [reportes]
  )

  const escapeHtml = (value?: string) => {
    if (!value) return ''
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;')
  }

  const buildPopupContent = (reporte: ReporteMascota) => {
    const nombre = escapeHtml(reporte.nombreMascota || 'Mascota sin nombre')
    const zona = escapeHtml(reporte.zona || 'Sin zona')
    const contacto = escapeHtml(reporte.telefonoContacto || 'Sin telefono')

    return `
      <div class="pet-map-popup">
        <div class="pet-map-popup-body">
          <h3>${nombre}</h3>
          <p><span>Zona</span>${zona}</p>
          <p><span>Contacto</span>${contacto}</p>
        </div>
      </div>
    `
  }

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return

    let cancelled = false
    let fallbackTriggered = false
    let googleHealthCheckTimer: ReturnType<typeof setTimeout> | undefined

    const destroyExistingMap = () => {
      if (mapInstanceRef.current?.remove) {
        mapInstanceRef.current.remove()
      }
      mapInstanceRef.current = null
      if (mapRef.current) {
        mapRef.current.innerHTML = ''
      }
    }

    const renderOpenStreetMap = async (message?: string) => {
      const L = await import('leaflet')
      if (cancelled || !mapRef.current) return

      destroyExistingMap()

      const map = L.map(mapRef.current, {
        zoomControl: false,
        zoomAnimation: false,
      }).setView([-33.4489, -70.6693], 11)

      L.control
        .zoom({
          position: 'bottomright',
        })
        .addTo(map)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
      }).addTo(map)

      reportesConCoordenadas.forEach(reporte => {
        if (!reporte.latitud || !reporte.longitud) return

        const marker = L.marker([reporte.latitud, reporte.longitud]).addTo(map)

        marker.bindPopup(buildPopupContent(reporte), {
          className: 'pet-map-leaflet-popup',
          maxWidth: 280,
          closeButton: true,
        })
      })

      mapInstanceRef.current = map
      setProvider('osm')
      setMapError(message || null)

      if (!autoLocateRequestedRef.current) {
        autoLocateRequestedRef.current = true
        setTimeout(() => {
          handleLocateUser({ silent: true })
        }, 0)
      }
    }

    const switchToOpenStreetMap = async (message: string) => {
      if (fallbackTriggered || cancelled) return
      fallbackTriggered = true
      await renderOpenStreetMap(message)
    }

    const renderGoogleMap = async () => {
      if (looksLikePlaceholderKey(API_KEY)) {
        await renderOpenStreetMap()
        return
      }

      const previousAuthFailure = window.gm_authFailure
      window.gm_authFailure = () => {
        void switchToOpenStreetMap(
          'Google Maps rechazo la API key o sus permisos. Mostrando mapa alternativo.'
        )
      }

      try {
        await loadGoogleMapsScript(API_KEY)

        const MapsApi = window.google?.maps
        if (!MapsApi || cancelled || !mapRef.current) {
          return
        }

        destroyExistingMap()

        const { Map } = (await (window.google.maps as any).importLibrary('maps')) as any
        if (cancelled || !mapRef.current) {
          return
        }

        const map = new Map(mapRef.current, {
          zoom: 11,
          center: { lat: -33.4489, lng: -70.6693 },
          mapTypeControl: false,
          mapTypeId: 'hybrid',
          fullscreenControl: false,
          streetViewControl: false,
          zoomControl: true,
        })

        let googleTilesLoaded = false
        map.addListener('tilesloaded', () => {
          googleTilesLoaded = true
        })

        reportesConCoordenadas.forEach(reporte => {
          if (!reporte.latitud || !reporte.longitud) return

          const marker = new MapsApi.Marker({
            position: { lat: reporte.latitud, lng: reporte.longitud },
            map,
            title: reporte.nombreMascota,
          })

          const infoWindow = new MapsApi.InfoWindow({
            content: buildPopupContent(reporte),
          })

          marker.addListener('click', () => {
            infoWindow.open({ map, anchor: marker })
          })
        })

        mapInstanceRef.current = map
        setProvider('google')
        setMapError(null)

        if (!autoLocateRequestedRef.current) {
          autoLocateRequestedRef.current = true
          setTimeout(() => {
            handleLocateUser({ silent: true })
          }, 0)
        }

        // Si Google renderiza su panel de error dentro del canvas (ej: InvalidKeyMapError),
        // degradamos automaticamente a OSM para no dejar el bloque gris.
        googleHealthCheckTimer = setTimeout(() => {
          if (cancelled || fallbackTriggered || !mapRef.current) return

          const mapText = (mapRef.current.textContent || '').toLowerCase()
          const hasGoogleRenderError =
            mapText.includes('se produjo un error') ||
            mapText.includes('esta pagina no cargo bien google maps') ||
            mapText.includes("this page can't load google maps correctly")

          const hasGoogleTilesIssue = !googleTilesLoaded

          if (hasGoogleRenderError || hasGoogleTilesIssue) {
            void switchToOpenStreetMap(
              'Google Maps no pudo cargarse (API no activada o permisos/billing pendientes). Mostrando mapa alternativo.'
            )
          }
        }, 3500)
      } catch (error) {
        console.error(error)
        await switchToOpenStreetMap('No se pudo cargar Google Maps. Mostrando mapa alternativo.')
      } finally {
        window.gm_authFailure = previousAuthFailure
      }
    }

    void renderGoogleMap()

    return () => {
      cancelled = true
      if (googleHealthCheckTimer) {
        clearTimeout(googleHealthCheckTimer)
      }
      destroyExistingMap()
    }
  }, [reportesConCoordenadas])

  const handleLocateUser = (options: { silent?: boolean } = {}) => {
    const { silent = false } = options

    if (!navigator.geolocation) {
      if (!silent) {
        setMapError('Tu navegador no soporta geolocalizacion.')
      }
      return
    }

    if (!silent) {
      setLocating(true)
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude

        if (provider === 'google' && window.google?.maps && mapInstanceRef.current) {
          const map = mapInstanceRef.current
          const coords = { lat, lng }
            const userLocationIcon = {
              url: buildUserLocationSvg(),
              scaledSize: new window.google.maps.Size(36, 36),
              anchor: new window.google.maps.Point(18, 18),
            }

          map.panTo(coords)
          map.setZoom(Math.max(map.getZoom?.() || 11, 14))

          if (userLocationMarkerRef.current) {
            userLocationMarkerRef.current.setMap(null)
          }

          userLocationMarkerRef.current = new window.google.maps.Marker({
            position: coords,
            map,
            title: 'Tu ubicacion',
            icon: userLocationIcon,
          })
        } else if (mapInstanceRef.current?.setView) {
          const map = mapInstanceRef.current
          map.setView([lat, lng], 14)

          if (userLocationMarkerRef.current?.remove) {
            userLocationMarkerRef.current.remove()
          }

          // Marcador simple para la ubicacion del usuario en fallback OSM.
          import('leaflet').then(L => {
            const userLocationIcon = L.divIcon({
              className: 'pet-map-user-location-marker',
              html: `<img src="${buildUserLocationSvg()}" alt="Tu ubicacion" />`,
              iconSize: [36, 36],
              iconAnchor: [18, 18],
            })

            userLocationMarkerRef.current = L.marker([lat, lng], {
              icon: userLocationIcon,
            }).addTo(map)
            userLocationMarkerRef.current.bindPopup('Tu ubicacion actual').openPopup()
          })
        }

        if (!silent) {
          setMapError(null)
        }
        setLocating(false)
      },
      () => {
        if (!silent) {
          setMapError('No se pudo obtener tu ubicacion. Revisa permisos del navegador.')
        }
        setLocating(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    )
  }

  return (
    <div className="pet-map-shell">
      <div className="pet-map-header">
        <div className="pet-map-header-main">
          <h2 className="section-title">Mapa de Mascotas Perdidas</h2>
          <p className="pet-map-meta">
            {provider === 'google' ? 'Google Maps' : 'OpenStreetMap'} · {reportesConCoordenadas.length} mascota{reportesConCoordenadas.length !== 1 ? 's' : ''}
          </p>
        </div>

        <button
          type="button"
          className="pet-map-locate-btn"
          onClick={handleLocateUser}
          disabled={locating}
        >
          {locating ? 'Buscando...' : 'Mi ubicacion'}
        </button>
      </div>

      {mapError && (
        <div className="pet-map-error">
          {mapError}
        </div>
      )}

      <div className="pet-map-stage">
        <div ref={mapRef} className="pet-map-canvas" />
      </div>
    </div>
  )
}
