import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus } from 'lucide-react'
import { API_URL } from '../config'

const inputStyle = {
  width: '100%',
  padding: '0.6rem 0.8rem',
  borderRadius: '6px',
  border: '1px solid var(--campo-borde)',
  backgroundColor: 'var(--campo-bg)',
  color: 'var(--texto-claro)',
  marginBottom: '1rem',
  fontSize: '0.95rem',
}

const rowStyle = { display: 'flex', gap: '0.75rem' }
const labelStyle = { display: 'block', marginBottom: '0.35rem', color: 'var(--texto-2)', fontSize: '0.85rem' }

const initialState = {
  categoria: '', marca: '', modelo: '', numero_serie: '', numero_inventario: '', imei: '',
  procesador: '',
  ram_capacidad: '', ram_tipo: '', ram_formato: '',
  disco_tipo: '', disco_capacidad: '',
  estado: 'disponible', ubicacion: '',
}

function parseRam(memoria_ram) {
  if (!memoria_ram) return { ram_capacidad: '', ram_tipo: '', ram_formato: '' }
  const partes = memoria_ram.split(' ')
  const capacidad = partes.find(p => /^\d+GB$/i.test(p.replace(' ', ''))) || (partes[0] + (partes[1] === 'GB' ? 'GB' : ''))
  const tipo = partes.find(p => /^DDR[345]$/i.test(p)) || ''
  const formato = memoria_ram.toUpperCase().includes('SO-DIMM') || memoria_ram.toUpperCase().includes('SODIMM') ? 'SO-DIMM' : (memoria_ram.toUpperCase().includes('DIMM') ? 'DIMM' : '')
  return {
    ram_capacidad: /^\d+GB$/i.test(capacidad) ? capacidad.replace('GB', '') : '',
    ram_tipo: tipo,
    ram_formato: formato,
  }
}

