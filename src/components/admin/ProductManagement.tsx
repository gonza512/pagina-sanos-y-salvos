import React, { useState } from 'react'
import { Producto } from '../../types/admin'
import ProductForm from './ProductForm'

interface ProductManagementProps {
  productos: Producto[]
  onAgregarProducto: (producto: Omit<Producto, 'id'>) => void
  onActualizarProducto: (id: string, producto: Omit<Producto, 'id'>) => void
  onEliminarProducto: (id: string) => void
}

export default function ProductManagement({ 
  productos, 
  onAgregarProducto, 
  onActualizarProducto, 
  onEliminarProducto 
}: ProductManagementProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null)

  const handleSaveProduct = (productoData: Omit<Producto, 'id'>) => {
    if (editingProduct) {
      onActualizarProducto(editingProduct.id, productoData)
    } else {
      onAgregarProducto(productoData)
    }
    setEditingProduct(null)
    setShowForm(false)
  }

  const handleEdit = (producto: Producto) => {
    setEditingProduct(producto)
    setShowForm(true)
  }

  const handleCancel = () => {
    setEditingProduct(null)
    setShowForm(false)
  }

  const handleDelete = (producto: Producto) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return
    onEliminarProducto(producto.id)
  }

  if (showForm) {
    return (
      <ProductForm
        product={editingProduct}
        onSave={handleSaveProduct}
        onCancel={handleCancel}
      />
    )
  }

  return (
    <div>
      <div className="section-header">
        <h1 className="admin-main-title">Gestión de Productos</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + Agregar Producto
        </button>
      </div>

      {productos.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-icon">🛍️</p>
          <p className="empty-state-title">No hay productos creados</p>
          <p className="empty-state-description">Comienza agregando tu primer producto al catálogo.</p>
          <button onClick={() => setShowForm(true)} className="btn-primary empty-state-button">
            + Crear primer producto
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Imagen</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Categoría</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map(producto => (
              <tr key={producto.id} className={producto.stock < 10 ? 'low-stock' : ''}>
                <td>{producto.producto}</td>
                <td>
                  <img src={producto.imagen} alt={producto.producto} className="product-thumb" />
                </td>
                <td>${producto.precio.toLocaleString()}</td>
                <td>
                  <span className={producto.stock < 5 ? 'stock-danger' : producto.stock < 10 ? 'stock-warning' : ''}>
                    {producto.stock}
                  </span>
                </td>
                <td>{producto.categoria}</td>
                <td>
                  <span className={`status-badge ${producto.activo ? 'active' : 'inactive'}`}>
                    {producto.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button onClick={() => handleEdit(producto)} className="btn-edit">
                      Editar
                    </button>
                    <button onClick={() => handleDelete(producto)} className="btn-danger">
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}