import { describe, test, expect, beforeEach, vi } from 'vitest'
import React from 'react'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider, useAuth } from '../context/AuthContext'
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

// Componente de prueba para usar el hook
function TestComponent() {
  const { user, login, logout } = useAuth()
  
  return (
    <div>
      <div data-testid="user">{user ? `${user.nombre} (${user.rol})` : 'No user'}</div>
      <button onClick={() => login({ nombre: 'Test', correo: 'test@gmail.com', rol: 'cliente' })}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  const renderWithAuth = () => {
    return render(
      <MemoryRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MemoryRouter>
    )
  }

  beforeEach(() => {
    localStorage.clear()
    mockNavigate.mockClear()
    vi.clearAllMocks()
  })

  test('inicializa sin usuario cuando no hay datos en localStorage', () => {
    renderWithAuth()
    expect(screen.getByTestId('user')).toHaveTextContent('No user')
  })

  test('restaura el usuario desde localStorage al inicializar', () => {
    const storedUser = { nombre: 'Stored User', correo: 'stored@gmail.com', rol: 'cliente' }
    localStorage.setItem('auth_user', JSON.stringify(storedUser))
    
    renderWithAuth()
    expect(screen.getByTestId('user')).toHaveTextContent('Stored User (cliente)')
  })

  test('guarda el usuario en localStorage al hacer login', async () => {
    renderWithAuth()
    const user = userEvent.setup()
    
    await act(async () => {
      await user.click(screen.getByText('Login'))
    })
    
    expect(screen.getByTestId('user')).toHaveTextContent('Test (cliente)')
    
    const stored = localStorage.getItem('auth_user')
    expect(stored).toBeTruthy()
    if (stored) {
      const parsed = JSON.parse(stored)
      expect(parsed.nombre).toBe('Test')
      expect(parsed.correo).toBe('test@gmail.com');
      expect(parsed.rol).toBe('cliente')
    }
  })

  test('guarda datos adicionales en localStorage al hacer login', async () => {
    renderWithAuth()
    const user = userEvent.setup()
    
    await act(async () => {
      await user.click(screen.getByText('Login'))
    })
    
    expect(localStorage.getItem('isLoggedIn')).toBe('true')
    expect(localStorage.getItem('nombre')).toBe('Test')
    expect(localStorage.getItem('correo')).toBe('test@gmail.com');
    expect(localStorage.getItem('rol')).toBe('cliente')
  })

  test('limpia el usuario y localStorage al hacer logout', async () => {
    // Primero hacer login
    const storedUser = { nombre: 'Test User', correo: 'test@gmail.com', rol: 'cliente' }
    localStorage.setItem('auth_user', JSON.stringify(storedUser))
    localStorage.setItem('isLoggedIn', 'true')
    localStorage.setItem('nombre', 'Test User')
    localStorage.setItem('correo', 'test@gmail.com')
    localStorage.setItem('rol', 'cliente')
    
    renderWithAuth()
    const user = userEvent.setup()
    
    await act(async () => {
      await user.click(screen.getByText('Logout'))
    })
    
    expect(screen.getByTestId('user')).toHaveTextContent('No user')
    expect(localStorage.getItem('auth_user')).toBeNull()
    expect(localStorage.getItem('isLoggedIn')).toBeNull()
    expect(localStorage.getItem('nombre')).toBeNull()
    expect(localStorage.getItem('correo')).toBeNull()
    expect(localStorage.getItem('rol')).toBeNull()
  })

  test('navega a /login después de hacer logout', async () => {
    const storedUser = { nombre: 'Test User', correo: 'test@gmail.com', rol: 'cliente' }
    localStorage.setItem('auth_user', JSON.stringify(storedUser))
    
    renderWithAuth()
    const user = userEvent.setup()
    
    await act(async () => {
      await user.click(screen.getByText('Logout'))
    })
    
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })
})

