import { useState, useEffect } from 'react'

const inputStyle = {
  width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px',
  border: '1px solid var(--campo-borde)', backgroundColor: 'var(--campo-bg)',
  color: 'var(--texto-claro)', marginBottom: '1rem', fontSize: '0.95rem', boxSizing: 'border-box',
}
const rowStyle = { display: 'flex', gap: '0.75rem' }
const labelStyle = { display: 'block', marginBottom: '0.35rem', color: 'var(--texto-2)', fontSize: '0.85rem' }

const initialState = {
  tipo: '', clave_producto: '', modalidad: 'suscripcion', asientos_totales: 1,
  fecha_compra: '', fecha_vencimiento: '', proveedor_compra: '', costo: '', observaciones: '',
}

function LicenciaForm({ tipos, licenciaInicial, onSubmit, onCancel }) {
  const [form, setForm] = useState(initialState)

  useEffect(() => {
    if (licenciaInicial) {
      setForm({ ...initialState, ...licenciaInicial })
    } else {
      setForm(initialState)
    }
  }, [licenciaInicial])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit}>
      <label style={labelStyle}>Tipo de licencia</label>
      <select name="tipo" value={form.tipo} onChange={handleChange} required style={inputStyle}>
        <option value="">-- Selecciona --</option>
        {tipos.map(t => (
          <option key={t.id} value={t.id}>{t.nombre}{t.proveedor ? ` (${t.proveedor})` : ''}</option>
        ))}
      </select>

      <div style={rowStyle}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Modalidad</label>
          <select name="modalidad" value={form.modalidad} onChange={handleChange} style={inputStyle}>
            <option value="suscripcion">Suscripción</option>
            <option value="perpetua">Perpetua</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Asientos totales</label>
          <input type="number" min="1" name="asientos_totales" value={form.asientos_totales} onChange={handleChange} style={inputStyle} />
        </div>
      </div>

      <label style={labelStyle}>Clave de producto (opcional)</label>
      <input name="clave_producto" value={form.clave_producto || ''} onChange={handleChange} style={inputStyle} />

      <div style={rowStyle}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Fecha de compra</label>
          <input type="date" name="fecha_compra" value={form.fecha_compra || ''} onChange={handleChange} style={inputStyle} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Fecha de vencimiento</label>
          <input type="date" name="fecha_vencimiento" value={form.fecha_vencimiento || ''} onChange={handleChange} style={inputStyle} disabled={form.modalidad === 'perpetua'} />
        </div>
      </div>

      <div style={rowStyle}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Proveedor</label>
          <input name="proveedor_compra" value={form.proveedor_compra || ''} onChange={handleChange} style={inputStyle} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Costo</label>
          <input type="number" step="0.01" name="costo" value={form.costo || ''} onChange={handleChange} style={inputStyle} />
        </div>
      </div>

      <label style={labelStyle}>Observaciones</label>
      <textarea name="observaciones" value={form.observaciones || ''} onChange={handleChange} rows="2" style={inputStyle} />

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
        <button type="submit" style={{
          backgroundColor: 'var(--accion)', color: 'var(--sobre-accion)', border: 'none',
          padding: '0.65rem 1.25rem', borderRadius: '6px', fontWeight: 'bold', flex: 1,
        }}>
          Guardar
        </button>
        <button type="button" onClick={onCancel} style={{
          backgroundColor: 'transparent', color: 'var(--sec-texto)', border: '1px solid var(--cancel-borde)',
          padding: '0.65rem 1.25rem', borderRadius: '6px', flex: 1,
        }}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default LicenciaForm
