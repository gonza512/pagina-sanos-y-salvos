import { API_CONFIG, buildApiUrl } from '../config/api.config'
import type { MatchResult, MascotaCercanaGrupo, MascotaCercanaItem, MascotaCercanaLinea, ReporteMascota, TamanoMascota } from '../types/reportes'
import { apiPost, apiPatch } from './apiClient'

const REPORTS_PATH = '/api/reports'
const PETS_PATH = '/api/pets'
const MATCHING_PATH = '/api/matching'

type ReportDto = {
  id: number
  petId: number
  createdBy: number | null
  type: string
  status: string
  commune: string
  description: string
  healthStatus?: string | null
  latitude?: number | string | null
  longitude?: number | string | null
  createdAt?: string
}

type PetDto = {
  id?: number
  name: string
  species: string
  breed: string
  color: string
  size: string
  chipNumber: string
  ownerId: number
}

type MatchDto = {
  id?: number
  lostReportId: number
  foundReportId: number
  score: number
  explanation?: string
  createdAt?: string
}

const LOCAL_REPORTES_KEY = 'sanosysalvos:reportes'

const LOCAL_SEED_REPORTES: ReporteMascota[] = [
  {
    id: 'seed-1',
    nombreMascota: 'Luna',
    nombreContacto: 'María Pérez',
    telefonoContacto: '+56911111111',
    estado: 'perdida',
    especie: 'perro',
    raza: 'mestizo',
    color: 'cafe',
    tamano: 'mediano',
    zona: 'Providencia',
    ultimaUbicacion: 'Cerca del parque Bustamante',
    latitud: -33.44,
    longitud: -70.62,
    fechaReporte: new Date().toISOString().slice(0, 10),
    descripcion: 'Perra mediana color cafe, muy sociable.',
    fotoUrl: '/assets/img/home-mapa-mascota.png',
    fechaCreacion: new Date().toISOString(),
  },
  {
    id: 'seed-2',
    nombreMascota: 'Milo',
    nombreContacto: 'Carlos Rojas',
    telefonoContacto: '+56922222222',
    estado: 'encontrada',
    especie: 'gato',
    raza: 'angora',
    color: 'blanco',
    tamano: 'pequeno',
    zona: 'Ñuñoa',
    latitud: -33.46,
    longitud: -70.6,
    fechaReporte: new Date().toISOString().slice(0, 10),
    descripcion: 'Gato pequeño encontrado con collar azul.',
    fotoUrl: '/assets/img/logo-sanos-salvos.png',
    fechaCreacion: new Date().toISOString(),
  },
  {
    id: 'seed-3',
    nombreMascota: 'Toby',
    nombreContacto: 'Andrea Silva',
    telefonoContacto: '+56933333333',
    estado: 'perdida',
    especie: 'perro',
    raza: 'labrador',
    color: 'negro',
    tamano: 'grande',
    zona: 'Santiago',
    ultimaUbicacion: 'Salida del metro Universidad de Chile',
    latitud: -33.45,
    longitud: -70.66,
    fechaReporte: new Date().toISOString().slice(0, 10),
    descripcion: 'Perro grande negro con placa metálica.',
    fotoUrl: '/assets/img/home-mapa-mascota.png',
    fechaCreacion: new Date().toISOString(),
  },
  {
    id: 'seed-4',
    nombreMascota: 'Nina',
    nombreContacto: 'Patricia Gómez',
    telefonoContacto: '+56944444444',
    estado: 'perdida',
    especie: 'gato',
    raza: 'mestiza',
    color: 'gris',
    tamano: 'pequeno',
    zona: 'Las Condes',
    ultimaUbicacion: 'Cerca del Parque Araucano',
    latitud: -33.405,
    longitud: -70.575,
    fechaReporte: new Date().toISOString().slice(0, 10),
    descripcion: 'Gatita pequeña gris con ojos verdes, muy asustadiza.',
    fotoUrl: '/assets/img/logo-sanos-salvos.svg',
    fechaCreacion: new Date().toISOString(),
  },
]

const nowIso = () => new Date().toISOString()

