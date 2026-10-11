import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'

const inputStyle = {
  width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px',
  border: '1px solid var(--campo-borde)', backgroundColor: 'var(--campo-bg)',
  color: 'var(--texto-claro)', marginBottom: '1rem', fontSize: '0.95rem', boxSizing: 'border-box',
}
const labelStyle = { display: 'block', marginBottom: '0.35rem', color: 'var(--texto-2)', fontSize: '0.85rem' }
const rowStyle = { display: 'flex', gap: '0.75rem' }

const initialState = { nombre: '', servicio: '', contacto: '', telefono: '', correo: '', calificacion: 0, notas: '' }

function SelectorEstrellas({ valor, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '1rem' }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n === valor ? 0 : n)}
          style={{ background: 'none', border: 'none', padding: 0, display: 'flex' }}
        >
          <Star size={22} color={n <= valor ? '#F8C22E' : '#2C3450'} fill={n <= valor ? '#F8C22E' : 'none'} />
        </button>
      ))}
    </div>
  )
}

function ProveedorForm({ proveedorInicial, onSubmit, onCancel }) {
  const [form, setForm] = useState(initialState)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (proveedorInicial) {
      setForm({ ...initialState, ...proveedorInicial })
    } else {
      setForm(initialState)
    }
  }, [proveedorInicial])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setGuardando(true)
    Promise.resolve(onSubmit(form)).finally(() => setGuardando(false))
  }

  return (
    <form onSubmit={handleSubmit}>
      <label style={labelStyle}>Nombre del proveedor</label>
      <input name="nombre" value={form.nombre} onChange={handleChange} required style={inputStyle} />

      <label style={labelStyle}>Servicio que ofrece</label>
      <input name="servicio" value={form.servicio || ''} onChange={handleChange} style={inputStyle} placeholder="ej. Internet, Hardware, Soporte técnico" />

      <div style={rowStyle}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Persona de contacto</label>
          <input name="contacto" value={form.contacto || ''} onChange={handleChange} style={inputStyle} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Teléfono</label>
          <input name="telefono" value={form.telefono || ''} onChange={handleChange} style={inputStyle} />
        </div>
      </div>

      <label style={labelStyle}>Correo</label>
      <input type="email" name="correo" value={form.correo || ''} onChange={handleChange} style={inputStyle} />

      <label style={labelStyle}>Calificación</label>
      <SelectorEstrellas valor={form.calificacion} onChange={(v) => setForm(prev => ({ ...prev, calificacion: v }))} />

      <label style={labelStyle}>Notas</label>
      <textarea name="notas" value={form.notas || ''} onChange={handleChange} rows="2" style={inputStyle} />

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
        <button
          type="submit"
          disabled={guardando}
          style={{
            backgroundColor: 'var(--accion)', color: 'var(--sobre-accion)', border: 'none',
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

export default ProveedorForm
