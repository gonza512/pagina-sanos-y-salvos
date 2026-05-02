/**
 * Gateway microservicios. En `npm run dev`, si no defines VITE_API_GATEWAY_URL, se usa URL relativa
 * y Vite reenvía `/api` al proxy (vite.config.ts → localhost:8080).
 */
const envGateway = (import.meta.env.VITE_API_GATEWAY_URL as string | undefined)?.trim()
const gatewayBase =
  envGateway && envGateway.length > 0
    ? envGateway
    : import.meta.env.DEV
      ? ''
      : 'http://localhost:8080'

export const API_CONFIG = {
  GATEWAY: gatewayBase,

  // Por defecto todo pasa por el mismo gateway; opcional: URLs directas en .env.local
  REPORTES: import.meta.env.VITE_API_REPORTES_URL || gatewayBase,
  GEOLOCALIZACION: import.meta.env.VITE_API_GEOLOCALIZACION_URL || gatewayBase,
  COINCIDENCIAS: import.meta.env.VITE_API_COINCIDENCIAS_URL || gatewayBase,
  USUARIOS: import.meta.env.VITE_API_USUARIOS_URL || gatewayBase,
  MASCOTAS: import.meta.env.VITE_API_MASCOTAS_URL || gatewayBase,
  CONSULTAS: import.meta.env.VITE_API_CONSULTAS_URL || gatewayBase,
  RESENAS: import.meta.env.VITE_API_RESENAS_URL || gatewayBase,
} as const

/**
 * Construye la URL completa para un endpoint
 * @param baseUrl - URL base del microservicio
 * @param path - Ruta del endpoint (ej: '/api/usuarios')
 * @returns URL completa
 */
export const buildApiUrl = (baseUrl: string, path: string): string => {
  // Asegurar que el path comience con /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  // Remover / al final de la baseUrl si existe
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  return `${normalizedBase}${normalizedPath}`
}



