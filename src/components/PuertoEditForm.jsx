import { useState, useEffect } from 'react'

const inputStyle = {
  width: '100%', padding: '0.55rem 0.7rem', borderRadius: '6px',
  border: '1px solid var(--campo-borde)', backgroundColor: 'var(--campo-bg)',
  color: 'var(--texto-claro)', marginBottom: '0.85rem', fontSize: '0.88rem', boxSizing: 'border-box',
}
const labelStyle = { display: 'block', marginBottom: '0.3rem', color: 'var(--texto-2)', fontSize: '0.8rem' }

function PuertoEditForm({ puerto, onSubmit, onCancel }) {
  const [form, setForm] = useState(puerto)

  useEffect(() => { setForm(puerto) }, [puerto])

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit}>
      <p style={{ color: 'var(--texto-fuerte)', fontWeight: 700, marginBottom: '1rem' }}>Puerto {form.numero}</p>

      <label style={labelStyle}>Estado</label>
      <select name="estado" value={form.estado} onChange={handleChange} style={inputStyle}>
        <option value="libre">Libre</option>
        <option value="activo">Activo</option>
        <option value="inactivo">Inactivo</option>
      </select>

      <label style={labelStyle}>Conectado a</label>
      <input name="conectado_a" value={form.conectado_a || ''} onChange={handleChange} style={inputStyle} placeholder="ej. PC de Juan Pérez" />

      <div style={{ display: 'flex', gap: '0.6rem' }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Velocidad</label>
          <select name="velocidad" value={form.velocidad || ''} onChange={handleChange} style={inputStyle}>
            <option value="">--</option>
            <option value="100M">100M</option>
            <option value="1G">1G</option>
            <option value="10G">10G</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>VLAN</label>
          <input name="vlan" value={form.vlan || ''} onChange={handleChange} style={inputStyle} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.5rem' }}>
        <button type="submit" style={{ backgroundColor: 'var(--accion)', color: 'var(--sobre-accion)', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', flex: 1, fontSize: '0.85rem' }}>
          Guardar
        </button>
        <button type="button" onClick={onCancel} style={{ backgroundColor: 'transparent', color: 'var(--texto-2)', border: '1px solid var(--campo-borde)', padding: '0.5rem 1rem', borderRadius: '6px', flex: 1, fontSize: '0.85rem' }}>
          Cerrar
        </button>
      </div>
    </form>
  )
}

export default PuertoEditForm
