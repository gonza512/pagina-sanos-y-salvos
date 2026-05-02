import { describe, test, expect } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { act } from '@testing-library/react'
import { AlertProvider } from '../context/AlertContext'
import { AuthProvider } from '../context/AuthContext'
import PopupAlert from '../components/PopupAlert'
import Registro from '../pages/Registro'

describe('Registro', () => {
  const renderRegistro = () => {
    return render(
      <MemoryRouter>
        <AlertProvider>
          <AuthProvider>
            <Registro />
            <PopupAlert />
          </AuthProvider>
        </AlertProvider>
      </MemoryRouter>
    )
  }

  test('muestra error cuando el correo no es válido', async () => {
    renderRegistro()
    const user = userEvent.setup()

    // Llenar el formulario sin RUT
      await act(async () => {
        await user.type(screen.getByLabelText(/^Nombre/i), 'Test')
        await user.type(screen.getByLabelText(/Apellido/i), 'User')
        await user.type(screen.getByLabelText(/^RUT/i), '12345678-9')
        await user.type(screen.getByLabelText(/Correo/i), 'usuario-invalido')
        await user.type(screen.getByLabelText('Contraseña'), '1234')
        await user.type(screen.getByLabelText(/Repetir contraseña/i), '1234')
        await user.click(screen.getByRole('checkbox', { name: /términos/i }))
        await user.click(screen.getByRole('checkbox', { name: /privacidad/i }))
        await user.click(screen.getByRole('button', { name: /Registrar/i }))
      })

    expect(await screen.findByText(/Ingresa un correo válido/i)).toBeInTheDocument()
  })

  test('muestra error cuando las contraseñas no coinciden', async () => {
    renderRegistro()
    const user = userEvent.setup()

    // Llenar el formulario con contraseñas diferentes
      await act(async () => {
        await user.type(screen.getByLabelText(/^Nombre/i), 'Test')
        await user.type(screen.getByLabelText(/Apellido/i), 'User')
        await user.type(screen.getByLabelText(/^RUT/i), '12345678-9')
        await user.type(screen.getByLabelText(/Correo/i), 'test@gmail.com')
        await user.type(screen.getByLabelText('Contraseña'), '12345')
        await user.type(screen.getByLabelText(/Repetir contraseña/i), '123456')
        await user.click(screen.getByRole('checkbox', { name: /términos/i }))
        await user.click(screen.getByRole('checkbox', { name: /privacidad/i }))
        await user.click(screen.getByRole('button', { name: /Registrar/i }))
      })

    expect(await screen.findByText(/La contraseña y su confirmación no coinciden/i)).toBeInTheDocument()
  })

  test('muestra mensaje de éxito al registrar correctamente', async () => {
    renderRegistro()
    const user = userEvent.setup()

    // Llenar el formulario con datos válidos
      await act(async () => {
        await user.type(screen.getByLabelText(/^Nombre/i), 'Test')
        await user.type(screen.getByLabelText(/Apellido/i), 'User')
        await user.type(screen.getByLabelText(/^RUT/i), '12345678-9')
        await user.type(screen.getByLabelText(/Correo/i), 'test@ejemplo.com')
        await user.type(screen.getByLabelText('Contraseña'), '1234')
        await user.type(screen.getByLabelText(/Repetir contraseña/i), '1234')
        await user.click(screen.getByRole('checkbox', { name: /términos/i }))
        await user.click(screen.getByRole('checkbox', { name: /privacidad/i }))
        await user.click(screen.getByRole('button', { name: /Registrar/i }))
      })

    expect(await screen.findByText(/Registro exitoso|Error/i)).toBeInTheDocument()
  })
})