import { useEffect } from 'react'

export const useDefaultAdmin = () => {
  useEffect(() => {
    const initializeDefaultAdmin = () => {
      try {
        const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]')
        
        // Verificar si ya existe el admin por defecto
        const adminExists = usuarios.some((user: any) => 
          user.correo === 'admin@sanos.cl' && user.rol === 'admin'
        )

        if (!adminExists) {
          const defaultAdmin = {
            id: 'default-admin-id',
            nombre: 'Administrador',
            correo: 'admin@sanos.cl',
            telefono: '+56 9 1234 5678',
            contrasena: 'admin123',
            rol: 'admin',
            fechaRegistro: new Date().toISOString()
          }

          const updatedUsers = [defaultAdmin, ...usuarios]
          localStorage.setItem('usuarios', JSON.stringify(updatedUsers))
          console.log('Usuario administrador por defecto creado')
          console.log(' Email: admin@sanos.cl')
          console.log(' Contraseña: admin123')
        }
      } catch (error) {
        console.error('Error creando usuario administrador:', error)
      }
    }

    initializeDefaultAdmin()
  }, [])
}