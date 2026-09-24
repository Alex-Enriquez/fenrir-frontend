import { useState, useEffect } from 'react'

const inputStyle = {
  width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px',
  border: '1px solid #2C3450', backgroundColor: '#0F1420',
  color: '#E8EAF0', marginBottom: '1rem', fontSize: '0.95rem', boxSizing: 'border-box',
}
const labelStyle = { display: 'block', marginBottom: '0.35rem', color: '#9AA3B8', fontSize: '0.85rem' }

const initialState = { nombre: '', ubicacion: '', altura_u: 42 }

function RackForm({ rackInicial, onSubmit, onCancel }) {
  const [form, setForm] = useState(initialState)

  useEffect(() => {
    setForm(rackInicial ? { ...initialState, ...rackInicial } : initialState)
  }, [rackInicial])

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit}>
      <label style={labelStyle}>Nombre del rack</label>
      <input name="nombre" value={form.nombre} onChange={handleChange} required style={inputStyle} placeholder="ej. Rack Servidores - Piso 1" />

      <label style={labelStyle}>Ubicación</label>
      <input name="ubicacion" value={form.ubicacion || ''} onChange={handleChange} style={inputStyle} />

      <label style={labelStyle}>Altura (U's)</label>
      <input type="number" name="altura_u" value={form.altura_u} onChange={handleChange} style={inputStyle} />

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
        <button type="submit" style={{ backgroundColor: '#F8C22E', color: '#0F1420', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '6px', fontWeight: 'bold', flex: 1 }}>
          Guardar
        </button>
        <button type="button" onClick={onCancel} style={{ backgroundColor: 'transparent', color: '#9AA3B8', border: '1px solid #2C3450', padding: '0.65rem 1.25rem', borderRadius: '6px', flex: 1 }}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default RackForm
