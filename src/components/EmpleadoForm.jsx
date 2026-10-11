import { useState, useEffect } from 'react'

const inputStyle = {
  width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px',
  border: '1px solid var(--campo-borde)', backgroundColor: 'var(--campo-bg)',
  color: 'var(--texto-claro)', marginBottom: '1rem', fontSize: '0.95rem', boxSizing: 'border-box',
}
const rowStyle = { display: 'flex', gap: '0.75rem' }
const labelStyle = { display: 'block', marginBottom: '0.35rem', color: 'var(--texto-2)', fontSize: '0.85rem' }

const initialState = {
  nombre_completo: '', correo: '', departamento: '', puesto: '',
  fecha_ingreso: '', estatus: 'activo', telefono: '', observaciones: '',
}

function EmpleadoForm({ departamentos, empleadoInicial, onSubmit, onCancel }) {
  const [form, setForm] = useState(initialState)

  useEffect(() => {
    if (empleadoInicial) {
      setForm({ ...initialState, ...empleadoInicial })
    } else {
      setForm(initialState)
    }
  }, [empleadoInicial])

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
      <label style={labelStyle}>Nombre completo</label>
      <input name="nombre_completo" value={form.nombre_completo} onChange={handleChange} required style={inputStyle} />

      <label style={labelStyle}>Correo</label>
      <input type="email" name="correo" value={form.correo} onChange={handleChange} required style={inputStyle} placeholder="nombre@alam.mx" />

      <div style={rowStyle}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Departamento</label>
          <select name="departamento" value={form.departamento} onChange={handleChange} required style={inputStyle}>
            <option value="">-- Selecciona --</option>
            {departamentos.map(dep => (
              <option key={dep.id} value={dep.id}>{dep.nombre}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Estatus</label>
          <select name="estatus" value={form.estatus} onChange={handleChange} style={inputStyle}>
            <option value="activo">Activo</option>
            <option value="baja">Baja</option>
          </select>
        </div>
      </div>

      <label style={labelStyle}>Puesto</label>
      <input name="puesto" value={form.puesto} onChange={handleChange} required style={inputStyle} />

      <div style={rowStyle}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Teléfono</label>
          <input name="telefono" value={form.telefono || ''} onChange={handleChange} style={inputStyle} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Fecha de ingreso</label>
          <input type="date" name="fecha_ingreso" value={form.fecha_ingreso || ''} onChange={handleChange} style={inputStyle} />
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
          backgroundColor: 'transparent', color: 'var(--sec-texto)', border: '1px solid var(--sec-borde)',
          padding: '0.65rem 1.25rem', borderRadius: '6px', flex: 1,
        }}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default EmpleadoForm
