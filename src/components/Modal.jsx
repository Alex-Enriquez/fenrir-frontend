import { useEffect } from 'react'
import { X } from '../ui/icons'

function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (!isOpen) return
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        className="modal-content fx-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title || undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="fx-modal-head" style={title ? undefined : { borderBottom: 'none', paddingBottom: 0, justifyContent: 'flex-end' }}>
          {title ? <h2>{title}</h2> : null}
          <button type="button" className="fx-modal-x" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>
        <div className="fx-modal-body">{children}</div>
      </div>
    </div>
  )
}

export default Modal
