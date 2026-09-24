import { useState } from 'react'

function AsignarEquipoForm({ equiposDisponibles, onSubmit, onCancel }) {
  const [equipoId, setEquipoId] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(equipoId)
  }

  return (
    <form onSubmit={handleSubmit}>
      <label style={{ display: 'block', marginBottom: '0.35rem', color: '#9AA3B8', fontSize: '0.85rem' }}>
        Equipo disponible
      </label>
      <select
        value={equipoId}
        onChange={(e) => setEquipoId(e.target.value)}
        required
        style={{
          width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px',
          border: '1px solid #2C3450', backgroundColor: '#0F1420',
          color: '#E8EAF0', marginBottom: '1.25rem', fontSize: '0.95rem', boxSizing: 'border-box',
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
        <p style={{ color: '#F87171', fontSize: '0.85rem', marginBottom: '1rem' }}>
          No hay equipos disponibles en este momento.
        </p>
      )}

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button type="submit" disabled={!equipoId} style={{
          backgroundColor: '#F8C22E', color: '#0F1420', border: 'none',
          padding: '0.65rem 1.25rem', borderRadius: '6px', fontWeight: 'bold', flex: 1,
          opacity: equipoId ? 1 : 0.5,
        }}>
          Asignar
        </button>
        <button type="button" onClick={onCancel} style={{
          backgroundColor: 'transparent', color: '#9AA3B8', border: '1px solid #2C3450',
          padding: '0.65rem 1.25rem', borderRadius: '6px', flex: 1,
        }}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default AsignarEquipoForm
