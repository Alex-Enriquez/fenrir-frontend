import { AlertTriangle } from 'lucide-react'

function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 1100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--dialogo-bg)', borderRadius: '14px', padding: '1.75rem',
          width: '90%', maxWidth: '380px', border: '1px solid var(--campo-borde)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)', textAlign: 'center',
        }}
      >
        <div style={{
          width: '48px', height: '48px', borderRadius: '50%',
          backgroundColor: 'rgba(248,113,113,0.12)', color: '#F87171',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1rem',
        }}>
          <AlertTriangle size={24} />
        </div>
        <h3 style={{ color: 'var(--texto-fuerte)', margin: '0 0 0.5rem', fontSize: '1.05rem' }}>{title}</h3>
        <p style={{ color: 'var(--texto-tenue)', fontSize: '0.88rem', margin: '0 0 1.5rem' }}>{message}</p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '0.6rem', borderRadius: '8px',
              border: '1px solid var(--campo-borde)', backgroundColor: 'transparent',
              color: 'var(--texto-2)', fontSize: '0.9rem',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '0.6rem', borderRadius: '8px',
              border: 'none', backgroundColor: '#F87171',
              color: '#1A0505', fontWeight: 700, fontSize: '0.9rem',
            }}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
