export type EstadoReporte = 'perdida' | 'encontrada'

export type TamanoMascota = 'pequeno' | 'mediano' | 'grande'

export interface ReporteMascota {
  id: string
  /** id_usuario creador (reportes IAM); para filtrar \"mis reportes\" */
  createdByUserId?: number | null
  nombreMascota: string
  nombreContacto: string
  telefonoContacto: string
  estado: EstadoReporte
  especie: string
  raza: string
  color: string
  tamano: TamanoMascota
  zona: string
  ultimaUbicacion?: string
  latitud?: number
  longitud?: number
  fechaReporte: string
  descripcion: string
  fotoUrl?: string
  fechaCreacion: string
}

export interface MatchResult {
  perdida: ReporteMascota
  encontrada: ReporteMascota
  score: number
  razones: string[]
}

export interface MascotaCercanaItem {
  mascota: ReporteMascota
  distanciaKm: number
}

export interface MascotaCercanaGrupo {
  referencia: ReporteMascota
  cercanas: MascotaCercanaItem[]
}

export interface MascotaCercanaLinea {
  mascota: ReporteMascota
  distanciaKm: number
  referencia: ReporteMascota
}
