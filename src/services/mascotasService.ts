/**
 * Catálogo de mascotas: /api/pets vía gateway
 */
import { buildApiUrl, API_CONFIG } from '../config/api.config'
import { apiGet, apiPost, apiDelete } from './apiClient'
import type { Mascota } from '../types/api.types'

const PETS_PATH = '/api/pets'

type PetDto = {
  id?: number
  name: string
  species: string
  breed: string
  color: string
  size: string
  chipNumber: string
  ownerId: number
  createdAt?: string
}

const toDto = (m: Omit<Mascota, 'id'> | Mascota): PetDto => ({
  id: m.id,
  name: m.nombre,
  species: m.especie.toLowerCase() === 'gato' ? 'CAT' : 'DOG',
  breed: m.raza,
  color: m.color || '',
  size: 'mediano',
  chipNumber: `APP-${Date.now()}`,
  ownerId: m.idCliente,
})

const fromDto = (p: PetDto): Mascota => ({
  id: p.id,
  idCliente: p.ownerId,
  nombre: p.name,
  especie: p.species === 'CAT' ? 'gato' : 'perro',
  raza: p.breed || '',
  edad: 0,
})

export const getAllMascotas = async (): Promise<{ data?: Mascota[]; error?: string }> => {
  const url = buildApiUrl(API_CONFIG.MASCOTAS, PETS_PATH)
  const response = await apiGet<PetDto[]>(url, true)

  if (response.error) {
    return { error: response.error }
  }

  return { data: (response.data || []).map(fromDto) }
}

export const getMascotaById = async (id: number): Promise<{ data?: Mascota; error?: string }> => {
  const url = buildApiUrl(API_CONFIG.MASCOTAS, `${PETS_PATH}/${id}`)
  const response = await apiGet<PetDto>(url, true)

  if (response.error) {
    return { error: response.error }
  }

  return response.data ? { data: fromDto(response.data) } : { error: 'No encontrada' }
}

export const createMascota = async (mascota: Omit<Mascota, 'id'>): Promise<{ data?: Mascota; error?: string }> => {
  const url = buildApiUrl(API_CONFIG.MASCOTAS, PETS_PATH)
  const body = { ...toDto(mascota as Mascota), id: undefined }
  const response = await apiPost<PetDto>(url, body, true)

  if (response.error) {
    return { error: response.error }
  }

  return response.data ? { data: fromDto(response.data) } : { error: 'Error al crear' }
}

export const deleteMascota = async (id: number): Promise<{ success: boolean; error?: string }> => {
  const url = buildApiUrl(API_CONFIG.MASCOTAS, `${PETS_PATH}/${id}`)
  const response = await apiDelete<void>(url, true)

  if (response.error) {
    return { success: false, error: response.error }
  }

  return { success: true }
}
