import { useEffect } from 'react'
import { AlertCircle, CheckCircle2 } from '../ui/icons'

function Toast({ mensaje, tipo = 'error', onClose }) {
  useEffect(() => {
    if (!mensaje) return
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [mensaje, onClose])

  if (!mensaje) return null

  const esError = tipo === 'error'
  const Icon = esError ? AlertCircle : CheckCircle2

  return (
    <div className={`fx-toast ${esError ? 'error' : 'exito'}`} role={esError ? 'alert' : 'status'}>
      <Icon size={20} weight="duotone" />
      <span>{mensaje}</span>
    </div>
  )
}

export default Toast
