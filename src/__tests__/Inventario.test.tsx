import { describe, test, expect, beforeEach, vi } from 'vitest'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AlertProvider } from '../context/AlertContext'
import Inventario from '../pages/Inventario'
import '@testing-library/jest-dom'

// Mock window.confirm
const mockConfirm = vi.fn()
window.confirm = mockConfirm

describe('Inventario', () => {
  const renderInventario = () => {
    return render(
      <MemoryRouter>
        <AlertProvider>
          <Inventario />
        </AlertProvider>
      </MemoryRouter>
    )
  }

  beforeEach(() => {
    localStorage.clear()
    mockConfirm.mockClear()
    vi.clearAllMocks()
  })

  test('muestra el título de la página', () => {
    renderInventario()
    expect(screen.getByText('Productos')).toBeInTheDocument()
  })

  test('muestra todos los productos disponibles', () => {
    renderInventario()
    expect(screen.getByText('Pedigree saco 5kg')).toBeInTheDocument()
    expect(screen.getByText('Juguete para gato')).toBeInTheDocument()
    expect(screen.getByText('Collar para mascota')).toBeInTheDocument()
    expect(screen.getByText('Cama para perro')).toBeInTheDocument()
  })

  test('muestra los precios de los productos', () => {
    renderInventario()
    const precios = Array.from(document.querySelectorAll('.blog-card p')).map(p =>
      (p.textContent || '').replace(/\s+/g, ' ').trim()
    )

    expect(precios).toContain('Precio: $9,990')
    expect(precios).toContain('Precio: $3,000')
    expect(precios).toContain('Precio: $2,500')
    expect(precios).toContain('Precio: $15,000')
  })

  test('muestra el carrito vacío inicialmente', () => {
    renderInventario()
    expect(screen.getByText('Carrito vacío')).toBeInTheDocument()
    const totalElement = document.getElementById('totalCarro')
    expect(totalElement).toBeInTheDocument()
    expect(totalElement?.textContent).toContain('$0')
  })

  test('agrega un producto al carrito', async () => {
    renderInventario()
    const user = userEvent.setup()
    
    const agregarButtons = screen.getAllByText('Agregar al carrito')
    await user.click(agregarButtons[0])
    
    await waitFor(() => {
      expect(screen.queryByText('Carrito vacío')).not.toBeInTheDocument()
      expect(screen.getByText(/Pedigree saco 5kg x1/)).toBeInTheDocument()
    })
  })

  test('calcula el total correctamente al agregar productos', async () => {
    renderInventario()
    const user = userEvent.setup()
    
    const agregarButtons = screen.getAllByText('Agregar al carrito')
    
    // Agregar primer producto (Pedigree: $9,990)
    await user.click(agregarButtons[0])
    
    await waitFor(() => {
      const totalElement = document.getElementById('totalCarro')
      expect(totalElement?.textContent).toContain('9,990')
    })
    
    // Agregar segundo producto (Juguete: $3,000)
    await user.click(agregarButtons[1])
    
    await waitFor(() => {
      const totalElement = document.getElementById('totalCarro')
      expect(totalElement?.textContent).toContain('12,990')
    })
  })

  test('permite agregar múltiples cantidades del mismo producto', async () => {
    renderInventario()
    const user = userEvent.setup()
    
    const cantidadInput = document.getElementById('cantidad-0') as HTMLInputElement
    await user.clear(cantidadInput)
    await user.type(cantidadInput, '3')
    
    const agregarButtons = screen.getAllByText('Agregar al carrito')
    await user.click(agregarButtons[0])
    
    await waitFor(() => {
      expect(screen.getByText(/Pedigree saco 5kg x3/)).toBeInTheDocument()
      const totalElement = document.getElementById('totalCarro')
      expect(totalElement?.textContent).toContain('29,970')
    })
  })

  test('guarda el carrito en localStorage', async () => {
    renderInventario()
    const user = userEvent.setup()
    
    const agregarButtons = screen.getAllByText('Agregar al carrito')
    await user.click(agregarButtons[0])
    
    await waitFor(() => {
      const carro = JSON.parse(localStorage.getItem('carro') || '[]')
      expect(carro).toHaveLength(1)
      expect(carro[0].producto).toBe('Pedigree saco 5kg')
    })
  })

  test('restaura el carrito desde localStorage al cargar', () => {
    const carroGuardado = [
      { producto: 'Pedigree saco 5kg', imagen: '/assets/img/pedigree.png', precio: 9990, cantidad: 2 }
    ]
    localStorage.setItem('carro', JSON.stringify(carroGuardado))
    
    renderInventario()
    
    expect(screen.getByText(/Pedigree saco 5kg x2/)).toBeInTheDocument()
    const totalElement = document.getElementById('totalCarro')
    expect(totalElement?.textContent).toContain('19,980')
  })

  test('vacía el carrito cuando se confirma', async () => {
    renderInventario()
    const user = userEvent.setup()
    mockConfirm.mockReturnValue(true)
    
    // Agregar un producto
    const agregarButtons = screen.getAllByText('Agregar al carrito')
    await user.click(agregarButtons[0])
    
    await waitFor(() => {
      expect(screen.queryByText('Carrito vacío')).not.toBeInTheDocument()
    })
    
    // Vaciar carrito
    await user.click(screen.getByText('Vaciar carro'))
    
    await waitFor(() => {
      expect(screen.getByText('Carrito vacío')).toBeInTheDocument()
      expect(mockConfirm).toHaveBeenCalledWith('¿Vaciar carro?')
    })
  })

  test('no vacía el carrito cuando se cancela', async () => {
    renderInventario()
    const user = userEvent.setup()
    mockConfirm.mockReturnValue(false)
    
    // Agregar un producto
    const agregarButtons = screen.getAllByText('Agregar al carrito')
    await user.click(agregarButtons[0])
    
    await waitFor(() => {
      expect(screen.queryByText('Carrito vacío')).not.toBeInTheDocument()
    })
    
    // Intentar vaciar carrito
    await user.click(screen.getByText('Vaciar carro'))
    
    await waitFor(() => {
      expect(screen.queryByText('Carrito vacío')).not.toBeInTheDocument()
    })
  })
})

