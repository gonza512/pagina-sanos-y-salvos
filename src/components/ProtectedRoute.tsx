import React, { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

// Usar React.ReactNode para children evita errores cuando la definición global JSX
// no expone directamente `JSX.Element` en algunos entornos TS/JSX.
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useContext(AuthContext)
  if (!user || user.rol !== 'admin') {
    return <Navigate to="/login" replace />
  }
  // Devolvemos un fragmento que contiene children para que el tipo sea válido
  return <>{children}</>
}
