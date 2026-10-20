import { useState } from 'react'
import SelectConCrear from './SelectConCrear'

const inputStyle = {
  width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px',
  border: '1px solid var(--campo-borde)', backgroundColor: 'var(--campo-bg)',
  color: 'var(--texto-claro)', marginBottom: '1rem', fontSize: '0.95rem', boxSizing: 'border-box',
}
const labelStyle = { display: 'block', marginBottom: '0.35rem', color: 'var(--texto-2)', fontSize: '0.85rem' }
const rowStyle = { display: 'flex', gap: '0.75rem' }

export const TIPOS = [
  { clave: 'extension', etiqueta: 'Extensión', plural: 'Extensiones' },
  { clave: 'celular', etiqueta: 'Celular', plural: 'Celulares' },
  { clave: 'fijo', etiqueta: 'Línea fija', plural: 'Líneas fijas' },
]

export function formatearNumero(tipo, numero) {
  const n = String(numero || '')
  return tipo !== 'extension' && /^\d{10}$/.test(n) ? `${n.slice(0, 2)} ${n.slice(2, 6)} ${n.slice(6)}` : n
}

const esDeTelefono = (e) => /cel|tel[eé]fono|tablet/i.test(e.categoria_nombre || '')

// Alta y edición de una entrada del directorio (extensión, celular o línea fija de la empresa).
function DirectorioForm({ inicial, empleados, departamentos, equipos, onSubmit, onCancel, onDepartamentoCreado }) {
  const [form, setForm] = useState(() => ({
    tipo: inicial?.tipo || 'extension',
    numero: inicial ? formatearNumero(inicial.tipo, inicial.numero) : '',
    nombre: inicial?.nombre || '',
    empleado: inicial?.empleado ?? '',
    departamento: inicial?.departamento ?? '',
    ubicacion: inicial?.ubicacion || '',
    operador: inicial ? (inicial.operador || '') : '',
    plan: inicial?.plan || '',
    chip: inicial?.chip || '',
    equipo: inicial?.equipo ?? '',
    notas: inicial?.notas || '',
    activo: inicial ? !!inicial.activo : true,
  }))
  const [guardando, setGuardando] = useState(false)
  const esExtension = form.tipo === 'extension'

  const cambiar = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }
  const cambiarTipo = (e) => {
    const tipo = e.target.value
    setForm(prev => ({ ...prev, tipo, operador: tipo === 'celular' && !prev.operador && !inicial ? 'Telcel' : prev.operador }))
  }
  const elegirEmpleado = (e) => {
    const id = e.target.value
    const emp = empleados.find(x => String(x.id) === String(id))
    setForm(prev => ({ ...prev, empleado: id, nombre: !prev.nombre && emp ? emp.nombre_completo : prev.nombre }))
  }

  const equiposDeTelefono = equipos.filter(esDeTelefono)
  const opcionesEquipo = equiposDeTelefono.length > 0 ? equiposDeTelefono : equipos

  const handleSubmit = (e) => {
    e.preventDefault()
    setGuardando(true)
    Promise.resolve(onSubmit({
      tipo: form.tipo,
      numero: form.numero,
      nombre: form.nombre.trim(),
      empleado: form.empleado === '' ? null : Number(form.empleado),
      departamento: form.departamento === '' ? null : Number(form.departamento),
      ubicacion: form.ubicacion.trim(),
      operador: esExtension ? '' : form.operador.trim(),
      plan: esExtension ? '' : form.plan.trim(),
      chip: esExtension ? '' : form.chip.trim(),
      equipo: esExtension || form.equipo === '' ? null : Number(form.equipo),
      notas: form.notas,
      activo: form.activo,
    })).finally(() => setGuardando(false))
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={rowStyle}>
        <div style={{ flex: 1 }}>
          <label htmlFor="dir-tipo" style={labelStyle}>Tipo</label>
          <select id="dir-tipo" name="tipo" value={form.tipo} onChange={cambiarTipo} style={inputStyle}>
            {TIPOS.map(t => <option key={t.clave} value={t.clave}>{t.etiqueta}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label htmlFor="dir-numero" style={labelStyle}>{esExtension ? 'Extensión' : 'Número (10 dígitos)'}</label>
          <input
            id="dir-numero" name="numero" value={form.numero} onChange={cambiar} required autoFocus maxLength={20}
            placeholder={esExtension ? 'ej. 502' : 'ej. 55 1234 5678'} style={inputStyle}
          />
        </div>
      </div>

      <label htmlFor="dir-empleado" style={labelStyle}>Empleado (opcional)</label>
      <select id="dir-empleado" name="empleado" value={form.empleado} onChange={elegirEmpleado} style={inputStyle}>
        <option value="">-- Ninguno (es un área) --</option>
        {[...empleados].sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo)).map(emp => (
          <option key={emp.id} value={emp.id}>{emp.nombre_completo}</option>
        ))}
      </select>

      <label htmlFor="dir-nombre" style={labelStyle}>Nombre o área</label>
      <input
        id="dir-nombre" name="nombre" value={form.nombre} onChange={cambiar} required={form.empleado === ''} maxLength={150}
        placeholder="ej. Recepción, Sala de juntas, Almacén" style={inputStyle}
      />

      <div style={rowStyle}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Departamento (opcional)</label>
          <SelectConCrear
            name="departamento" value={form.departamento} onChange={cambiar} opciones={departamentos}
            ruta="departamentos" ejemplo="ej. Compras" tituloNuevo="Nuevo departamento"
            onCreada={onDepartamentoCreado} inputStyle={inputStyle}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label htmlFor="dir-ubicacion" style={labelStyle}>Ubicación (opcional)</label>
          <input id="dir-ubicacion" name="ubicacion" value={form.ubicacion} onChange={cambiar} maxLength={100} placeholder="ej. Planta baja" style={inputStyle} />
        </div>
      </div>

      {!esExtension && (
        <>
          <div style={rowStyle}>
            <div style={{ flex: 1 }}>
              <label htmlFor="dir-operador" style={labelStyle}>Operador</label>
              <input id="dir-operador" name="operador" value={form.operador} onChange={cambiar} maxLength={50} placeholder="ej. Telcel" style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor="dir-plan" style={labelStyle}>Plan</label>
              <input id="dir-plan" name="plan" value={form.plan} onChange={cambiar} maxLength={100} placeholder="ej. Plan Empresarial 5 GB" style={inputStyle} />
            </div>
          </div>
          <div style={rowStyle}>
            <div style={{ flex: 1 }}>
              <label htmlFor="dir-chip" style={labelStyle}>Número de chip (ICCID)</label>
              <input id="dir-chip" name="chip" value={form.chip} onChange={cambiar} maxLength={25} style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor="dir-equipo" style={labelStyle}>Equipo donde se usa</label>
              <select id="dir-equipo" name="equipo" value={form.equipo} onChange={cambiar} style={inputStyle}>
                <option value="">-- Ninguno --</option>
                {opcionesEquipo.map(eq => (
                  <option key={eq.id} value={eq.id}>{eq.marca} {eq.modelo}{eq.imei ? ` · IMEI ${eq.imei}` : ''}</option>
                ))}
              </select>
            </div>
          </div>
        </>
      )}

      <label htmlFor="dir-notas" style={labelStyle}>Notas (solo las ven los administradores)</label>
      <textarea id="dir-notas" name="notas" value={form.notas} onChange={cambiar} rows="2" style={inputStyle} />

      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--texto-2)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
        <input type="checkbox" checked={form.activo} onChange={(e) => setForm(prev => ({ ...prev, activo: e.target.checked }))} />
        Activo (si ya no se usa, desmárcalo en lugar de borrarlo)
      </label>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          type="submit" disabled={guardando}
          style={{ backgroundColor: 'var(--accion)', color: 'var(--sobre-accion)', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '6px', fontWeight: 'bold', flex: 1, opacity: guardando ? 0.7 : 1 }}
        >
          {guardando ? 'Guardando...' : 'Guardar'}
        </button>
        <button
          type="button" onClick={onCancel} disabled={guardando}
          style={{ backgroundColor: 'var(--cancel-bg)', color: 'var(--cancel-texto)', border: '1px solid var(--cancel-borde)', padding: '0.65rem 1.25rem', borderRadius: '6px', flex: 1 }}
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default DirectorioForm
