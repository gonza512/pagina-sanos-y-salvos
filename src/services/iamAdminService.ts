/**
 * Operaciones de administración IAM (requieren JWT de usuario con rol ADMIN en el token).
 */
import { API_CONFIG, buildApiUrl } from '../config/api.config'

export type IamUserRow = {
  id: number
  email: string
  displayName: string
  phone?: string
  role: string
  createdAt?: string
}

const authHeaders = (): HeadersInit => {
  const token = localStorage.getItem('auth_token')
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) h.Authorization = `Bearer ${token}`
  return h
}

async function readError(res: Response): Promise<string> {
  try {
    const data = await res.json()
    if (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string') {
      return data.error
    }
  } catch {
    // ignore
  }
  return `Error ${res.status}`
}

export async function iamListUsers(): Promise<{ ok: boolean; data?: IamUserRow[]; error?: string }> {
  const res = await fetch(buildApiUrl(API_CONFIG.USUARIOS, '/api/iam/users'), {
    headers: authHeaders(),
  })
  if (!res.ok) {
    return { ok: false, error: await readError(res) }
  }
  const rows = (await res.json()) as IamUserRow[]
  return { ok: true, data: Array.isArray(rows) ? rows : [] }
}

export async function iamPatchUserRole(
  userId: string,
  rol: 'cliente' | 'admin'
): Promise<{ ok: boolean; error?: string }> {
  const role = rol === 'admin' ? 'ADMIN' : 'CITIZEN'
  const res = await fetch(buildApiUrl(API_CONFIG.USUARIOS, `/api/iam/users/${userId}/role`), {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ role }),
  })
  if (!res.ok) {
    return { ok: false, error: await readError(res) }
  }
  return { ok: true }
}

export async function iamDeleteUser(userId: string): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch(buildApiUrl(API_CONFIG.USUARIOS, `/api/iam/users/${userId}`), {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) {
    return { ok: false, error: await readError(res) }
  }
  return { ok: true }
}