function EquipoForm({ categorias, equipoInicial, onSubmit, onCancel, onCategoriaCreada }) {
  const [form, setForm] = useState(initialState)
  const [creandoCategoria, setCreandoCategoria] = useState(false)
  const [nombreNuevaCategoria, setNombreNuevaCategoria] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (equipoInicial) {
      setForm({ ...initialState, ...equipoInicial, ...parseRam(equipoInicial.memoria_ram) })
    } else {
      setForm(initialState)
    }
  }, [equipoInicial])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const memoria_ram = [
      form.ram_capacidad ? `${form.ram_capacidad}GB` : '',
      form.ram_tipo,
      form.ram_formato,
    ].filter(Boolean).join(' ')

    setGuardando(true)
    Promise.resolve(onSubmit({ ...form, memoria_ram })).finally(() => setGuardando(false))
  }

  const crearCategoria = () => {
    if (!nombreNuevaCategoria.trim()) return
    axios.post(`${API_URL}/categorias-equipo/`, { nombre: nombreNuevaCategoria.trim() })
      .then(res => {
        setForm(prev => ({ ...prev, categoria: res.data.id }))
        setNombreNuevaCategoria('')
        setCreandoCategoria(false)
        if (onCategoriaCreada) onCategoriaCreada()
      })
      .catch(() => alert('No se pudo crear la categoría (¿ya existe?).'))
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-section-title">Identificación</div>

      <div style={rowStyle}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Categoría</label>
          {!creandoCategoria ? (
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <select name="categoria" value={form.categoria} onChange={handleChange} required style={{ ...inputStyle, flex: 1 }}>
                <option value="">-- Selecciona --</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setCreandoCategoria(true)}
                title="Nueva categoría"
                style={{
                  background: 'rgba(248,194,46,0.12)', border: '1px solid rgba(248,194,46,0.3)',
                  borderRadius: '6px', color: 'var(--acento-texto)', padding: '0 0.7rem', display: 'flex', alignItems: 'center',
                }}
              >
                <Plus size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <input
                value={nombreNuevaCategoria}
                onChange={(e) => setNombreNuevaCategoria(e.target.value)}
                placeholder="ej. Mouse, Teclado, Monitor"
                autoFocus
                style={{ ...inputStyle, flex: 1 }}
              />
              <button type="button" onClick={crearCategoria} style={{ background: 'var(--accion)', border: 'none', borderRadius: '6px', color: 'var(--sobre-accion)', padding: '0 0.9rem', fontWeight: 700 }}>
                Crear
              </button>
              <button type="button" onClick={() => setCreandoCategoria(false)} style={{ background: 'transparent', border: '1px solid var(--sec-borde)', borderRadius: '6px', color: 'var(--sec-texto)', padding: '0 0.7rem' }}>
                X
              </button>
            </div>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Estado</label>
          <select name="estado" value={form.estado} onChange={handleChange} style={inputStyle}>
            <option value="disponible">Disponible</option>
            <option value="asignado">Asignado</option>
            <option value="reparacion">En reparación</option>
            <option value="baja">De baja</option>
          </select>
        </div>
      </div>

      <div style={rowStyle}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Marca</label>
          <input name="marca" value={form.marca} onChange={handleChange} required style={inputStyle} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Modelo</label>
          <input name="modelo" value={form.modelo} onChange={handleChange} required style={inputStyle} />
        </div>
      </div>

      <div style={rowStyle}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Número de serie</label>
          <input name="numero_serie" value={form.numero_serie} onChange={handleChange} style={inputStyle} placeholder="Deja vacío si no tiene" />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Número de inventario</label>
          <input name="numero_inventario" value={form.numero_inventario || ''} onChange={handleChange} style={inputStyle} placeholder="ej. ALX-PER-0001" />
        </div>
      </div>

      <div style={rowStyle}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>IMEI</label>
          <input name="imei" value={form.imei || ''} onChange={handleChange} style={inputStyle} placeholder="Solo celulares y tablets con SIM" maxLength={20} />
        </div>
        <div style={{ flex: 1 }} />
      </div>

      <div className="form-section-title">Especificaciones técnicas</div>

      <label style={labelStyle}>Procesador (si aplica)</label>
      <input name="procesador" value={form.procesador} onChange={handleChange} style={inputStyle} placeholder="ej. Intel Core i7-7600U" />

      <label style={{ ...labelStyle, marginTop: '0.25rem' }}>Memoria RAM (si aplica)</label>
      <div style={rowStyle}>
        <select name="ram_capacidad" value={form.ram_capacidad} onChange={handleChange} style={inputStyle}>
          <option value="">Capacidad</option>
          <option value="4">4 GB</option>
          <option value="8">8 GB</option>
          <option value="16">16 GB</option>
          <option value="32">32 GB</option>
          <option value="64">64 GB</option>
        </select>
        <select name="ram_tipo" value={form.ram_tipo} onChange={handleChange} style={inputStyle}>
          <option value="">Tipo</option>
          <option value="DDR3">DDR3</option>
          <option value="DDR4">DDR4</option>
          <option value="DDR5">DDR5</option>
        </select>
        <select name="ram_formato" value={form.ram_formato} onChange={handleChange} style={inputStyle}>
          <option value="">Formato</option>
          <option value="DIMM">DIMM</option>
          <option value="SO-DIMM">SO-DIMM</option>
        </select>
      </div>

      <div style={rowStyle}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Tipo de disco (si aplica)</label>
          <select name="disco_tipo" value={form.disco_tipo} onChange={handleChange} style={inputStyle}>
            <option value="">-- Selecciona --</option>
            <option value="SSD">SSD</option>
            <option value="HDD">HDD</option>
            <option value="M2">M.2 NVMe</option>
            <option value="MIXTO">Mixto (SSD+HDD)</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Capacidad de disco</label>
          <select name="disco_capacidad" value={form.disco_capacidad} onChange={handleChange} style={inputStyle}>
            <option value="">-- Selecciona --</option>
            <option value="128 GB">128 GB</option>
            <option value="256 GB">256 GB</option>
            <option value="512 GB">512 GB</option>
            <option value="1 TB">1 TB</option>
            <option value="2 TB">2 TB</option>
          </select>
        </div>
      </div>

      <div className="form-section-title">Ubicación</div>

      <label style={labelStyle}>Ubicación</label>
      <input name="ubicacion" value={form.ubicacion} onChange={handleChange} style={inputStyle} />

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
        <button
          type="button"
          onClick={onCancel}
          disabled={guardando}
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

export default EquipoForm
