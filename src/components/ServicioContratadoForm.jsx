import { useState, useEffect } from 'react'

const inputStyle = {
  width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px',
  border: '1px solid var(--campo-borde)', backgroundColor: 'var(--campo-bg)',
  color: 'var(--texto-claro)', marginBottom: '1rem', fontSize: '0.95rem', boxSizing: 'border-box',
}
const labelStyle = { display: 'block', marginBottom: '0.35rem', color: 'var(--texto-2)', fontSize: '0.85rem' }
const rowStyle = { display: 'flex', gap: '0.75rem' }

const initialState = {
  nombre: '', tipo: '', proveedor: '', costo: '', periodicidad: 'mensual',
  fecha_proximo_pago: '', activo: true, notas: '',
}

function ServicioContratadoForm({ proveedores, servicioInicial, onSubmit, onCancel }) {
  const [form, setForm] = useState(initialState)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (servicioInicial) {
      setForm({ ...initialState, ...servicioInicial })
    } else {
      setForm(initialState)
    }
  }, [servicioInicial])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setGuardando(true)
    Promise.resolve(onSubmit({ ...form, proveedor: form.proveedor || null })).finally(() => setGuardando(false))
  }

  return (
    <form onSubmit={handleSubmit}>
      <label style={labelStyle}>Nombre del servicio</label>
      <input name="nombre" value={form.nombre} onChange={handleChange} required style={inputStyle} placeholder="ej. Internet Telmex, Hosting AWS" />

      <div style={rowStyle}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Tipo</label>
          <input name="tipo" value={form.tipo || ''} onChange={handleChange} style={inputStyle} placeholder="ej. Internet, Hosting" />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Proveedor (opcional)</label>
          <select name="proveedor" value={form.proveedor || ''} onChange={handleChange} style={inputStyle}>
            <option value="">-- Sin proveedor --</option>
            {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
        </div>
      </div>

      <div style={rowStyle}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Costo</label>
          <input type="number" step="0.01" name="costo" value={form.costo} onChange={handleChange} required style={inputStyle} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Periodicidad</label>
          <select name="periodicidad" value={form.periodicidad} onChange={handleChange} style={inputStyle}>
            <option value="mensual">Mensual</option>
            <option value="trimestral">Trimestral</option>
            <option value="semestral">Semestral</option>
            <option value="anual">Anual</option>
          </select>
        </div>
      </div>

      <label style={labelStyle}>Próximo pago</label>
      <input type="date" name="fecha_proximo_pago" value={form.fecha_proximo_pago || ''} onChange={handleChange} style={inputStyle} />

      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--texto-2)', fontSize: '0.88rem', marginBottom: '1rem', cursor: 'pointer' }}>
        <input type="checkbox" name="activo" checked={form.activo} onChange={handleChange} />
        Servicio activo
      </label>

      <label style={labelStyle}>Notas</label>
      <textarea name="notas" value={form.notas || ''} onChange={handleChange} rows="2" style={inputStyle} />

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
        <button
          type="submit"
          disabled={guardando}
          style={{
            backgroundColor: '#F8C22E', color: '#0F1420', border: 'none',
            padding: '0.65rem 1.25rem', borderRadius: '6px', fontWeight: 'bold', flex: 1,
            opacity: guardando ? 0.6 : 1,
          }}
        >
          {guardando ? 'Guardando...' : 'Guardar'}
        </button>
        <button type="button" onClick={onCancel} disabled={guardando} style={{
          backgroundColor: 'transparent', color: 'var(--texto-2)', border: '1px solid var(--campo-borde)',
          padding: '0.65rem 1.25rem', borderRadius: '6px', flex: 1,
        }}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default ServicioContratadoForm
