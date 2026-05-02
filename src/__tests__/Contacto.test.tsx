import { describe, test, expect, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Contacto from '../pages/Contacto'
import '@testing-library/jest-dom'

describe('Contacto', () => {
  const renderContacto = () => {
    return render(
      <MemoryRouter>
        <Contacto />
      </MemoryRouter>
    )
  }

  beforeEach(() => {
    localStorage.clear()
  })

  test('muestra el título de la página', () => {
    renderContacto()
    expect(screen.getByText('Contacto')).toBeInTheDocument()
  })

  test('muestra todos los campos del formulario', () => {
    renderContacto()
    expect(screen.getByText(/Nombre:/i)).toBeInTheDocument()
    expect(screen.getByText(/Correo:/i)).toBeInTheDocument()
    expect(screen.getByText(/Comentario:/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Enviar/i })).toBeInTheDocument()
    expect(document.getElementById('nombre')).toBeInTheDocument()
    expect(document.getElementById('correo')).toBeInTheDocument()
    expect(document.getElementById('comentario')).toBeInTheDocument()
  })

  test('muestra información de contacto', () => {
    renderContacto()
    expect(screen.getByText(/Información de contacto/i)).toBeInTheDocument()
    expect(screen.getByText(/Dirección:/i)).toBeInTheDocument()
    expect(screen.getByText(/Teléfono:/i)).toBeInTheDocument()
    expect(screen.getByText(/Email:/i)).toBeInTheDocument()
  })

  test('muestra error cuando se envía el formulario vacío', async () => {
    renderContacto()
    const user = userEvent.setup()
    
    const submitButton = screen.getByRole('button', { name: /Enviar/i })
    await user.click(submitButton)
    
    // El formulario HTML5 required previene el submit, pero verificamos que el mensaje aparece
    // cuando se intenta enviar sin datos
    await waitFor(() => {
      const mensajeDiv = document.querySelector('.mensaje-error')
      expect(mensajeDiv).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  test('guarda el mensaje en localStorage al enviar correctamente', async () => {
    renderContacto()
    const user = userEvent.setup()
    
    const nombreInput = document.getElementById('nombre') as HTMLInputElement
    const correoInput = document.getElementById('correo') as HTMLInputElement
    const comentarioInput = document.getElementById('comentario') as HTMLTextAreaElement
    
    await user.type(nombreInput, 'Juan Pérez')
    await user.type(correoInput, 'juan@example.com')
    await user.type(comentarioInput, 'Mensaje de prueba')
    await user.click(screen.getByRole('button', { name: /Enviar/i }))
    
    await waitFor(() => {
      expect(screen.getByText('Mensaje enviado. Gracias!')).toBeInTheDocument()
    })
    
    const contactos = JSON.parse(localStorage.getItem('contactos') || '[]')
    expect(contactos).toHaveLength(1)
    expect(contactos[0].nombre).toBe('Juan Pérez')
    expect(contactos[0].correo).toBe('juan@example.com')
    expect(contactos[0].comentario).toBe('Mensaje de prueba')
    expect(contactos[0].fecha).toBeDefined()
  })

  test('limpia los campos después de enviar el formulario', async () => {
    renderContacto()
    const user = userEvent.setup()
    
    const nombreInput = document.getElementById('nombre') as HTMLInputElement
    const correoInput = document.getElementById('correo') as HTMLInputElement
    const comentarioInput = document.getElementById('comentario') as HTMLTextAreaElement
    
    await user.type(nombreInput, 'Juan Pérez')
    await user.type(correoInput, 'juan@example.com')
    await user.type(comentarioInput, 'Mensaje de prueba')
    await user.click(screen.getByRole('button', { name: /Enviar/i }))
    
    await waitFor(() => {
      expect(nombreInput.value).toBe('')
      expect(correoInput.value).toBe('')
      expect(comentarioInput.value).toBe('')
    })
  })

  test('respeta el maxLength de los campos', () => {
    renderContacto()
    
    const nombreInput = document.getElementById('nombre') as HTMLInputElement
    const correoInput = document.getElementById('correo') as HTMLInputElement
    const comentarioInput = document.getElementById('comentario') as HTMLTextAreaElement
    
    expect(nombreInput).toHaveAttribute('maxLength', '100')
    expect(correoInput).toHaveAttribute('maxLength', '100')
    expect(comentarioInput).toHaveAttribute('maxLength', '500')
  })

  test('valida que el correo sea de tipo email', () => {
    renderContacto()
    const correoInput = document.getElementById('correo') as HTMLInputElement
    expect(correoInput).toHaveAttribute('type', 'email')
  })
})

