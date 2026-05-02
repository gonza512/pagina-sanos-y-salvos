/**
 * Autenticación contra IAM del ecosistema microservicios (POST /api/iam/* vía gateway).
 */
import { buildApiUrl, API_CONFIG } from '../config/api.config'
import { apiPost, apiGet } from './apiClient'
import type { ChangePasswordRequest, LoginRequest, RegisterRequest, Usuario } from '../types/api.types'

const IAM_LOGIN = '/api/iam/login'
const IAM_REGISTER = '/api/iam/register'
const IAM_USERS = '/api/iam/users'

type IamLoginResponse = {
  token: string
  id: number
  email: string
  displayName: string
  role: string
}

type IamUserDto = {
  id: number
  email: string
  displayName: string
  rut: string
  commune: string
  address: string
  phone: string
  emergencyContactName: string
  emergencyContactPhone: string
  role: string
  createdAt: string
}

type AppRol = 'administrativo' | 'CLIENTE'

const mapIamRoleToUsuarioRol = (role: string | undefined): AppRol | string => {
  const r = (role || 'CITIZEN').toUpperCase()
  if (r === 'ADMIN') return 'administrativo'
  return 'CLIENTE'
}

const splitDisplayName = (displayName: string | undefined, fallbackEmail: string) => {
  const raw = (displayName || '').trim() || fallbackEmail.split('@')[0] || 'Usuario'
  const parts = raw.split(/\s+/)
  return { nombre: parts[0] || raw, apellido: parts.slice(1).join(' ') || '' }
}

const loginResponseToUsuario = (data: IamLoginResponse): Usuario => {
  const { nombre, apellido } = splitDisplayName(data.displayName, data.email)
  return {
    id: data.id,
    rut: '',
    nombre,
    apellido,
    correo: data.email,
    telefono: '',
    rol: mapIamRoleToUsuarioRol(data.role),
  }
}

const userDtoToUsuario = (dto: IamUserDto): Usuario => {
  const { nombre, apellido } = splitDisplayName(dto.displayName, dto.email)
  return {
    id: dto.id,
    rut: dto.rut || '',
    nombre,
    apellido,
    correo: dto.email,
    telefono: dto.phone || '',
    rol: mapIamRoleToUsuarioRol(dto.role),
  }
}

const mapAppRoleToIam = (rolNombre: string | undefined) => {
  const r = (rolNombre || 'CITIZEN').toUpperCase()
  if (r === 'CLIENTE' || r === 'CITIZEN') return 'CITIZEN'
  if (r === 'ADMINISTRATIVO' || r === 'ADMIN') return 'ADMIN'
  return 'CITIZEN'
}

/**
 * Inicia sesión con correo y contraseña
 */
export const login = async (
  credentials: LoginRequest
): Promise<{ success: boolean; user?: Usuario; token?: string; error?: string }> => {
  const url = buildApiUrl(API_CONFIG.USUARIOS, IAM_LOGIN)
  const response = await apiPost<IamLoginResponse>(url, {
    email: credentials.correo.trim().toLowerCase(),
    password: credentials.contrasena,
  })

  if (response.error) {
    return { success: false, error: response.error }
  }

  if (response.status === 200 && response.data?.token) {
    const user = loginResponseToUsuario(response.data)
    return { success: true, user, token: response.data.token }
  }

  return { success: false, error: 'Credenciales inválidas' }
}

/**
 * Registra un nuevo usuario (contrato IAM RegisterRequest)
 */
export const register = async (
  userData: RegisterRequest
): Promise<{ success: boolean; user?: Usuario; error?: string }> => {
  const url = buildApiUrl(API_CONFIG.USUARIOS, IAM_REGISTER)
  const fullName = `${userData.nombre} ${userData.apellido}`.trim()
  const emergencyName = fullName
  const emergencyPhone = userData.telefono?.trim() || '+56900000000'

  const payload = {
    fullName,
    rutDocument: userData.rut.trim(),
    email: userData.correo.trim().toLowerCase(),
    password: userData.contrasena,
    displayName: userData.nombre.trim(),
    commune: (userData.comuna || 'Santiago').trim(),
    phone: userData.telefono?.trim() || '+56900000000',
    address: (userData.direccion || 'Por confirmar').trim(),
    emergencyContactName: emergencyName,
    emergencyContactPhone: emergencyPhone,
    acceptedTerms: userData.acceptedTerms,
    acceptedPrivacyPolicy: userData.acceptedPrivacyPolicy,
    role: mapAppRoleToIam(userData.rolNombre),
  }

  const response = await apiPost<IamUserDto>(url, payload)

  if (response.error) {
    console.error('Error en registro:', response.error, 'Status:', response.status)
    return { success: false, error: response.error }
  }

  if (response.data) {
    return { success: true, user: userDtoToUsuario(response.data) }
  }

  return { success: false, error: 'Error al registrar usuario' }
}

