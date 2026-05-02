/**
 * Cliente API base para hacer peticiones HTTP a los microservicios
 */

export interface ApiResponse<T> {
  data?: T
  error?: string
  status: number
}

/**
 * Opciones para las peticiones HTTP
 */
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: any
  requiresAuth?: boolean
}

/**
 * Realiza una petición HTTP al microservicio
 * @param url - URL completa del endpoint
 * @param options - Opciones de la petición
 * @returns Respuesta parseada como JSON
 */
export async function apiRequest<T>(
  url: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    headers = {},
    body,
    requiresAuth = false,
  } = options

  // Headers por defecto
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  const token = localStorage.getItem('auth_token')

  // Adjuntar token automáticamente para llamadas autenticadas.
  if (requiresAuth && token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`
  }

  // También lo adjunta de forma transparente para no romper llamadas existentes.
  if (!requiresAuth && token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`
  }

  // Combinar headers
  const finalHeaders = { ...defaultHeaders, ...headers }

  try {
    console.log(`[API] ${method} ${url}`, body ? { body } : '')
    
    const response = await fetch(url, {
      method,
      headers: finalHeaders,
      body: body ? JSON.stringify(body) : undefined,
    })

    console.log(`[API] Response status: ${response.status} ${response.statusText}`)

    // Intentar parsear la respuesta como JSON
    let data: T | undefined
    const text = await response.text()
    
    if (text) {
      try {
        data = JSON.parse(text) as T
      } catch {
        // Si no es JSON, usar el texto como error
        data = text as unknown as T
      }
    }

    // Si la respuesta no es exitosa, retornar error
    if (!response.ok) {
      let errorMessage: string
      if (typeof data === 'string') {
        errorMessage = data
      } else if (data && typeof data === 'object' && 'error' in data && typeof (data as { error: unknown }).error === 'string') {
        errorMessage = (data as { error: string }).error
      } else {
        errorMessage = `Error ${response.status}: ${response.statusText}`
      }
      console.error(`[API] Error en ${url}:`, errorMessage)
      return {
        error: errorMessage,
        status: response.status,
      }
    }

    return {
      data,
      status: response.status,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error de conexión'
    console.error(`[API] Error de conexión en ${url}:`, errorMessage)

    // Normaliza errores de red del navegador (CORS, backend caído, "Load failed", etc.).
    if (error instanceof TypeError) {
      return {
        error: 'Error de conexión. Verifica que el microservicio esté corriendo y que CORS esté configurado correctamente.',
        status: 0,
      }
    }
    
    return {
      error: errorMessage,
      status: 0,
    }
  }
}

/**
 * Helper para peticiones GET
 */
export async function apiGet<T>(url: string, requiresAuth = false): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, { method: 'GET', requiresAuth })
}

/**
 * Helper para peticiones POST
 */
export async function apiPost<T>(
  url: string,
  body: any,
  requiresAuth = false
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, { method: 'POST', body, requiresAuth })
}

/**
 * Helper para peticiones PUT
 */
export async function apiPut<T>(
  url: string,
  body: any,
  requiresAuth = false
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, { method: 'PUT', body, requiresAuth })
}

/**
 * Helper para peticiones DELETE
 */
export async function apiDelete<T>(url: string, requiresAuth = false): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, { method: 'DELETE', requiresAuth })
}

export async function apiPatch<T>(
  url: string,
  body: unknown,
  requiresAuth = false
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, { method: 'PATCH', body, requiresAuth })
}



