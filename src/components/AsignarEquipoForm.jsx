import { useState } from 'react'

function AsignarEquipoForm({ equiposDisponibles, onSubmit, onCancel }) {
  const [equipoId, setEquipoId] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(equipoId)
  }

  return (
    <form onSubmit={handleSubmit}>
      <label style={{ display: 'block', marginBottom: '0.35rem', color: 'var(--texto-2)', fontSize: '0.85rem' }}>
        Equipo disponible
      </label>
      <select
        value={equipoId}
        onChange={(e) => setEquipoId(e.target.value)}
        required
        style={{
          width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px',
          border: '1px solid var(--campo-borde)', backgroundColor: 'var(--campo-bg)',
          color: 'var(--texto-claro)', marginBottom: '1.25rem', fontSize: '0.95rem', boxSizing: 'border-box',
        }}
      >
        <option value="">-- Selecciona --</option>
        {equiposDisponibles.map(eq => (
          <option key={eq.id} value={eq.id}>
            {eq.marca} {eq.modelo} ({eq.numero_serie})
          </option>
        ))}
      </select>

      {equiposDisponibles.length === 0 && (
        <p style={{ color: 'var(--peligro-texto)', fontSize: '0.85rem', marginBottom: '1rem' }}>
          No hay equipos disponibles en este momento.
        </p>
      )}

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button type="submit" disabled={!equipoId} style={{
          backgroundColor: 'var(--accion)', color: 'var(--sobre-accion)', border: 'none',
          padding: '0.65rem 1.25rem', borderRadius: '6px', fontWeight: 'bold', flex: 1,
          opacity: equipoId ? 1 : 0.5,
        }}>
          Asignar
        </button>
        <button type="button" onClick={onCancel} style={{
          backgroundColor: 'var(--cancel-bg)', color: 'var(--cancel-texto)', border: '1px solid var(--cancel-borde)',
          padding: '0.65rem 1.25rem', borderRadius: '6px', flex: 1,
        }}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default AsignarEquipoForm
