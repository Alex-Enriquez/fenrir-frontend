import { useState, useMemo } from 'react'
import { X, Search } from 'lucide-react'

const TECNICOS = ['Irving Sammer González', 'Alexis Acosta', 'Celia Hernández']

const inputStyle = {
  width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px',
  border: '1px solid var(--campo-borde)', backgroundColor: 'var(--campo-bg)',
  color: 'var(--texto-claro)', marginBottom: '1rem', fontSize: '0.95rem', boxSizing: 'border-box',
}
const labelStyle = { display: 'block', marginBottom: '0.35rem', color: 'var(--texto-2)', fontSize: '0.85rem' }

function ResponsivaForm({ empleados, equipos, empleadoInicial, onSubmit, onCancel }) {
  const [empleadoId, setEmpleadoId] = useState(empleadoInicial || '')
  const [quienEntrega, setQuienEntrega] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [busquedaEquipo, setBusquedaEquipo] = useState('')
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false)
  const [equiposSeleccionados, setEquiposSeleccionados] = useState([])

  const equiposElegibles = useMemo(
    () => equipos.filter(eq => eq.estado === 'disponible'),
    [equipos]
  )

  const sugerencias = useMemo(() => {
    const texto = busquedaEquipo.trim().toLowerCase()
    return equiposElegibles
      .filter(eq => !equiposSeleccionados.includes(eq.id))
      .filter(eq => !texto || `${eq.marca} ${eq.modelo} ${eq.numero_serie} ${eq.numero_inventario || ''}`.toLowerCase().includes(texto))
      .slice(0, 8)
  }, [equiposElegibles, equiposSeleccionados, busquedaEquipo])

  const equipoPorId = useMemo(() => {
    const m = {}
    equipos.forEach(eq => { m[eq.id] = eq })
    return m
  }, [equipos])

  const agregarEquipo = (id) => {
    setEquiposSeleccionados(prev => [...prev, id])
    setBusquedaEquipo('')
    setMostrarSugerencias(false)
  }

  const quitarEquipo = (id) => {
    setEquiposSeleccionados(prev => prev.filter(x => x !== id))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      empleado: empleadoId,
      quien_entrega: quienEntrega,
      observaciones,
      items: equiposSeleccionados.map(id => ({ equipo: id, cantidad: 1 })),
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <label style={labelStyle}>Empleado</label>
      <select value={empleadoId} onChange={(e) => setEmpleadoId(e.target.value)} required style={inputStyle}>
        <option value="">-- Selecciona --</option>
        {[...empleados].sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo)).map(emp => (
          <option key={emp.id} value={emp.id}>{emp.nombre_completo} ({emp.departamento_nombre})</option>
        ))}
      </select>

      <label style={labelStyle}>Quien entrega</label>
      <select value={quienEntrega} onChange={(e) => setQuienEntrega(e.target.value)} required style={inputStyle}>
        <option value="">-- Selecciona --</option>
        {TECNICOS.map(t => <option key={t} value={t}>{t}</option>)}
      </select>

      <label style={labelStyle}>Equipos a incluir (solo disponibles)</label>

      {equiposSeleccionados.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
          {equiposSeleccionados.map(id => {
            const eq = equipoPorId[id]
            if (!eq) return null
            return (
              <span key={id} style={{
                display: 'flex', alignItems: 'center', gap: '0.35rem',
                backgroundColor: 'rgba(248,194,46,0.12)', color: 'var(--acento-texto)',
                padding: '0.3rem 0.6rem', borderRadius: '999px', fontSize: '0.82rem',
              }}>
                {eq.marca} {eq.modelo}
                <button type="button" onClick={() => quitarEquipo(id)} style={{ background: 'none', border: 'none', color: 'var(--acento-texto)', display: 'flex', padding: 0 }}>
                  <X size={13} />
                </button>
              </span>
            )
          })}
        </div>
      )}

      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <Search size={16} style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--texto-4)' }} />
        <input
          value={busquedaEquipo}
          onChange={(e) => setBusquedaEquipo(e.target.value)}
          onFocus={() => setMostrarSugerencias(true)}
          onBlur={() => setTimeout(() => setMostrarSugerencias(false), 150)}
          placeholder="Buscar equipo disponible por marca, modelo o serie..."
          style={{ ...inputStyle, marginBottom: 0, paddingLeft: '2.2rem' }}
        />

        {mostrarSugerencias && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20,
            backgroundColor: 'var(--campo-bg-2)', border: '1px solid var(--campo-borde)', borderRadius: '8px',
            marginTop: '0.3rem', maxHeight: '220px', overflowY: 'auto',
            boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
          }}>
            {sugerencias.length === 0 ? (
              <div style={{ padding: '0.7rem', color: 'var(--texto-5)', fontSize: '0.85rem' }}>
                No hay equipos disponibles que coincidan.
              </div>
            ) : (
              sugerencias.map(eq => (
                <div
                  key={eq.id}
                  onMouseDown={() => agregarEquipo(eq.id)}
                  style={{
                    padding: '0.6rem 0.8rem', cursor: 'pointer', fontSize: '0.88rem', color: 'var(--texto-claro)',
                    borderBottom: '1px solid var(--borde-suave)',
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{eq.marca} {eq.modelo}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--texto-tenue)' }}>
                    {eq.categoria_nombre} · {eq.numero_serie || eq.numero_inventario || 'sin serie'}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {equiposSeleccionados.length === 0 && (
        <p style={{ color: 'var(--peligro-texto)', fontSize: '0.8rem', marginTop: '-0.5rem', marginBottom: '1rem' }}>
          Selecciona al menos un equipo.
        </p>
      )}

      <label style={labelStyle}>Observaciones (opcional)</label>
      <textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} rows="2" style={inputStyle} />

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
        <button
          type="submit"
          disabled={!empleadoId || !quienEntrega || equiposSeleccionados.length === 0}
          style={{
            backgroundColor: 'var(--accion)', color: 'var(--sobre-accion)', border: 'none',
            padding: '0.65rem 1.25rem', borderRadius: '6px', fontWeight: 'bold', flex: 1,
            opacity: (!empleadoId || !quienEntrega || equiposSeleccionados.length === 0) ? 0.5 : 1,
          }}
        >
          Generar responsiva
        </button>
        <button type="button" onClick={onCancel} style={{
          backgroundColor: 'transparent', color: 'var(--sec-texto)', border: '1px solid var(--sec-borde)',
          padding: '0.65rem 1.25rem', borderRadius: '6px', flex: 1,
        }}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default ResponsivaForm
