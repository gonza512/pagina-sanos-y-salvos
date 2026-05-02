import { describe, test, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
import { AuthContext } from '../context/AuthContext'
import '@testing-library/jest-dom'

const mockNavigate = vi.fn()

// Mock react-router-dom
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal() as typeof import('react-router-dom')
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate">Redirecting to {to}</div>,
    MemoryRouter: actual.MemoryRouter,
  }
})

describe('ProtectedRoute', () => {
  const TestComponent = () => <div>Protected Content</div>

  const renderProtectedRoute = (user: { nombre: string; correo: string; rol: string } | null = null) => {
    const authValue = {
      user,
      login: vi.fn(),
      logout: vi.fn(),
    }
    
    return render(
      <MemoryRouter>
        <AuthContext.Provider value={authValue}>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </AuthContext.Provider>
      </MemoryRouter>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('permite el acceso cuando el usuario es administrador', () => {
    const adminUser = { nombre: 'Admin', correo: 'admin@gmail.com', rol: 'admin' }
    renderProtectedRoute(adminUser)
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument()
  })

  test('redirige a login cuando el usuario no está autenticado', () => {
    renderProtectedRoute(null)
    expect(screen.getByTestId('navigate')).toBeInTheDocument()
    expect(screen.getByText('Redirecting to /login')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  test('redirige a login cuando el usuario no es administrador', () => {
    const regularUser = { nombre: 'User', correo: 'user@gmail.com', rol: 'cliente' }
    renderProtectedRoute(regularUser)
    expect(screen.getByTestId('navigate')).toBeInTheDocument()
    expect(screen.getByText('Redirecting to /login')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  test('solo permite acceso a usuarios con rol admin', () => {
    const adminUser = { nombre: 'Admin', correo: 'admin@gmail.com', rol: 'admin' }
    const { rerender } = renderProtectedRoute(adminUser)
    expect(screen.getByText('Protected Content')).toBeInTheDocument()

    // Cambiar a usuario regular
    const regularUser = { nombre: 'User', correo: 'user@gmail.com', rol: 'cliente' }
    const authValue = {
      user: regularUser,
      login: vi.fn(),
      logout: vi.fn(),
    }
    
    rerender(
      <MemoryRouter>
        <AuthContext.Provider value={authValue}>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </AuthContext.Provider>
      </MemoryRouter>
    )
    
    expect(screen.getByTestId('navigate')).toBeInTheDocument()
  })
})



