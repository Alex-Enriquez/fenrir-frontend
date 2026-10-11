import { useState, useEffect } from 'react'

const inputStyle = {
  width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px',
  border: '1px solid var(--campo-borde)', backgroundColor: 'var(--campo-bg)',
  color: 'var(--texto-claro)', marginBottom: '1rem', fontSize: '0.95rem', boxSizing: 'border-box',
}
const labelStyle = { display: 'block', marginBottom: '0.35rem', color: 'var(--texto-2)', fontSize: '0.85rem' }

function LicenciaCardForm({ licenciaInicial, onSubmit, onCancel }) {
  const [etiqueta, setEtiqueta] = useState('')
  const [claveProducto, setClaveProducto] = useState('')
  const [asientos, setAsientos] = useState(5)

  useEffect(() => {
    if (licenciaInicial) {
      setEtiqueta(licenciaInicial.etiqueta || '')
      setClaveProducto(licenciaInicial.clave_producto || '')
      setAsientos(licenciaInicial.asientos_totales || 5)
    } else {
      setEtiqueta('')
      setClaveProducto('')
      setAsientos(5)
    }
  }, [licenciaInicial])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ etiqueta, clave_producto: claveProducto, asientos_totales: asientos })
  }

  return (
    <form onSubmit={handleSubmit}>
      <label style={labelStyle}>Etiqueta / Área (ej. Finanzas)</label>
      <input value={etiqueta} onChange={(e) => setEtiqueta(e.target.value)} style={inputStyle} placeholder="Finanzas" />

      <label style={labelStyle}>Clave de producto (opcional)</label>
      <input value={claveProducto} onChange={(e) => setClaveProducto(e.target.value)} style={inputStyle} placeholder="XXXXX-XXXXX-XXXXX" />

      <label style={labelStyle}>Asientos totales</label>
      <input type="number" min="1" value={asientos} onChange={(e) => setAsientos(e.target.value)} style={inputStyle} />

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

export default LicenciaCardForm
