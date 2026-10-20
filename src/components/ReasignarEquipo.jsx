import { useState } from 'react'
import axios from 'axios'
import Modal from './Modal'
import ResponsivaForm from './ResponsivaForm'
import { useEsAdmin } from '../context/perfil'
import { API_URL } from '../config'

function mensajeDeError(err) {
  const r = err?.response
  if (!r) return 'No hay conexión con el servidor.'
  if (r.status === 403) return 'Solo un administrador puede generar responsivas.'
  const d = r.data
  if (d && typeof d === 'object') {
    if (d.detail) return String(d.detail)
    const primero = Object.values(d).flat()[0]
    if (primero) return typeof primero === 'object' ? JSON.stringify(primero) : String(primero)
  }
  return 'No se pudo generar la responsiva.'
}

// Qué decirle al administrador cuando una persona se queda sin equipos (no se hace nada automático).
function notaDeSalida(g) {
  if (g.restantes > 0) return null
  if (g.licencias > 0) {
    return `${g.de} ya no tiene equipos, pero aún tiene ${g.licencias} ${g.licencias === 1 ? 'licencia asignada' : 'licencias asignadas'}.`
  }
  return `${g.de} ya no tiene equipos ni licencias asignados. Si dejó la empresa, márcalo como «Baja» en Empleados.`
}

const botonPrincipal = {
  backgroundColor: 'var(--accion)', color: 'var(--sobre-accion)', border: 'none',
  padding: '0.65rem 1.25rem', borderRadius: '6px', fontWeight: 'bold', flex: 1,
}
const botonSecundario = {
  backgroundColor: 'transparent', color: 'var(--sec-texto)', border: '1px solid var(--sec-borde)',
  padding: '0.65rem 1.25rem', borderRadius: '6px', flex: 1,
}

// Reasignar un equipo = generar la responsiva de la persona nueva: al guardarla, el servidor cierra la asignación
// anterior y abre la nueva. Siempre montado (para conservar el aviso "Responsiva generada" al cerrar el formulario).
function ReasignarEquipo({ asignacion, empleados, equipos, asignaciones, mostrarToast, onClose, onHecho }) {
  const esAdmin = useEsAdmin()
  const [generada, setGenerada] = useState(null)

  const viejoId = asignacion?.empleado
  const viejo = empleados.find(e => e.id === viejoId)
  const nombreViejo = viejo?.nombre_completo || asignacion?.empleado_nombre || 'la persona anterior'
  const activas = asignaciones.filter(a => a.empleado === viejoId && !a.fecha_devolucion)
  const idsEquipos = activas.filter(a => a.equipo && !a.licencia).map(a => a.equipo)
  const licenciasActivas = activas.filter(a => a.licencia).length

  const handleSubmit = (form) => {
    const movidos = form.items.map(i => i.equipo)
    return axios.post(`${API_URL}/responsivas/`, form)
      .then(res => {
        setGenerada({
          id: res.data.id, folio: res.data.folio, para: res.data.empleado_nombre, de: nombreViejo,
          cantidad: movidos.length, restantes: idsEquipos.filter(id => !movidos.includes(id)).length, licencias: licenciasActivas,
        })
        onClose()
        if (onHecho) onHecho()
      })
      .catch(err => mostrarToast(mensajeDeError(err)))
  }

  const verPdf = () => {
    axios.get(`${API_URL}/responsivas/${generada.id}/pdf/`, { responseType: 'blob' })
      .then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
        window.open(url, '_blank')
      })
      .catch(() => mostrarToast('No se pudo abrir el PDF.'))
  }

  const nota = generada ? notaDeSalida(generada) : null

  return (
    <>
      <Modal isOpen={!!asignacion} onClose={onClose} title={`Reasignar equipo de ${nombreViejo}`}>
        {esAdmin === null ? (
          <p>Cargando...</p>
        ) : esAdmin === false ? (
          <div>
            <p style={{ color: 'var(--texto-tenue)', fontSize: '0.9rem' }}>
              Reasignar un equipo genera su responsiva, y solo un administrador puede hacerlo.
            </p>
            <button onClick={onClose} style={{ ...botonSecundario, width: '100%' }}>Cerrar</button>
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--texto-tenue)', fontSize: '0.86rem', margin: '0 0 1rem' }}>
              El equipo pasa de <strong>{nombreViejo}</strong> a la persona que elijas, y se genera su responsiva.
            </p>
            <ResponsivaForm
              empleados={empleados.filter(e => e.id !== viejoId)}
              equipos={equipos}
              equiposIniciales={asignacion?.equipo ? [asignacion.equipo] : []}
              equiposExtraElegibles={idsEquipos}
              incluirTodo={idsEquipos.length > 1 ? { ids: idsEquipos, texto: `Incluir todo lo de ${nombreViejo} (${idsEquipos.length} equipos)` } : null}
              textoEnviar="Reasignar y generar responsiva"
              onSubmit={handleSubmit}
              onCancel={onClose}
            />
          </>
        )}
      </Modal>

      <Modal isOpen={!!generada} onClose={() => setGenerada(null)} title="Responsiva generada">
        {generada && (
          <div>
            <p style={{ color: 'var(--texto-claro)', fontSize: '0.92rem', margin: '0 0 0.75rem' }}>
              Folio <strong>{generada.folio}</strong>.{' '}
              {generada.cantidad === 1 ? 'El equipo ya está asignado' : `Los ${generada.cantidad} equipos ya están asignados`} a <strong>{generada.para}</strong>.
            </p>
            {nota && <p style={{ color: 'var(--texto-tenue)', fontSize: '0.84rem', margin: '0 0 1rem' }}>{nota}</p>}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={verPdf} style={botonPrincipal}>Ver PDF</button>
              <button onClick={() => setGenerada(null)} style={botonSecundario}>Cerrar</button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}

export default ReasignarEquipo
