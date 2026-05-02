import React from 'react'

export default function Home() {
  return (
    <section className="main-article home-article">
      <h1 className="main-title">Sanos y Salvos</h1>
      <p className="main-text">
        Plataforma inteligente para la localizacion y recuperacion de mascotas perdidas.
        Centralizamos reportes ciudadanos, refugios, clinicas y municipalidades.
      </p>
      <div className="home-hero">
        <img
          src="/assets/img/home-mapa-mascota.png"
          alt="Perro con collar GPS mirando un mapa en un celular"
          width={700}
        />
      </div>
    </section>
  )
}

