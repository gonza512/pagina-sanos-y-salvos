import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Blogs() {
  const navigate = useNavigate()

  return (
    <section className="main-article blogs-section">
      <h1 className="main-title">Noticias</h1>
      <div className="blogs-list">
        <article className="blog-card">
          <img
            src="/assets/img/juguetegato.jpg"
            alt="Gato jugando con su juguete"
            className="blog-card-img"
          />
          <h2 className="section-title">
            <button onClick={() => navigate('/blogs/1')} className="blog-card-link">¿Por qué los gatos necesitan juguetes?</button>
          </h2>
          <p className="main-text">Descubre la importancia de los juguetes en la vida de tu gato.</p>
        </article>
        <article className="blog-card">
          <img
            src="/assets/img/camaperro.jpg"
            alt="Perro descansando en su cama"
            className="blog-card-img"
          />
          <h2 className="section-title">
            <button onClick={() => navigate('/blogs/2')} className="blog-card-link">El mejor descanso para tu perro</button>
          </h2>
          <p className="main-text">Ideas para elegir la cama ideal para tu mascota.</p>
        </article>
      </div>
    </section>
  )
}
