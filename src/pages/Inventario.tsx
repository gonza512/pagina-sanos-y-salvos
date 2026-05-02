import React, { useState, useEffect } from 'react'
import { useAlert } from '../context/AlertContext'

type Producto = {
  producto: string
  imagen: string
  precio: number
}

export default function Inventario() {
  const productos: Producto[] = [
    { producto: 'Pedigree saco 5kg', imagen: '/assets/img/pedigree.png', precio: 9990 },
    { producto: 'Juguete para gato', imagen: '/assets/img/juguetegato.jpg', precio: 3000 },
    { producto: 'Collar para mascota', imagen: '/assets/img/collar.jpg', precio: 2500 },
    { producto: 'Cama para perro', imagen: '/assets/img/camaperro.jpg', precio: 15000 }
  ]

  const [carro, setCarro] = useState<any[]>([])

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('carro') || '[]')
    setCarro(saved)
  }, [])

  useEffect(() => {
    localStorage.setItem('carro', JSON.stringify(carro))
  }, [carro])

  function agregarAlCarro(item: Producto, cantidad: number) {
    const existente = carro.find(c => c.producto === item.producto)
    if (existente) {
      existente.cantidad += cantidad
      setCarro([...carro])
    } else {
      setCarro([...carro, { ...item, cantidad }])
    }
  }

  const { showAlert } = useAlert()

  function vaciarCarro() {
    if (confirm('¿Vaciar carro?')) setCarro([])
  }

  function realizarOrden() {
    if (carro.length === 0) { showAlert('Tu carrito está vacío.', 'error'); return }
    showAlert('Orden generada. Gracias por tu compra', 'success')
    setCarro([])
  }

  const total = carro.reduce((s, it) => s + it.precio * it.cantidad, 0)

  return (
    <section className="main-article blogs-section">
      <h1 className="main-title">Productos</h1>
      <div className="blogs-list">
        {productos.map((p, i) => (
          <article key={i} className="blog-card">
            <img src={p.imagen} alt={p.producto} className="blog-card-img" />
            <h2 className="blog-card-title">{p.producto}</h2>
            <p>Precio: ${p.precio.toLocaleString()}</p>
            <input type="number" defaultValue={1} min={1} id={`cantidad-${i}`} className="input-contacto" />
            <button className="btn-custom" onClick={() => {
              const cantidad = parseInt((document.getElementById(`cantidad-${i}`) as HTMLInputElement).value) || 1
              agregarAlCarro(p, cantidad)
            }}>Agregar al carrito</button>
          </article>
        ))}
      </div>

      <aside className="cart-sidebar">
        <h3 className="section-title">Carrito</h3>
        <ul className="cart-list" id="listaCarro">
          {carro.length === 0 && <li className="list-group-item">Carrito vacío</li>}
          {carro.map((item, idx) => (
            <li key={idx} className="list-group-item cart-item">
              <span>{item.producto} x{item.cantidad}</span>
              <strong>${(item.precio * item.cantidad).toLocaleString()}</strong>
            </li>
          ))}
        </ul>
        <div className="cart-total">
          <p>Total: <strong id="totalCarro">${total.toLocaleString()}</strong></p>
        </div>
        <div className="cart-actions">
          <button className="btn-secondary-custom" id="vaciarCarro" onClick={vaciarCarro}>Vaciar carro</button>
          <button className="btn-custom" id="realizarOrden" onClick={realizarOrden}>Realizar orden</button>
        </div>
      </aside>
    </section>
  )
}
