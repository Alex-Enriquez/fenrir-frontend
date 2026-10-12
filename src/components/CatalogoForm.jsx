import { useState, useEffect } from 'react'

const inputStyle = {
  width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px',
  border: '1px solid var(--campo-borde)', backgroundColor: 'var(--campo-bg)',
  color: 'var(--texto-claro)', marginBottom: '1rem', fontSize: '0.95rem', boxSizing: 'border-box',
}
const labelStyle = { display: 'block', marginBottom: '0.35rem', color: 'var(--texto-2)', fontSize: '0.85rem' }

// Formulario de un elemento de catálogo: nombre y, solo en los tipos de licencia, el proveedor.
function CatalogoForm({ inicial, conProveedor, ejemploNombre, onSubmit, onCancel }) {
  const [form, setForm] = useState({ nombre: '', proveedor: '' })
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    setForm({ nombre: inicial?.nombre || '', proveedor: inicial?.proveedor || '' })
  }, [inicial])

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
      <label htmlFor="catalogo-nombre" style={labelStyle}>Nombre</label>
      <input
        id="catalogo-nombre" name="nombre" value={form.nombre} onChange={handleChange}
        required autoFocus maxLength={100} style={inputStyle} placeholder={ejemploNombre}
      />

      {conProveedor && (
        <>
          <label htmlFor="catalogo-proveedor" style={labelStyle}>Proveedor (opcional)</label>
          <input
            id="catalogo-proveedor" name="proveedor" value={form.proveedor} onChange={handleChange}
            maxLength={100} style={inputStyle} placeholder="ej. Microsoft, Adobe"
          />
        </>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
        <button
          type="submit" disabled={guardando}
          style={{
            backgroundColor: 'var(--accion)', color: 'var(--sobre-accion)', border: 'none',
            padding: '0.65rem 1.25rem', borderRadius: '6px', fontWeight: 'bold', flex: 1,
            opacity: guardando ? 0.7 : 1,
          }}
        >
          {guardando ? 'Guardando...' : 'Guardar'}
        </button>
        <button
          type="button" onClick={onCancel} disabled={guardando}
          style={{
            backgroundColor: 'var(--cancel-bg)', color: 'var(--cancel-texto)', border: '1px solid var(--cancel-borde)',
            padding: '0.65rem 1.25rem', borderRadius: '6px', flex: 1,
          }}
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default CatalogoForm
