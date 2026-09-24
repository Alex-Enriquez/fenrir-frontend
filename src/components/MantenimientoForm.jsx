import { useState, useEffect, useMemo } from 'react'

const inputStyle = {
  width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px',
  border: '1px solid #2C3450', backgroundColor: '#0F1420',
  color: '#E8EAF0', marginBottom: '1rem', fontSize: '0.95rem', boxSizing: 'border-box',
}
const labelStyle = { display: 'block', marginBottom: '0.35rem', color: '#9AA3B8', fontSize: '0.85rem' }

const TECNICOS = ['Irving Sammer González Correa', 'Alexis Leonardo Enriquez  Acosta', 'Celia Alessandra Hernández']

function MantenimientoForm({ empleados, asignacionActivaPorEmpleado, equipoPorId, mantenimientoInicial, onSubmit, onCancel }) {
  const [empleadoId, setEmpleadoId] = useState('')
  const [equipoId, setEquipoId] = useState('')
  const [fecha, setFecha] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [solucion, setSolucion] = useState('')
  const [realizadoPor, setRealizadoPor] = useState('')
  const [costo, setCosto] = useState('')

  const esEdicion = !!mantenimientoInicial

  useEffect(() => {
    if (mantenimientoInicial) {
      setEquipoId(mantenimientoInicial.equipo || '')
      setFecha(mantenimientoInicial.fecha || '')
      setDescripcion(mantenimientoInicial.descripcion || '')
      setSolucion(mantenimientoInicial.solucion || '')
      setRealizadoPor(mantenimientoInicial.realizado_por || '')
      setCosto(mantenimientoInicial.costo || '')
    } else {
      setEmpleadoId(''); setEquipoId(''); setFecha(new Date().toISOString().slice(0, 10))
      setDescripcion(''); setSolucion(''); setRealizadoPor(''); setCosto('')
    }
  }, [mantenimientoInicial])

  const handleSeleccionarEmpleado = (id) => {
    setEmpleadoId(id)
    const asignacion = asignacionActivaPorEmpleado[id]
    setEquipoId(asignacion ? asignacion.equipo : '')
  }

  const equipoActual = equipoId ? equipoPorId[equipoId] : null

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ equipo: equipoId, fecha, descripcion, solucion, realizado_por: realizadoPor, costo })
  }

  return (
    <form onSubmit={handleSubmit}>
      {!esEdicion && (
        <>
          <label style={labelStyle}>Usuario afectado</label>
          <select value={empleadoId} onChange={(e) => handleSeleccionarEmpleado(e.target.value)} required style={inputStyle}>
            <option value="">-- Selecciona --</option>
            {[...empleados].sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo)).map(emp => (
              <option key={emp.id} value={emp.id}>{emp.nombre_completo} ({emp.departamento_nombre})</option>
            ))}
          </select>

          {empleadoId && (
            <div style={{
              padding: '0.6rem 0.8rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem',
              backgroundColor: equipoActual ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)',
              color: equipoActual ? '#4ADE80' : '#F87171',
            }}>
              {equipoActual
                ? `Equipo: ${equipoActual.marca} ${equipoActual.modelo} (${equipoActual.numero_serie})`
                : 'Este empleado no tiene un equipo asignado actualmente.'}
            </div>
          )}
        </>
      )}

      {esEdicion && equipoActual && (
        <div style={{ padding: '0.6rem 0.8rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem', backgroundColor: 'rgba(96,165,250,0.08)', color: '#60A5FA' }}>
          Equipo: {equipoActual.marca} {equipoActual.modelo} ({equipoActual.numero_serie})
        </div>
      )}

      <label style={labelStyle}>Fecha</label>
      <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required style={inputStyle} />

      <label style={labelStyle}>Descripción del problema</label>
      <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required rows="2" style={inputStyle} placeholder="ej. El equipo no enciende, pantalla azul, etc." />

      <label style={labelStyle}>Solución aplicada</label>
      <textarea value={solucion} onChange={(e) => setSolucion(e.target.value)} rows="2" style={inputStyle} placeholder="ej. Se reemplazó la fuente de poder" />

      <label style={labelStyle}>Realizado por</label>
      <select value={realizadoPor} onChange={(e) => setRealizadoPor(e.target.value)} required style={inputStyle}>
        <option value="">-- Selecciona --</option>
        {TECNICOS.map(t => <option key={t} value={t}>{t}</option>)}
      </select>

      <label style={labelStyle}>Costo (opcional)</label>
      <input type="number" step="0.01" value={costo} onChange={(e) => setCosto(e.target.value)} style={inputStyle} />

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
        <button
          type="submit"
          disabled={!equipoId}
          style={{
            backgroundColor: '#F8C22E', color: '#0F1420', border: 'none',
            padding: '0.65rem 1.25rem', borderRadius: '6px', fontWeight: 'bold', flex: 1,
            opacity: equipoId ? 1 : 0.5,
          }}
        >
          Guardar
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

export default MantenimientoForm
