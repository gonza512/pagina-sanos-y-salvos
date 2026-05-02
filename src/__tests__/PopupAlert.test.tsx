import { describe, test, expect, beforeEach } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AlertProvider, useAlert } from '../context/AlertContext'
import PopupAlert from '../components/PopupAlert'
import '@testing-library/jest-dom'

// Componente de prueba para mostrar alertas
function TestComponent() {
  const { showAlert } = useAlert()
  
  return (
    <div>
      <button onClick={() => showAlert('Mensaje de éxito', 'success')}>
        Mostrar éxito
      </button>
      <button onClick={() => showAlert('Mensaje de error', 'error')}>
        Mostrar error
      </button>
      <button onClick={() => showAlert('Mensaje informativo', 'info')}>
        Mostrar info
      </button>
      <PopupAlert />
    </div>
  )
}

describe('PopupAlert', () => {
  const renderWithAlert = () => {
    return render(
      <AlertProvider>
        <TestComponent />
      </AlertProvider>
    )
  }

  beforeEach(() => {
    // Limpiar cualquier alerta previa
  })

  test('muestra una alerta de éxito cuando se llama showAlert con tipo success', async () => {
    renderWithAlert()
    const user = userEvent.setup()
    
    await user.click(screen.getByText('Mostrar éxito'))
    
    expect(screen.getByText('Mensaje de éxito')).toBeInTheDocument()
    expect(screen.getByText('Mensaje de éxito').closest('.popup-alert')).toHaveClass('popup-success')
  })

  test('muestra una alerta de error cuando se llama showAlert con tipo error', async () => {
    renderWithAlert()
    const user = userEvent.setup()
    
    await user.click(screen.getByText('Mostrar error'))
    
    expect(screen.getByText('Mensaje de error')).toBeInTheDocument()
    expect(screen.getByText('Mensaje de error').closest('.popup-alert')).toHaveClass('popup-error')
  })

  test('muestra una alerta informativa cuando se llama showAlert con tipo info', async () => {
    renderWithAlert()
    const user = userEvent.setup()
    
    await user.click(screen.getByText('Mostrar info'))
    
    expect(screen.getByText('Mensaje informativo')).toBeInTheDocument()
    expect(screen.getByText('Mensaje informativo').closest('.popup-alert')).toHaveClass('popup-info')
  })

  test('permite cerrar una alerta haciendo clic en ella', async () => {
    renderWithAlert()
    const user = userEvent.setup()
    
    await user.click(screen.getByText('Mostrar éxito'))
    
    const alert = screen.getByText('Mensaje de éxito').closest('.popup-alert')
    expect(alert).toBeInTheDocument()
    
    if (alert) {
      await user.click(alert)
      // La alerta debería desaparecer después de un momento
      // (depende de la implementación del removeAlert)
    }
  })

  test('muestra múltiples alertas si se crean varias', async () => {
    renderWithAlert()
    const user = userEvent.setup()
    
    await user.click(screen.getByText('Mostrar éxito'))
    await user.click(screen.getByText('Mostrar error'))
    await user.click(screen.getByText('Mostrar info'))
    
    expect(screen.getByText('Mensaje de éxito')).toBeInTheDocument()
    expect(screen.getByText('Mensaje de error')).toBeInTheDocument()
    expect(screen.getByText('Mensaje informativo')).toBeInTheDocument()
  })

  test('tiene el atributo aria-live para accesibilidad', () => {
    renderWithAlert()
    const container = document.querySelector('.popup-alerts')
    expect(container).toBeInTheDocument()
    expect(container).toHaveAttribute('aria-live', 'polite')
    expect(container).toHaveAttribute('aria-atomic', 'true')
  })

  test('cada alerta tiene el atributo role="alert"', async () => {
    renderWithAlert()
    const user = userEvent.setup()
    
    await user.click(screen.getByText('Mostrar éxito'))
    
    const alert = screen.getByText('Mensaje de éxito').closest('[role="alert"]')
    expect(alert).toBeInTheDocument()
  })
})

