import { describe, test, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { AuthContext } from '../context/AuthContext'
import '@testing-library/jest-dom'

const mockNavigate = vi.fn()

// Mock react-router-dom
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal() as typeof import('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    MemoryRouter: actual.MemoryRouter,
  }
})

describe('Navbar', () => {
  const mockLogout = vi.fn()
  
  const renderNavbar = (user: { nombre: string; correo: string; rol: string } | null = null) => {
    const authValue = {
      user,
      login: vi.fn(),
      logout: mockLogout,
    }
    
    return render(
      <MemoryRouter>
        <AuthContext.Provider value={authValue}>
          <Navbar />
        </AuthContext.Provider>
      </MemoryRouter>
    )
  }

  beforeEach(() => {
    mockNavigate.mockClear()
    mockLogout.mockClear()
    vi.clearAllMocks()
  })

  test('muestra el logo Sanos y Salvos', () => {
    renderNavbar()
    expect(screen.getByText('Sanos y Salvos')).toBeInTheDocument()
  })

  test('muestra botones de Inicio de sesion y Registro cuando el usuario no esta autenticado', () => {
    renderNavbar(null)
    expect(screen.getByText('Iniciar sesion')).toBeInTheDocument()
    expect(screen.getByText('Registrate')).toBeInTheDocument()
    expect(screen.queryByText('Cerrar sesion')).not.toBeInTheDocument()
  })

  test('muestra botones de sesion y funciones privadas cuando el usuario esta autenticado', () => {
    const user = { nombre: 'Test User', correo: 'test@gmail.com', rol: 'cliente' }
    renderNavbar(user)
    expect(screen.getByText('Cerrar sesion')).toBeInTheDocument()
    expect(screen.getByText('Mi cuenta')).toBeInTheDocument()
    expect(screen.getByText('Publica tu Mascota')).toBeInTheDocument()
    expect(screen.queryByText('Iniciar sesion')).not.toBeInTheDocument()
    expect(screen.queryByText('Registrate')).not.toBeInTheDocument()
  })

  test('muestra botón de Admin cuando el usuario es administrador', () => {
    const adminUser = { nombre: 'Admin', correo: 'admin@gmail.com', rol: 'admin' }
    renderNavbar(adminUser)
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  test('no muestra botón de Admin cuando el usuario no es administrador', () => {
    const user = { nombre: 'Test User', correo: 'test@gmail.com', rol: 'cliente' }
    renderNavbar(user)
    expect(screen.queryByText('Admin')).not.toBeInTheDocument()
  })

  test('navega a la ruta correcta al hacer clic en un botón de navegación', async () => {
    renderNavbar()
    const user = userEvent.setup()
    
    await user.click(screen.getByText('Inicio'))
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  test('llama a logout cuando se hace clic en Cerrar sesion', async () => {
    const user = { nombre: 'Test User', correo: 'test@gmail.com', rol: 'cliente' }
    renderNavbar(user)
    const userEventInstance = userEvent.setup()
    
    await userEventInstance.click(screen.getByText('Cerrar sesion'))
    expect(mockLogout).toHaveBeenCalledTimes(1)
  })

  test('abre y cierra el menú hamburguesa en móviles', async () => {
    renderNavbar()
    const user = userEvent.setup()
    const menuToggle = screen.getByLabelText('Toggle menu')
    
    // El menú debe estar cerrado inicialmente
    expect(menuToggle).toHaveAttribute('aria-expanded', 'false')
    
    // Abrir el menú
    await user.click(menuToggle)
    expect(menuToggle).toHaveAttribute('aria-expanded', 'true')
    
    // Cerrar el menú
    await user.click(menuToggle)
    expect(menuToggle).toHaveAttribute('aria-expanded', 'false')
  })

  test('muestra botones publicos y oculta privados sin sesion', () => {
    renderNavbar()
    expect(screen.getByText('Inicio')).toBeInTheDocument()
    expect(screen.getByText('Quienes Somos')).toBeInTheDocument()
    expect(screen.getByText('Contactanos')).toBeInTheDocument()
    expect(screen.queryByText('Publica tu Mascota')).not.toBeInTheDocument()
    expect(screen.queryByText('Mapa por Region')).not.toBeInTheDocument()
    expect(screen.queryByText('Coincidencias')).not.toBeInTheDocument()
  })
})