const generateLocalId = () => `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const authHeaders = (): HeadersInit => {
  const token = localStorage.getItem('auth_token')
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) h.Authorization = `Bearer ${token}`
  return h
}

const num = (v: number | string | null | undefined): number | undefined => {
  if (v === null || v === undefined) return undefined
  const n = typeof v === 'string' ? parseFloat(v) : v
  return Number.isFinite(n) ? n : undefined
}

const mapSpeciesToUi = (species: string) => (species === 'CAT' ? 'gato' : 'perro')

const mapTamano = (size: string | undefined): TamanoMascota => {
  const s = (size || 'mediano').toLowerCase()
  if (s === 'pequeno' || s === 'small') return 'pequeno'
  if (s === 'grande' || s === 'large') return 'grande'
  return 'mediano'
}

const extractContactFromDescription = (description: string) => {
  const lines = description.split('\n')
  let nombreContacto = ''
  let telefonoContacto = ''
  let ultimaUbicacion: string | undefined
  let body = description
  for (const line of lines) {
    if (line.startsWith('Contacto:')) nombreContacto = line.replace('Contacto:', '').trim()
    else if (line.startsWith('Tel:')) telefonoContacto = line.replace('Tel:', '').trim()
    else if (line.startsWith('Ultima ubicacion:')) ultimaUbicacion = line.replace('Ultima ubicacion:', '').trim()
  }
  if (nombreContacto || telefonoContacto) {
    body = lines.filter(l => !l.startsWith('Contacto:') && !l.startsWith('Tel:') && !l.startsWith('Ultima ubicacion:')).join('\n').trim()
  }
  return { nombreContacto, telefonoContacto, ultimaUbicacion, body }
}

const reportAndPetToUi = (r: ReportDto, pet: PetDto | undefined): ReporteMascota => {
  const tipo = (r.type || '').toUpperCase()
  const estado: ReporteMascota['estado'] =
    tipo.includes('PERDIDA') || tipo === 'LOST' ? 'perdida' : 'encontrada'
  const { nombreContacto, telefonoContacto, ultimaUbicacion, body } = extractContactFromDescription(
    r.description || ''
  )
  const created = r.createdAt || nowIso()
  return {
    id: String(r.id),
    createdByUserId: r.createdBy,
    nombreMascota: pet?.name || `Mascota #${r.petId}`,
    nombreContacto,
    telefonoContacto,
    estado,
    especie: pet ? mapSpeciesToUi(pet.species) : 'perro',
    raza: pet?.breed || '',
    color: pet?.color || '',
    tamano: mapTamano(pet?.size),
    zona: r.commune || '',
    ultimaUbicacion,
    latitud: num(r.latitude),
    longitud: num(r.longitude),
    fechaReporte: created.slice(0, 10),
    descripcion: body || r.description || '',
    fotoUrl: undefined,
    fechaCreacion: created,
  }
}

