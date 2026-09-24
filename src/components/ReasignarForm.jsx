import { useState } from 'react'

function ReasignarForm({ empleadosDisponibles, onSubmit, onCancel }) {
  const [empleadoId, setEmpleadoId] = useState('')
  const empleadosOrdenados = [...empleadosDisponibles].sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(empleadoId)
  }

  return (
    <form onSubmit={handleSubmit}>
      <label style={{ display: 'block', marginBottom: '0.35rem', color: '#9AA3B8', fontSize: '0.85rem' }}>
        Nuevo responsable del equipo
      </label>
      <select
        value={empleadoId}
        onChange={(e) => setEmpleadoId(e.target.value)}
        required
        style={{
          width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px',
          border: '1px solid #2C3450', backgroundColor: '#0F1420',
          color: '#E8EAF0', marginBottom: '1.25rem', fontSize: '0.95rem', boxSizing: 'border-box',
        }}
      >
        <option value="">-- Selecciona --</option>
        {empleadosOrdenados.map(emp => (
          <option key={emp.id} value={emp.id}>
            {emp.nombre_completo} ({emp.departamento_nombre})
          </option>
        ))}
      </select>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button type="submit" disabled={!empleadoId} style={{
          backgroundColor: '#F8C22E', color: '#0F1420', border: 'none',
          padding: '0.65rem 1.25rem', borderRadius: '6px', fontWeight: 'bold', flex: 1,
          opacity: empleadoId ? 1 : 0.5,
        }}>
          Reasignar
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

export default ReasignarForm
