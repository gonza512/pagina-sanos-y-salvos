import React, { useState, useEffect } from 'react'
import { Producto } from '../../types/admin'
import { useAlert } from '../../context/AlertContext'

interface ProductFormProps {
  product?: Producto | null
  onSave: (producto: Omit<Producto, 'id'>) => void
  onCancel: () => void
}

export default function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const { showAlert } = useAlert()
  const [formData, setFormData] = useState({
    producto: '',
    imagen: '',
    precio: 0,
    stock: 0,
    categoria: 'alimento',
    activo: true
  })

  useEffect(() => {
    if (product) {
      setFormData({
        producto: product.producto,
        imagen: product.imagen,
        precio: product.precio,
        stock: product.stock,
        categoria: product.categoria,
        activo: product.activo
      })
    }
  }, [product])

  const validarPrecio = (precio: number): boolean => {
    return precio > 0 && precio <= 1000000
  }

  const validarStock = (stock: number): boolean => {
    return stock >= 0 && stock <= 10000
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.producto.trim()) {
      showAlert('El nombre del producto es requerido', 'error')
      return
    }

    if (!validarPrecio(formData.precio)) {
      showAlert('El precio debe ser mayor a 0 y menor a $1.000.000', 'error')
      return
    }

    if (!validarStock(formData.stock)) {
      showAlert('El stock debe estar entre 0 y 10.000', 'error')
      return
    }

    if (!formData.imagen.trim()) {
      showAlert('La URL de la imagen es requerida', 'error')
      return
    }

    onSave(formData)
    showAlert(
      product ? 'Producto actualizado correctamente' : 'Producto creado correctamente', 
      'success'
    )
  }

  return (
    <div>
      <h1 className="admin-main-title">
        {product ? 'Editar Producto' : 'Nuevo Producto'}
      </h1>
      
      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-group">
          <label>Nombre del Producto *</label>
          <input
            type="text"
            value={formData.producto}
            onChange={(e) => setFormData({ ...formData, producto: e.target.value })}
            required
            maxLength={100}
            placeholder="Ingresa el nombre del producto"
          />
        </div>

        <div className="form-group">
          <label>URL de Imagen *</label>
          <input
            type="url"
            value={formData.imagen}
            onChange={(e) => setFormData({ ...formData, imagen: e.target.value })}
            required
            placeholder="/assets/img/producto.jpg"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Precio *</label>
            <input
              type="number"
              value={formData.precio}
              onChange={(e) => setFormData({ ...formData, precio: Number(e.target.value) })}
              required
              min="1"
              max="1000000"
              step="1"
            />
          </div>

          <div className="form-group">
            <label>Stock *</label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
              required
              min="0"
              max="10000"
              step="1"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Categoría *</label>
            <select
              value={formData.categoria}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
            >
              <option value="alimento">Alimento</option>
              <option value="juguete">Juguete</option>
              <option value="accesorio">Accesorio</option>
              <option value="cama">Cama</option>
              <option value="medicamento">Medicamento</option>
            </select>
          </div>

          <div className="form-group">
            <label>Estado</label>
            <select
              value={formData.activo.toString()}
              onChange={(e) => setFormData({ ...formData, activo: e.target.value === 'true' })}
            >
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {product ? 'Actualizar Producto' : 'Crear Producto'}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}