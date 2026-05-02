import { useState, useEffect, useCallback } from 'react'
import { Usuario, Producto, Contacto, AdminStats } from '../types/admin'
import { iamListUsers, iamPatchUserRole, iamDeleteUser, type IamUserRow } from '../services/iamAdminService'

const adaptIamUsersToAdmin = (rows: IamUserRow[]): Usuario[] =>
  rows.map(u => ({
    id: String(u.id),
    nombre: u.displayName || u.email,
    correo: u.email,
    telefono: u.phone || '',
    rol: (u.role || '').toUpperCase() === 'ADMIN' ? 'admin' : 'cliente',
    fechaRegistro: u.createdAt || new Date().toISOString(),
  }))

export const useAdminData = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [contactos, setContactos] = useState<Contacto[]>([])
  const [loading, setLoading] = useState(true)

  const adaptUsersData = (usersData: any[]): Usuario[] => {
    return usersData.map(user => ({
      id: user.id || `user-${Date.now()}-${Math.random()}`,
      nombre: user.nombre || '',
      correo: user.correo || '',
      telefono: user.telefono || '',
      rol: user.rol || 'cliente',
      fechaRegistro: user.fechaRegistro || new Date().toISOString(),
    }))
  }

  const getDefaultProducts = (): Producto[] => [
    { id: '1', producto: 'Pedigree saco 5kg', imagen: '/assets/img/pedigree.png', precio: 9990, stock: 50, categoria: 'alimento', activo: true },
    { id: '2', producto: 'Juguete para gato', imagen: '/assets/img/juguetegato.jpg', precio: 3000, stock: 25, categoria: 'juguete', activo: true },
    { id: '3', producto: 'Collar para mascota', imagen: '/assets/img/collar.jpg', precio: 2500, stock: 30, categoria: 'accesorio', activo: true },
    { id: '4', producto: 'Cama para perro', imagen: '/assets/img/camaperro.jpg', precio: 15000, stock: 15, categoria: 'cama', activo: true },
  ]

  const refreshIamUsers = useCallback(async (): Promise<boolean> => {
    const raw = localStorage.getItem('auth_user')
    const token = localStorage.getItem('auth_token')
    if (!raw || !token) return false
    const session = JSON.parse(raw) as { rol?: string }
    if (session.rol !== 'admin') return false

    const result = await iamListUsers()
    if (!result.ok) {
      console.warn('IAM usuarios:', result.error)
      return false
    }
    setUsuarios(adaptIamUsersToAdmin(result.data || []))
    return true
  }, [])

  useEffect(() => {
    const loadInitialData = () => {
      try {
        const usuariosData = adaptUsersData(JSON.parse(localStorage.getItem('usuarios') || '[]'))
        const productosData = JSON.parse(localStorage.getItem('productos') || '[]')
        const contactosData = JSON.parse(localStorage.getItem('contactos') || '[]')

        setUsuarios(usuariosData)
        setProductos(productosData.length > 0 ? productosData : getDefaultProducts())
        setContactos(contactosData)
      } catch (error) {
        console.error('Error loading admin data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [])

  useEffect(() => {
    if (loading) return
    void refreshIamUsers()
  }, [loading, refreshIamUsers])

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('usuarios', JSON.stringify(usuarios))
    }
  }, [usuarios, loading])

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('productos', JSON.stringify(productos))
    }
  }, [productos, loading])

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('contactos', JSON.stringify(contactos))
    }
  }, [contactos, loading])

  const estadisticas: AdminStats = {
    totalUsuarios: usuarios.length,
    totalAdmins: usuarios.filter(u => u.rol === 'admin').length,
    totalProductos: productos.length,
    totalContactos: contactos.length,
    contactosNoLeidos: contactos.filter(c => !c.leido).length,
    productosBajoStock: productos.filter(p => p.stock < 10).length,
  }

  const cambiarRolUsuario = async (usuarioId: string, nuevoRol: 'cliente' | 'admin') => {
    const result = await iamPatchUserRole(usuarioId, nuevoRol)
    if (!result.ok) {
      window.alert(result.error || 'No se pudo actualizar el rol')
      await refreshIamUsers()
      return
    }
    await refreshIamUsers()
  }

  const eliminarUsuario = async (usuarioId: string) => {
    const result = await iamDeleteUser(usuarioId)
    if (!result.ok) {
      window.alert(result.error || 'No se pudo eliminar el usuario')
      await refreshIamUsers()
      return
    }
    await refreshIamUsers()
  }

  const agregarProducto = (producto: Omit<Producto, 'id'>) => {
    const nuevoProducto: Producto = {
      ...producto,
      id: Date.now().toString(),
    }
    setProductos(prev => [...prev, nuevoProducto])
  }

  const actualizarProducto = (productoId: string, productoActualizado: Omit<Producto, 'id'>) => {
    setProductos(prev => prev.map(p => (p.id === productoId ? { ...productoActualizado, id: productoId } : p)))
  }

  const eliminarProducto = (productoId: string) => {
    setProductos(prev => prev.filter(producto => producto.id !== productoId))
  }

  const marcarContactoLeido = (contactoId: string) => {
    setContactos(prev => prev.map(contacto => (contacto.id === contactoId ? { ...contacto, leido: true } : contacto)))
  }

  const eliminarContacto = (contactoId: string) => {
    setContactos(prev => prev.filter(contacto => contacto.id !== contactoId))
  }

  return {
    usuarios,
    productos,
    contactos,
    estadisticas,
    loading,
    cambiarRolUsuario,
    eliminarUsuario,
    agregarProducto,
    actualizarProducto,
    eliminarProducto,
    marcarContactoLeido,
    eliminarContacto,
  }
}
