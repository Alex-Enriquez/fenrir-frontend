import { useState } from 'react'
import axios from 'axios'
import { Plus } from 'lucide-react'
import { useEsAdmin } from '../context/perfil'
import { API_URL } from '../config'

function mensajeDe(err) {
  const r = err?.response
  if (!r) return 'No hay conexión con el servidor.'
  if (r.status === 403) return 'Solo un administrador puede crear elementos de catálogo.'
  const d = r.data
  if (d && typeof d === 'object') {
    if (d.detail) return String(d.detail)
    const primero = Object.values(d).flat()[0]
    if (primero) return String(primero)
  }
  return 'No se pudo crear.'
}

// Lista desplegable de un catálogo con un "+" para crear un elemento nuevo sin salir del formulario.
// El "+" solo lo ve un administrador. Al crear, se elige el nuevo elemento y se avisa con onCreada
// (para que la pantalla recargue SOLO esa lista, sin tocar lo que ya se escribió en el formulario).
function SelectConCrear({ name, value, onChange, opciones, renderEtiqueta, ruta, ejemplo, tituloNuevo, onCreada, required, inputStyle }) {
  const esAdmin = useEsAdmin()
  const [creando, setCreando] = useState(false)
  const [nombre, setNombre] = useState('')
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const etiqueta = renderEtiqueta || ((o) => o.nombre)

  const cancelar = () => { setCreando(false); setNombre(''); setError(null) }

  const crear = () => {
    const limpio = nombre.trim()
    if (!limpio || enviando) return
    setEnviando(true)
    setError(null)
    axios.post(`${API_URL}/${ruta}/`, { nombre: limpio })
      .then(res => {
        setNombre('')
        setCreando(false)
        if (onCreada) onCreada(res.data)
        onChange({ target: { name, value: res.data.id } })
      })
      .catch(err => setError(mensajeDe(err)))
      .finally(() => setEnviando(false))
  }

  if (creando) {
    return (
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <input
            value={nombre} aria-label={tituloNuevo} placeholder={ejemplo} autoFocus maxLength={100}
            onChange={(e) => setNombre(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); crear() } }}
            style={{ ...inputStyle, flex: 1, marginBottom: 0 }}
          />
          <button
            type="button" onClick={crear} disabled={enviando}
            style={{ background: 'var(--accion)', border: 'none', borderRadius: '6px', color: 'var(--sobre-accion)', padding: '0 0.9rem', fontWeight: 700, opacity: enviando ? 0.7 : 1 }}
          >
            {enviando ? 'Creando...' : 'Crear'}
          </button>
          <button
            type="button" onClick={cancelar} aria-label="Cancelar"
            style={{ background: 'transparent', border: '1px solid var(--sec-borde)', borderRadius: '6px', color: 'var(--sec-texto)', padding: '0 0.7rem' }}
          >
            X
          </button>
        </div>
        {error && <div role="alert" style={{ color: 'var(--peligro-texto)', fontSize: '0.8rem', marginTop: '0.35rem' }}>{error}</div>}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem' }}>
      <select name={name} value={value} onChange={onChange} required={required} style={{ ...inputStyle, flex: 1, marginBottom: 0 }}>
        <option value="">-- Selecciona --</option>
        {opciones.map(o => (
          <option key={o.id} value={o.id}>{etiqueta(o)}</option>
        ))}
      </select>
      {esAdmin && (
        <button
          type="button" onClick={() => setCreando(true)} title={tituloNuevo} aria-label={tituloNuevo}
          style={{
            background: 'rgba(248,194,46,0.12)', border: '1px solid rgba(248,194,46,0.3)',
            borderRadius: '6px', color: 'var(--acento-texto)', padding: '0 0.7rem', display: 'flex', alignItems: 'center',
          }}
        >
          <Plus size={16} />
        </button>
      )}
    </div>
  )
}

export default SelectConCrear
