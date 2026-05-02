/**
 * Servicio para gestionar consultas veterinarias
 */
import { buildApiUrl, API_CONFIG } from '../config/api.config'
import { apiGet, apiPost, apiDelete } from './apiClient'
import type { Consulta } from '../types/api.types'

const CONSULTAS_PATH = '/api/consultas'

/**
 * Obtiene todas las consultas
 */
export const getAllConsultas = async (): Promise<{ data?: Consulta[]; error?: string }> => {
  const url = buildApiUrl(API_CONFIG.CONSULTAS, CONSULTAS_PATH)
  
  const response = await apiGet<Consulta[]>(url, true)
  
  if (response.error) {
    return { error: response.error }
  }

  return { data: response.data }
}

/**
 * Obtiene una consulta por ID
 */
export const getConsultaById = async (id: number): Promise<{ data?: Consulta; error?: string }> => {
  const url = buildApiUrl(API_CONFIG.CONSULTAS, `${CONSULTAS_PATH}/${id}`)
  
  const response = await apiGet<Consulta>(url, true)
  
  if (response.error) {
    return { error: response.error }
  }

  return { data: response.data }
}

/**
 * Crea una nueva consulta
 */
export const createConsulta = async (consulta: Omit<Consulta, 'id'>): Promise<{ data?: Consulta; error?: string }> => {
  const url = buildApiUrl(API_CONFIG.CONSULTAS, CONSULTAS_PATH)
  
  const response = await apiPost<Consulta>(url, consulta, true)
  
  if (response.error) {
    return { error: response.error }
  }

  return { data: response.data }
}

/**
 * Elimina una consulta
 */
export const deleteConsulta = async (id: number): Promise<{ success: boolean; error?: string }> => {
  const url = buildApiUrl(API_CONFIG.CONSULTAS, `${CONSULTAS_PATH}/${id}`)
  
  const response = await apiDelete<void>(url, true)
  
  if (response.error) {
    return { success: false, error: response.error }
  }

  return { success: true }
}