const safeReadLocalReportes = (): ReporteMascota[] => {
  try {
    const raw = localStorage.getItem(LOCAL_REPORTES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const ensureLocalSeedReportes = (): ReporteMascota[] => {
  const current = safeReadLocalReportes()
  const merged = mergeById(current, LOCAL_SEED_REPORTES)
  if (merged.length !== current.length) {
    safeWriteLocalReportes(merged)
  }
  return merged.length > 0 ? merged : LOCAL_SEED_REPORTES.map(reporte => normalizeReporte(reporte))
}

const safeWriteLocalReportes = (reportes: ReporteMascota[]) => {
  try {
    localStorage.setItem(LOCAL_REPORTES_KEY, JSON.stringify(reportes))
  } catch {
    // ignore
  }
}

const normalizeReporte = (reporte: Partial<ReporteMascota>): ReporteMascota => ({
  id: reporte.id ?? generateLocalId(),
  createdByUserId: reporte.createdByUserId,
  nombreMascota: reporte.nombreMascota ?? '',
  nombreContacto: reporte.nombreContacto ?? '',
  telefonoContacto: reporte.telefonoContacto ?? '',
  estado: reporte.estado ?? 'perdida',
  especie: reporte.especie ?? '',
  raza: reporte.raza ?? '',
  color: reporte.color ?? '',
  tamano: (reporte.tamano ?? 'mediano') as TamanoMascota,
  zona: reporte.zona ?? '',
  ultimaUbicacion: reporte.ultimaUbicacion,
  latitud: reporte.latitud,
  longitud: reporte.longitud,
  fechaReporte: reporte.fechaReporte ?? new Date().toISOString().slice(0, 10),
  descripcion: reporte.descripcion ?? '',
  fotoUrl: reporte.fotoUrl,
  fechaCreacion: reporte.fechaCreacion ?? nowIso(),
})

const mergeById = (primary: ReporteMascota[], secondary: ReporteMascota[]) => {
  const merged = new Map<string, ReporteMascota>()
  primary.forEach(reporte => merged.set(reporte.id, normalizeReporte(reporte)))
  secondary.forEach(reporte => merged.set(reporte.id, normalizeReporte(reporte)))
  return Array.from(merged.values())
}

const saveLocalReporte = (reporte: ReporteMascota) => {
  const reportes = safeReadLocalReportes()
  const next = mergeById([normalizeReporte(reporte)], reportes.filter(item => item.id !== reporte.id))
  safeWriteLocalReportes(next)
  return normalizeReporte(reporte)
}

const updateLocalReporte = (
  id: string,
  updater: (reporte: ReporteMascota) => ReporteMascota
): ReporteMascota | null => {
  const reportes = safeReadLocalReportes()
  const index = reportes.findIndex(reporte => reporte.id === id)
  if (index < 0) return null

  const updated = normalizeReporte(updater(normalizeReporte(reportes[index])))
  const next = [...reportes]
  next[index] = updated
  safeWriteLocalReportes(next)
  return updated
}

const scoreCoincidencia = (perdida: ReporteMascota, encontrada: ReporteMascota) => {
  let score = 0
  const razones: string[] = []

  const addReason = (condition: boolean, points: number, reason: string) => {
    if (condition) {
      score += points
      razones.push(reason)
    }
  }

  addReason(perdida.especie.toLowerCase() === encontrada.especie.toLowerCase(), 20, 'Coincide la especie')
  addReason(perdida.raza.toLowerCase() === encontrada.raza.toLowerCase(), 25, 'Coincide la raza')
  addReason(perdida.color.toLowerCase() === encontrada.color.toLowerCase(), 15, 'Coincide el color')
  addReason(perdida.tamano === encontrada.tamano, 15, 'Coincide el tamaño')
  addReason(perdida.zona.toLowerCase() === encontrada.zona.toLowerCase(), 15, 'Coincide la zona')

  const diffDays =
    Math.abs(new Date(perdida.fechaReporte).getTime() - new Date(encontrada.fechaReporte).getTime()) /
    (1000 * 60 * 60 * 24)
  addReason(diffDays <= 7, 10, 'Las fechas están cerca')

  return { score: Math.min(score, 100), razones }
}

const buildCoincidencias = (reportes: ReporteMascota[]): MatchResult[] => {
  const perdidas = reportes.filter(reporte => reporte.estado === 'perdida')
  const encontradas = reportes.filter(reporte => reporte.estado === 'encontrada')
  const matches: MatchResult[] = []

  perdidas.forEach(perdida => {
    encontradas.forEach(encontrada => {
      const result = scoreCoincidencia(perdida, encontrada)
      if (result.score >= 40) {
        matches.push({
          perdida,
          encontrada,
          score: result.score,
          razones: result.razones,
        })
      }
    })
  })

  return matches.sort((a, b) => b.score - a.score)
}

const toRadians = (value: number) => (value * Math.PI) / 180

const distanceKm = (a: ReporteMascota, b: ReporteMascota) => {
  const earthRadiusKm = 6371
  const lat1 = a.latitud ?? 0
  const lon1 = a.longitud ?? 0
  const lat2 = b.latitud ?? 0
  const lon2 = b.longitud ?? 0

  const deltaLat = toRadians(lat2 - lat1)
  const deltaLon = toRadians(lon2 - lon1)
  const sinLat = Math.sin(deltaLat / 2)
  const sinLon = Math.sin(deltaLon / 2)
  const haversine =
    sinLat * sinLat +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * sinLon * sinLon

  return 2 * earthRadiusKm * Math.asin(Math.min(1, Math.sqrt(haversine)))
}

const buildMascotasCercanas = (reportes: ReporteMascota[]): MascotaCercanaGrupo[] => {
  const reportesConCoordenadas = reportes.filter(reporte => reporte.latitud != null && reporte.longitud != null)
  const referencias = reportesConCoordenadas.filter(reporte => reporte.estado === 'perdida')

  return referencias
    .map(referencia => {
      const cercanas = reportesConCoordenadas
        .filter(candidato => candidato.id !== referencia.id)
        .map<MascotaCercanaItem>(candidato => ({
          mascota: candidato,
          distanciaKm: distanceKm(referencia, candidato),
        }))
        .sort((a, b) => a.distanciaKm - b.distanciaKm)
        .slice(0, 3)

      return { referencia, cercanas }
    })
    .filter(grupo => grupo.cercanas.length > 0)
    .sort((a, b) => a.cercanas[0].distanciaKm - b.cercanas[0].distanciaKm)
}

const buildMascotasCercanasLineales = (reportes: ReporteMascota[]): MascotaCercanaLinea[] => {
  const reportesConCoordenadas = reportes.filter(reporte => reporte.latitud != null && reporte.longitud != null)
  const perdidas = reportesConCoordenadas.filter(reporte => reporte.estado === 'perdida')
  const encontradas = reportesConCoordenadas.filter(reporte => reporte.estado === 'encontrada')

  const closestByPet = new Map<string, MascotaCercanaLinea>()

  encontradas.forEach(mascota => {
    let closestReference: ReporteMascota | null = null
    let closestDistance = Number.POSITIVE_INFINITY

    perdidas.forEach(referencia => {
      const distance = distanceKm(referencia, mascota)
      if (distance < closestDistance) {
        closestDistance = distance
        closestReference = referencia
      }
    })

    if (closestReference) {
      closestByPet.set(mascota.id, {
        mascota,
        distanciaKm: closestDistance,
        referencia: closestReference,
      })
    }
  })

  perdidas.forEach(mascota => {
    let closestReference: ReporteMascota | null = null
    let closestDistance = Number.POSITIVE_INFINITY

    perdidas.forEach(referencia => {
      if (referencia.id === mascota.id) return
      const distance = distanceKm(referencia, mascota)
      if (distance < closestDistance) {
        closestDistance = distance
        closestReference = referencia
      }
    })

    if (closestReference) {
      const existing = closestByPet.get(mascota.id)
      if (!existing || closestDistance < existing.distanciaKm) {
        closestByPet.set(mascota.id, {
          mascota,
          distanciaKm: closestDistance,
          referencia: closestReference,
        })
      }
    }
  })

  return Array.from(closestByPet.values()).sort((a, b) => a.distanciaKm - b.distanciaKm)
}

const fetchRemoteReportes = async (): Promise<ReporteMascota[] | null> => {
  const base = API_CONFIG.REPORTES
  try {
    const [repRes, petRes] = await Promise.all([
      fetch(buildApiUrl(base, REPORTS_PATH), { headers: authHeaders() }),
      fetch(buildApiUrl(base, PETS_PATH), { headers: authHeaders() }),
    ])
    if (!repRes.ok) return null
    const reports = (await repRes.json()) as ReportDto[]
    const pets: PetDto[] = petRes.ok ? ((await petRes.json()) as PetDto[]) : []
    const petMap = new Map<number, PetDto>()
    pets.forEach(p => {
      if (p.id != null) petMap.set(p.id, p)
    })
    return reports.map(r => reportAndPetToUi(r, petMap.get(r.petId)))
  } catch {
    return null
  }
}

export const getReportes = async (): Promise<ReporteMascota[]> => {
  const localReportes = ensureLocalSeedReportes()
  const remote = await fetchRemoteReportes()
  if (!remote) return localReportes
  return mergeById(remote, localReportes)
}

const mapSpeciesApi = (especie: string) => {
  const e = especie.toLowerCase()
  if (e === 'gato') return 'CAT'
  return 'DOG'
}

export const saveReporte = async (
  reporte: Omit<ReporteMascota, 'id' | 'fechaCreacion'>
): Promise<ReporteMascota> => {
  const localPayload = normalizeReporte({ ...reporte })
  const token = localStorage.getItem('auth_token')
  const rawUser = localStorage.getItem('auth_user')
  const ownerId = rawUser ? (JSON.parse(rawUser) as { id?: number }).id : undefined

  if (!token || !ownerId) {
    const localSaved = normalizeReporte({
      ...localPayload,
      id: generateLocalId(),
      fechaCreacion: nowIso(),
    })
    saveLocalReporte(localSaved)
    return localSaved
  }

  const base = API_CONFIG.REPORTES
  const chip = `WEB-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const petBody: PetDto = {
    name: reporte.nombreMascota.trim(),
    species: mapSpeciesApi(reporte.especie),
    breed: reporte.raza.trim(),
    color: reporte.color.trim(),
    size: reporte.tamano,
    chipNumber: chip,
    ownerId,
  }

  const petUrl = buildApiUrl(base, PETS_PATH)
  const petRes = await apiPost<PetDto>(petUrl, petBody, true)
  if (petRes.error || !petRes.data?.id) {
    const localSaved = normalizeReporte({
      ...localPayload,
      id: generateLocalId(),
      fechaCreacion: nowIso(),
    })
    saveLocalReporte(localSaved)
    return localSaved
  }

  const descLines = [
    reporte.descripcion.trim(),
    `Contacto: ${reporte.nombreContacto.trim()}`,
    `Tel: ${reporte.telefonoContacto.trim()}`,
  ]
  if (reporte.ultimaUbicacion?.trim()) {
    descLines.push(`Ultima ubicacion: ${reporte.ultimaUbicacion.trim()}`)
  }

  const reportBody = {
    petId: petRes.data.id,
    createdBy: ownerId,
    type: reporte.estado === 'perdida' ? 'PERDIDA' : 'ENCONTRADA',
    status: 'ABIERTO',
    commune: reporte.zona.trim(),
    description: descLines.join('\n'),
    latitude: reporte.latitud ?? null,
    longitude: reporte.longitud ?? null,
    healthStatus: null as string | null,
  }

  const reportUrl = buildApiUrl(base, REPORTS_PATH)
  const reportRes = await apiPost<ReportDto>(reportUrl, reportBody, true)

  if (reportRes.error || !reportRes.data) {
    const localSaved = normalizeReporte({
      ...localPayload,
      id: generateLocalId(),
      fechaCreacion: nowIso(),
    })
    saveLocalReporte(localSaved)
    return localSaved
  }

  const saved = normalizeReporte({
    ...reportAndPetToUi(reportRes.data, petRes.data),
    fotoUrl: reporte.fotoUrl,
  })
  saveLocalReporte(saved)
  return saved
}

export const marcarReporteComoEncontrada = async (
  id: string,
  owner: { nombreContacto?: string; telefonoContacto?: string }
): Promise<ReporteMascota> => {
  const numericId = /^\d+$/.test(id) ? id : null
  if (numericId) {
    const existingLocal = safeReadLocalReportes().find(reporte => reporte.id === id)
    const url = buildApiUrl(API_CONFIG.REPORTES, `${REPORTS_PATH}/${numericId}/status`)
    const response = await apiPatch<ReportDto>(url, { status: 'CERRADO' }, true)
    if (!response.error && response.data) {
      const petsUrl = buildApiUrl(API_CONFIG.REPORTES, PETS_PATH)
      let pet: PetDto | undefined
      try {
        const pr = await fetch(petsUrl, { headers: authHeaders() })
        if (pr.ok) {
          const list = (await pr.json()) as PetDto[]
          pet = list.find(p => p.id === response.data!.petId)
        }
      } catch {
        // ignore
      }
      const saved = normalizeReporte({
        ...reportAndPetToUi(response.data, pet),
        fotoUrl: existingLocal?.fotoUrl,
        estado: 'encontrada',
        nombreContacto: owner.nombreContacto ?? '',
        telefonoContacto: owner.telefonoContacto ?? '',
      })
      saveLocalReporte(saved)
      return saved
    }
  }

  const updated = updateLocalReporte(id, reporte => ({
    ...reporte,
    estado: 'encontrada',
    nombreContacto: owner.nombreContacto ?? reporte.nombreContacto,
    telefonoContacto: owner.telefonoContacto ?? reporte.telefonoContacto,
  }))

  if (!updated) {
    throw new Error('No fue posible actualizar el estado del reporte.')
  }

  return updated
}

export const marcarReporteComoPerdida = async (
  id: string,
  owner: { nombreContacto?: string; telefonoContacto?: string }
): Promise<ReporteMascota> => {
  const numericId = /^\d+$/.test(id) ? id : null
  if (numericId) {
    const existingLocal = safeReadLocalReportes().find(reporte => reporte.id === id)
    const url = buildApiUrl(API_CONFIG.REPORTES, `${REPORTS_PATH}/${numericId}/status`)
    const response = await apiPatch<ReportDto>(url, { status: 'ABIERTO' }, true)
    if (!response.error && response.data) {
      const petsUrl = buildApiUrl(API_CONFIG.REPORTES, PETS_PATH)
      let pet: PetDto | undefined
      try {
        const pr = await fetch(petsUrl, { headers: authHeaders() })
        if (pr.ok) {
          const list = (await pr.json()) as PetDto[]
          pet = list.find(p => p.id === response.data!.petId)
        }
      } catch {
        // ignore
      }
      const saved = normalizeReporte({
        ...reportAndPetToUi(response.data, pet),
        fotoUrl: existingLocal?.fotoUrl,
        estado: 'perdida',
        nombreContacto: owner.nombreContacto ?? '',
        telefonoContacto: owner.telefonoContacto ?? '',
      })
      saveLocalReporte(saved)
      return saved
    }
  }

  const updated = updateLocalReporte(id, reporte => ({
    ...reporte,
    estado: 'perdida',
    nombreContacto: owner.nombreContacto ?? reporte.nombreContacto,
    telefonoContacto: owner.telefonoContacto ?? reporte.telefonoContacto,
  }))

  if (!updated) {
    throw new Error('No fue posible actualizar el estado del reporte.')
  }

  return updated
}

export const getCoincidencias = async (): Promise<MatchResult[]> => {
  const localReportes = ensureLocalSeedReportes()
  const base = API_CONFIG.COINCIDENCIAS
  const url = buildApiUrl(base, MATCHING_PATH)

  try {
    if (localStorage.getItem('auth_token')) {
      const runUrl = buildApiUrl(base, `${MATCHING_PATH}/run`)
      await fetch(runUrl, { method: 'POST', headers: authHeaders() }).catch(() => undefined)
    }

    const response = await fetch(url, { headers: authHeaders() })
    if (!response.ok) return buildCoincidencias(localReportes)

    const matches = (await response.json()) as MatchDto[]
    if (!Array.isArray(matches) || matches.length === 0) {
      return buildCoincidencias(localReportes)
    }

    const reportes = await getReportes()
    const byId = new Map(reportes.map(r => [r.id, r]))

    const out: MatchResult[] = []
    for (const m of matches) {
      const perdida = byId.get(String(m.lostReportId))
      const encontrada = byId.get(String(m.foundReportId))
      if (perdida && encontrada) {
        const pct = m.score <= 1 ? Math.round(m.score * 100) : Math.round(m.score)
        out.push({
          perdida,
          encontrada,
          score: pct,
          razones: m.explanation ? [m.explanation] : ['Coincidencia del motor IA'],
        })
      }
    }
    return out.length > 0 ? out : buildCoincidencias(localReportes)
  } catch {
    return buildCoincidencias(localReportes)
  }
}

export const getMascotasCercanas = async (): Promise<MascotaCercanaGrupo[]> => {
  const reportes = await getReportes()
  return buildMascotasCercanas(reportes)
}

export const getMascotasCercanasLineales = async (): Promise<MascotaCercanaLinea[]> => {
  const reportes = await getReportes()
  return buildMascotasCercanasLineales(reportes)
}

export const getZonasConIncidencia = async (): Promise<Array<{ zona: string; total: number }>> => {
  const reportes = await getReportes()
  const counts = new Map<string, number>()
  reportes.forEach(reporte => {
    const zona = reporte.zona.trim()
    if (!zona) return
    counts.set(zona, (counts.get(zona) || 0) + 1)
  })

  return Array.from(counts.entries())
    .map(([zona, total]) => ({ zona, total }))
    .sort((a, b) => b.total - a.total || a.zona.localeCompare(b.zona))
}
