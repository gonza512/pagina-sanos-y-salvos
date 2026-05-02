import React from 'react'
import { useAlert } from '../context/AlertContext'

const PopupAlert: React.FC = () => {
  const { alerts, removeAlert } = useAlert()

  return (
    <div className="popup-alerts" aria-live="polite" aria-atomic="true">
      {alerts.map(a => (
        <div
          key={a.id}
          className={`popup-alert popup-${a.type ?? 'info'}`}
          onClick={() => removeAlert(a.id)}
          role="alert"
        >
          <div className="popup-alert-content">
            <div className="popup-alert-message">{a.message}</div>
          </div>
          <button className="popup-alert-close" aria-label="Cerrar">×</button>
        </div>
      ))}
    </div>
  )
}

export default PopupAlert
