import { AlertTriangle } from '../ui/icons'

function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null

  return (
    <div
      className="modal-overlay"
      onClick={onCancel}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 1100,
      }}
    >
      <div className="modal-content fx-dialog" role="alertdialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="fx-dialog-icon">
          <AlertTriangle size={26} weight="duotone" />
        </div>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="fx-dialog-acciones">
          <button type="button" className="fx-btn-cancelar" onClick={onCancel}>Cancelar</button>
          <button type="button" className="fx-btn-peligro" onClick={onConfirm}>Eliminar</button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
