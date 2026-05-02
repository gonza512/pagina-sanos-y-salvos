import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

type AlertType = 'success' | 'error' | 'info'

export type Alert = {
  id: string
  message: string
  type?: AlertType
  duration?: number // ms
}

type AlertContextValue = {
  alerts: Alert[]
  showAlert: (message: string, type?: AlertType, duration?: number) => void
  removeAlert: (id: string) => void
}

const AlertContext = createContext<AlertContextValue | undefined>(undefined)

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [alerts, setAlerts] = useState<Alert[]>([])

  const removeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id))
  }, [])

  const showAlert = useCallback((message: string, type: AlertType = 'info', duration = 4000) => {
    const id = Math.random().toString(36).slice(2, 9)
    const next: Alert = { id, message, type, duration }
    setAlerts(prev => [...prev, next])

    if (duration && duration > 0) {
      setTimeout(() => removeAlert(id), duration)
    }
  }, [removeAlert])

  return (
    <AlertContext.Provider value={{ alerts, showAlert, removeAlert }}>
      {children}
    </AlertContext.Provider>
  )
}

export function useAlert() {
  const ctx = useContext(AlertContext)
  if (!ctx) throw new Error('useAlert must be used within an AlertProvider')
  return ctx
}

export default AlertContext