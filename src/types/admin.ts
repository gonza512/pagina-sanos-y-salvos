export type Usuario = {
  id: string
  nombre: string
  correo: string
  telefono: string
  rol: 'cliente' | 'admin'
  fechaRegistro: string
}

export type Producto = {
  id: string
  producto: string
  imagen: string
  precio: number
  stock: number
  categoria: string
  activo: boolean
}

export type Contacto = {
  id: string
  nombre: string
  correo: string
  comentario: string
  fecha: string
  leido: boolean
}

export type AdminStats = {
  totalUsuarios: number
  totalAdmins: number
  totalProductos: number
  totalContactos: number
  contactosNoLeidos: number
  productosBajoStock: number
}

export type AdminSection = 'dashboard' | 'usuarios' | 'productos' | 'contactos' | 'estadisticas'