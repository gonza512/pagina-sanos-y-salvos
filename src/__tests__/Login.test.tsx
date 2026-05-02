import { describe, test, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Login from '../pages/Login'
import '@testing-library/jest-dom'

let mockLogin: any
let mockShowAlert: any
let mockNavigate = vi.fn()
let mockLoginService: any

// Mock react-router
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal() as typeof import('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    MemoryRouter: actual.MemoryRouter,
  }
})

// Mock AuthContext (usa el hook useAuth)
vi.mock('../context/AuthContext', async (importOriginal) => {
  const actual = await importOriginal() as typeof import('../context/AuthContext')
  return {
    ...actual,
    useAuth: () => ({
      login: mockLogin,
      user: null
    }),
  }
})

// Mock AlertContext
vi.mock('../context/AlertContext', async (importOriginal) => {
  const actual = await importOriginal() as typeof import('../context/AlertContext')
  return {
    ...actual,
    useAlert: () => ({
      showAlert: mockShowAlert,
      alerts: [],
    }),
  }
})

vi.mock('../services/authService', () => ({
  login: (...args: any[]) => mockLoginService(...args),
}))

describe('Login', () => { 
  const renderLogin = () => render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  )

  beforeEach(() => {
    localStorage.clear()
    mockLogin = vi.fn()
    mockShowAlert = vi.fn()
    mockLoginService = vi.fn()
    mockNavigate.mockClear()
    vi.clearAllMocks()
  })

  test('al enviar credenciales vacías, muestra alerta de error de validación', async () => {
    renderLogin()
    const user = userEvent.setup()

    await act(async () => {
      await user.click(screen.getByRole('button', { name: /Entrar/i }))
    })

    expect(mockLogin).not.toHaveBeenCalled()
    expect(mockShowAlert).toHaveBeenCalledWith(
      'Por favor corrige los campos en rojo antes de continuar.',
      'error'
    )
  })

  test('muestra mensaje de éxito al iniciar sesión correctamente', async () => {
    const testUser = {
      id: '1',
      nombre: 'Test User',
      correo: 'test@gmail.com',
      contrasena: '12345',
      apellido: '',
      telefono: '',
      rol: 'cliente'
    }
    mockLoginService.mockResolvedValue({
      success: true,
      token: 'fake-jwt-token',
      user: testUser,
    })

    renderLogin()
    const user = userEvent.setup()

    await act(async () => {
      await user.type(screen.getByLabelText(/Correo/i), testUser.correo)
      await user.type(screen.getByLabelText(/Contraseña/i), testUser.contrasena)
      await user.click(screen.getByRole('button', { name: /Entrar/i }))
    })

    await waitFor(() => {
      expect(mockShowAlert).toHaveBeenCalledWith(
        `Inicio de sesión exitoso. Bienvenido ${testUser.nombre}`,
        'success'
      )
    })

    expect(mockLogin).toHaveBeenCalledWith(
      expect.objectContaining({ nombre: testUser.nombre, correo: testUser.correo }),
      'fake-jwt-token'
    )
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  test('valida formato de correo electrónico y muestra feedback de UI', async () => {
    renderLogin()
    const user = userEvent.setup()

    await act(async () => {
      await user.type(screen.getByLabelText(/Correo/i), 'correo_invalido')
      await user.type(screen.getByLabelText(/Contraseña/i), '12345')
      await user.click(screen.getByRole('button', { name: /Entrar/i }))
    })

    expect(screen.getByText(/Correo inválido/i)).toBeInTheDocument()
    expect(mockShowAlert).toHaveBeenCalledWith(
      'Por favor corrige los campos en rojo antes de continuar.',
      'error'
    )
  })
})