/**
 * Obtiene un usuario por correo (lista IAM y filtra en cliente)
 */
export const getUsuarioByCorreo = async (correo: string): Promise<{ data?: Usuario; error?: string }> => {
  const all = await getAllUsuarios()
  if (all.error) return { error: all.error }
  const found = all.data?.find(u => u.correo.toLowerCase() === correo.trim().toLowerCase())
  return found ? { data: found } : { error: 'No encontrado' }
}

/**
 * Obtiene un usuario por RUT
 */
export const getUsuarioByRut = async (rut: string): Promise<{ data?: Usuario; error?: string }> => {
  const all = await getAllUsuarios()
  if (all.error) return { error: all.error }
  const normalized = rut.trim().replace(/\./g, '').toUpperCase()
  const found = all.data?.find(u => u.rut.replace(/\./g, '').toUpperCase() === normalized)
  return found ? { data: found } : { error: 'No encontrado' }
}

/**
 * Obtiene todos los usuarios (requiere JWT de admin en gateway)
 */
export const getAllUsuarios = async (): Promise<{ data?: Usuario[]; error?: string }> => {
  const url = buildApiUrl(API_CONFIG.USUARIOS, IAM_USERS)
  const response = await apiGet<IamUserDto[]>(url, true)

  if (response.error) {
    return { error: response.error }
  }

  return { data: (response.data || []).map(userDtoToUsuario) }
}

/**
 * Crea usuario (delega en registro IAM con contraseña por defecto si aplica)
 */
export const createUsuario = async (usuario: Omit<Usuario, 'id'>): Promise<{ data?: Usuario; error?: string }> => {
  const url = buildApiUrl(API_CONFIG.USUARIOS, IAM_REGISTER)
  const fullName = `${usuario.nombre} ${usuario.apellido || ''}`.trim() || usuario.nombre
  const response = await apiPost<IamUserDto>(url, {
    fullName,
    rutDocument: usuario.rut?.trim() || `99${Date.now()}`.slice(0, 8) + '-K',
    email: usuario.correo.trim().toLowerCase(),
    password: usuario.contrasena || 'Temporal#1',
    commune: 'Santiago',
    phone: usuario.telefono?.trim() || '+56900000000',
    address: 'Por confirmar',
    emergencyContactName: fullName,
    emergencyContactPhone: usuario.telefono?.trim() || '+56900000000',
    acceptedTerms: true,
    acceptedPrivacyPolicy: true,
    role: mapAppRoleToIam(typeof usuario.rol === 'string' ? usuario.rol : 'CITIZEN'),
  })

  if (response.error) {
    return { error: response.error }
  }

  return response.data ? { data: userDtoToUsuario(response.data) } : { error: 'Error al crear usuario' }
}

/**
 * Cambio de contraseña: POST /api/iam/change-password (JWT + contraseña actual).
 */
export const changePassword = async (payload: ChangePasswordRequest): Promise<{ success: boolean; error?: string }> => {
  const url = buildApiUrl(API_CONFIG.USUARIOS, '/api/iam/change-password')
  const response = await apiPost<{ ok: boolean }>(
    url,
    {
      currentPassword: payload.actualContrasena,
      newPassword: payload.nuevaContrasena,
    },
    true
  )

  if (response.error) {
    return { success: false, error: response.error }
  }

  if (response.data && typeof response.data === 'object' && 'ok' in response.data && response.data.ok) {
    return { success: true }
  }

  return { success: false, error: 'No fue posible cambiar la contraseña' }
}
