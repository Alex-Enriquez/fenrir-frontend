import { useEffect } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

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
    <div style={{
      position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 1200,
      display: 'flex', alignItems: 'center', gap: '0.6rem',
      backgroundColor: esError ? 'var(--peligro-bg)' : 'var(--exito-bg)',
      color: esError ? 'var(--peligro-texto)' : 'var(--exito-texto)',
      border: `1px solid ${esError ? 'var(--peligro-borde)' : '#1F5C3A'}`,
      padding: '0.75rem 1.1rem', borderRadius: '10px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
      fontSize: '0.88rem', maxWidth: '340px',
    }}>
      <Icon size={18} />
      {mensaje}
    </div>
  )
}

export default Toast
