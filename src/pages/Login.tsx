import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useAlert } from '../context/AlertContext'
import { login as loginService } from '../services/authService'

export default function Login() {
  const { login } = useAuth()
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [correoValid, setCorreoValid] = useState<boolean | null>(null)
  const [passValid, setPassValid] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { showAlert } = useAlert()

  const correoRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/i

  const validateCorreo = (value: string) => {
    if (!value) return setCorreoValid(false)
    if (value.length > 100) return setCorreoValid(false)
    setCorreoValid(correoRegex.test(value))
  }

  const validatePass = (value: string) => {
    const len = value.length
    setPassValid(len >= 4 && len <= 128)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    validateCorreo(correo)
    validatePass(contrasena)

    if (!correoRegex.test(correo) || correo.length > 100 || contrasena.length < 4 || contrasena.length > 128) {
      showAlert('Por favor corrige los campos en rojo antes de continuar.', 'error')
      return
    }

    setIsLoading(true)
    try {
      const result = await loginService({ correo, contrasena })
      
      if (result.success && result.user) {
        // Adaptar el rol para soportar tanto formato objeto como string.
        const roleValue =
          typeof result.user.rol === 'string'
            ? result.user.rol.toLowerCase()
            : result.user.rol?.nombre?.toLowerCase() || 'cliente'
        const rolMapeado = roleValue === 'administrativo' || roleValue === 'admin' ? 'admin' : 'cliente'
        
        const user = {
          nombre: result.user.nombre,
          correo: result.user.correo,
          rol: rolMapeado as 'cliente' | 'admin',
          id: result.user.id,
          apellido: result.user.apellido,
          telefono: result.user.telefono,
        }
        login(user, result.token)
        showAlert(`Inicio de sesión exitoso. Bienvenido ${result.user.nombre}`, 'success')
        navigate('/')
      } else {
        showAlert(result.error || 'Credenciales inválidas. Verifica tus datos o regístrate.', 'error')
      }
    } catch (error) {
      showAlert('Error de conexión. Verifica que los microservicios estén corriendo.', 'error')
      console.error('Error en login:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="main-article">
      <h1 className="main-title">Iniciar sesión</h1>
      <form onSubmit={handleSubmit} id="loginForm">
        <label htmlFor="correo" className="main-text">Correo</label>
        <input
          className={`input-contacto ${correoValid === false ? 'is-invalid' : correoValid === true ? 'is-valid' : ''}`}
          value={correo}
          onChange={e => { setCorreo(e.target.value); validateCorreo(e.target.value) }}
          id="correo"
          maxLength={100}
          placeholder="usuario@ejemplo.com"
          aria-describedby="correo-validation"
        />
        {correoValid === false && <div id="correo-validation" className="invalid-feedback">Correo inválido (máx 100 caracteres).</div>}
        {correoValid === true && <div id="correo-validation" className="valid-feedback">Correo válido.</div>}

        <label htmlFor="contrasena" className="main-text">Contraseña</label>
        <input
          className={`input-contacto ${passValid === false ? 'is-invalid' : passValid === true ? 'is-valid' : ''}`}
          type="password"
          value={contrasena}
          onChange={e => { setContrasena(e.target.value); validatePass(e.target.value) }}
          id="contrasena"
          maxLength={128}
          aria-describedby="password-validation"
        />
        {passValid === false && <div id="password-validation" className="invalid-feedback">La contraseña debe tener entre 4 y 128 caracteres.</div>}
        {passValid === true && <div id="password-validation" className="valid-feedback">Contraseña válida.</div>}

        <button className="btn-custom" type="submit" disabled={isLoading}>
          {isLoading ? 'Iniciando sesión...' : 'Entrar'}
        </button>
      </form>
    </section>
  )
}

