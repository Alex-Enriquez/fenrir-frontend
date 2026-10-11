import { useState, useEffect } from 'react'

const inputStyle = {
  width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px',
  border: '1px solid var(--campo-borde)', backgroundColor: 'var(--campo-bg)',
  color: 'var(--texto-claro)', marginBottom: '1rem', fontSize: '0.95rem', boxSizing: 'border-box',
}
const labelStyle = { display: 'block', marginBottom: '0.35rem', color: 'var(--texto-2)', fontSize: '0.85rem' }
const rowStyle = { display: 'flex', gap: '0.75rem' }

const initialState = {
  tipo: 'switch', nombre: '', marca: '', modelo: '', numero_serie: '', ip_gestion: '',
  rack: '', posicion_u: '', altura_u: 1, garantia_hasta: '', estado: 'operativo',
  numero_puertos: 24, notas: '',
}

function DispositivoRedForm({ racks, dispositivoInicial, onSubmit, onCancel }) {
  const [form, setForm] = useState(initialState)
  const [guardando, setGuardando] = useState(false)
  const esEdicion = !!dispositivoInicial

  useEffect(() => {
    setForm(dispositivoInicial ? { ...initialState, ...dispositivoInicial } : initialState)
  }, [dispositivoInicial])

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = { ...form, rack: form.rack || null, posicion_u: form.posicion_u || null }
    setGuardando(true)
    Promise.resolve(onSubmit(payload)).finally(() => setGuardando(false))
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-section-title">Identificación</div>
      <div style={rowStyle}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Tipo</label>
          <select name="tipo" value={form.tipo} onChange={handleChange} style={inputStyle}>
            <option value="switch">Switch</option>
            <option value="router">Router</option>
            <option value="access_point">Access Point</option>
            <option value="firewall">Firewall</option>
            <option value="servidor">Servidor físico</option>
            <option value="patch_panel">Patch Panel</option>
            <option value="otro">Otro</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Estado</label>
          <select name="estado" value={form.estado} onChange={handleChange} style={inputStyle}>
            <option value="operativo">Operativo</option>
            <option value="mantenimiento">En mantenimiento</option>
            <option value="fuera_de_linea">Fuera de línea</option>
          </select>
        </div>
      </div>

      <label style={labelStyle}>Nombre</label>
      <input name="nombre" value={form.nombre} onChange={handleChange} required style={inputStyle} placeholder="ej. Switch Core Piso 1" />

      <div style={rowStyle}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Marca</label>
          <input name="marca" value={form.marca || ''} onChange={handleChange} style={inputStyle} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Modelo</label>
          <input name="modelo" value={form.modelo || ''} onChange={handleChange} style={inputStyle} />
        </div>
      </div>

      <div style={rowStyle}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>N° Serie</label>
          <input name="numero_serie" value={form.numero_serie || ''} onChange={handleChange} style={inputStyle} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>IP de gestión</label>
          <input name="ip_gestion" value={form.ip_gestion || ''} onChange={handleChange} style={inputStyle} placeholder="192.168.1.1" />
        </div>
      </div>

      {form.tipo === 'switch' && !esEdicion && (
        <>
          <label style={labelStyle}>Número de puertos</label>
          <input type="number" name="numero_puertos" value={form.numero_puertos} onChange={handleChange} style={inputStyle} />
        </>
      )}

      <div className="form-section-title">Ubicación en rack</div>
      <div style={rowStyle}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Rack (opcional)</label>
          <select name="rack" value={form.rack || ''} onChange={handleChange} style={inputStyle}>
            <option value="">-- Sin asignar --</option>
            {racks.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Posición U (inicial)</label>
          <input type="number" name="posicion_u" value={form.posicion_u || ''} onChange={handleChange} style={inputStyle} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Altura (U's)</label>
          <input type="number" name="altura_u" value={form.altura_u} onChange={handleChange} style={inputStyle} />
        </div>
      </div>

      <label style={labelStyle}>Garantía hasta</label>
      <input type="date" name="garantia_hasta" value={form.garantia_hasta || ''} onChange={handleChange} style={inputStyle} />

      <label style={labelStyle}>Notas</label>
      <textarea name="notas" value={form.notas || ''} onChange={handleChange} rows="2" style={inputStyle} />

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
        <button type="submit" disabled={guardando} style={{ backgroundColor: '#F8C22E', color: '#0F1420', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '6px', fontWeight: 'bold', flex: 1, opacity: guardando ? 0.6 : 1 }}>
          {guardando ? 'Guardando...' : 'Guardar'}
        </button>
        <button type="button" onClick={onCancel} disabled={guardando} style={{ backgroundColor: 'transparent', color: 'var(--texto-2)', border: '1px solid var(--campo-borde)', padding: '0.65rem 1.25rem', borderRadius: '6px', flex: 1 }}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default DispositivoRedForm
