/**
 * Tipos TypeScript para los modelos de los microservicios
 */

// ==================== USUARIOS ====================
export interface Usuario {
  id?: number
  rut: string
  nombre: string
  apellido: string
  correo: string
  telefono: string
  contrasena?: string
  rol: Rol | string
}

export interface Rol {
  id: number
  nombre: string
}

export interface LoginRequest {
  correo: string
  contrasena: string
}

export interface RegisterRequest {
  rut: string
  nombre: string
  apellido: string
  correo: string
  telefono: string
  contrasena: string
  rolNombre: string
  /** Comuna de residencia (IAM); por defecto se envía Santiago si se omite */
  comuna?: string
  direccion?: string
  acceptedTerms: boolean
  acceptedPrivacyPolicy: boolean
}

export interface ChangePasswordRequest {
  /** Opcional; el IAM usa solo el JWT */
  correo?: string
  actualContrasena: string
  nuevaContrasena: string
}

// ==================== MASCOTAS ====================
export interface Mascota {
  id?: number
  idCliente: number
  nombre: string
  especie: string
  raza: string
  edad: number
}

// ==================== CONSULTAS ====================
export interface Consulta {
  id?: number
  idMascota: number
  idVeterinario: number
  idCliente: number
  fecha: string
  motivo: string
  diagnostico?: string
  tratamiento?: string
}

// ==================== RESEÑAS ====================
export interface Resena {
  id?: number
  idCliente: number
  idVeterinario: number
  calificacion: number
  comentario: string
}


export interface Producto {
  id?: number
  nombre: string
  precio?: number
  stock?: number
  imagen?: string
}



