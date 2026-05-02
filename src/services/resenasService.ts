/**
 * Servicio para gestionar reseñas
 */
import { buildApiUrl, API_CONFIG } from '../config/api.config'
import { apiGet, apiPost } from './apiClient'
import type { Resena } from '../types/api.types'

const RESENAS_PATH = '/api/resenas'

/**
 * Obtiene todas las reseñas
 */
export const getAllResenas = async (): Promise<{ data?: Resena[]; error?: string }> => {
  const url = buildApiUrl(API_CONFIG.RESENAS, RESENAS_PATH)
  
  const response = await apiGet<Resena[]>(url)
  
  if (response.error) {
    return { error: response.error }
  }

  return { data: response.data }
}

/**
 * Crea una nueva reseña
 */
export const createResena = async (resena: Omit<Resena, 'id'>): Promise<{ data?: Resena; error?: string }> => {
  const url = buildApiUrl(API_CONFIG.RESENAS, RESENAS_PATH)
  
  const response = await apiPost<Resena>(url, resena, true)
  
  if (response.error) {
    return { error: response.error }
  }

  return { data: response.data }
}



