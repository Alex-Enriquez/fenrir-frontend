import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { Plus, Search, Pencil, Trash2, Copy, Phone, Smartphone, PhoneCall, Download } from '../ui/icons'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import DirectorioForm, { TIPOS, formatearNumero } from '../components/DirectorioForm'
import Toast from '../components/Toast'
import { useEsAdmin } from '../context/perfil'
import { API_URL } from '../config'

const ICONOS = { extension: Phone, celular: Smartphone, fijo: PhoneCall }

const sinAcentos = (t) => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

function mensajeDeError(err, porDefecto) {
  const r = err?.response
  if (!r) return 'No hay conexión con el servidor.'
  if (r.status === 403) return 'Solo un administrador puede cambiar el directorio.'
  const d = r.data
  if (d && typeof d === 'object') {
    if (d.detail) return String(d.detail)
    const primero = Object.values(d).flat()[0]
    if (primero) return String(primero)
  }
  return porDefecto
}

// Copia el número; si el navegador no permite el portapapeles (por ejemplo, una página que no es https), usa un plan B.
async function copiar(texto) {
  try {
    await navigator.clipboard.writeText(texto)
    return true
  } catch (e) {
    try {
      const area = document.createElement('textarea')
      area.value = texto
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      const bien = document.execCommand('copy')
      document.body.removeChild(area)
      return bien
    } catch (e2) {
      return false
    }
  }
}

function Directorio() {
  const esAdmin = useEsAdmin() === true
  const [lineas, setLineas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState('todos')
  const [verInactivos, setVerInactivos] = useState(false)
  const [toast, setToast] = useState(null)

  const [empleados, setEmpleados] = useState([])
  const [departamentos, setDepartamentos] = useState([])
  const [equipos, setEquipos] = useState([])

  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [aEliminar, setAEliminar] = useState(null)
  const [recarga, setRecarga] = useState(0)

  const mostrarToast = (mensaje, tipo = 'error') => setToast({ mensaje, tipo, key: Date.now() })
  const recargar = () => setRecarga(n => n + 1)

  useEffect(() => {
    let vivo = true
    axios.get(`${API_URL}/directorio/`)
      .then(res => { if (vivo) { setLineas(res.data); setError(null); setCargando(false) } })
      .catch(err => { if (vivo) { setError(mensajeDeError(err, 'No se pudo cargar el directorio.')); setCargando(false) } })
    return () => { vivo = false }
  }, [recarga])

  // Solo el administrador necesita estas listas (para el formulario).
  useEffect(() => {
    if (!esAdmin) return
    Promise.all([axios.get(`${API_URL}/empleados/`), axios.get(`${API_URL}/departamentos/`), axios.get(`${API_URL}/equipos/`)])
      .then(([e, d, q]) => { setEmpleados(e.data); setDepartamentos(d.data); setEquipos(q.data) })
      .catch(() => mostrarToast('No se pudieron cargar las listas del formulario.'))
  }, [esAdmin])

  const visibles = useMemo(() => lineas.filter(l => verInactivos || l.activo), [lineas, verInactivos])
  const cuenta = (tipo) => visibles.filter(l => tipo === 'todos' || l.tipo === tipo).length

  const filtradas = useMemo(() => {
    const texto = sinAcentos(busqueda.trim())
    const digitos = busqueda.replace(/\D/g, '')
    return visibles
      .filter(l => filtro === 'todos' || l.tipo === filtro)
      .filter(l => {
        if (!texto) return true
        const campos = [l.nombre, l.departamento_nombre, l.ubicacion, l.numero, formatearNumero(l.tipo, l.numero)]
        if (esAdmin) campos.push(l.operador, l.plan, l.notas)
        return campos.some(c => sinAcentos(c).includes(texto)) || (digitos.length >= 2 && String(l.numero).includes(digitos))
      })
  }, [visibles, filtro, busqueda, esAdmin])

  const abrirNuevo = () => { setEditando(null); setModalAbierto(true) }
  const abrirEditar = (l) => { setEditando(l); setModalAbierto(true) }
  const cerrarModal = () => { setModalAbierto(false); setEditando(null) }

  const handleGuardar = (datos) => {
    const peticion = editando
      ? axios.put(`${API_URL}/directorio/${editando.id}/`, datos)
      : axios.post(`${API_URL}/directorio/`, datos)
    return peticion
      .then(() => { cerrarModal(); recargar(); mostrarToast('Guardado.', 'exito') })
      .catch(err => mostrarToast(mensajeDeError(err, 'No se pudo guardar.')))
  }

  const confirmarEliminar = () => {
    if (!aEliminar) return
    axios.delete(`${API_URL}/directorio/${aEliminar.id}/`)
      .then(() => { setAEliminar(null); recargar(); mostrarToast('Eliminado.', 'exito') })
      .catch(err => { setAEliminar(null); mostrarToast(mensajeDeError(err, 'No se pudo eliminar.')) })
  }

  const handleCopiar = async (l) => {
    const bien = await copiar(l.numero)
    mostrarToast(bien ? `Copiado: ${formatearNumero(l.tipo, l.numero)}` : 'No se pudo copiar el número.', bien ? 'exito' : 'error')
  }

  const exportar = () => {
    axios.get(`${API_URL}/directorio/exportar/`, { responseType: 'blob' })
      .then(res => {
        const url = window.URL.createObjectURL(new Blob([res.data]))
        const enlace = document.createElement('a')
        enlace.href = url
        enlace.download = 'directorio.xlsx'
        document.body.appendChild(enlace)
        enlace.click()
        document.body.removeChild(enlace)
        window.URL.revokeObjectURL(url)
      })
      .catch(() => mostrarToast('No se pudo exportar el directorio.'))
  }

  if (cargando) return <p>Cargando...</p>
  if (error) return <p style={{ color: 'var(--peligro-texto)' }}>{error}</p>

  const estiloChip = (activo) => ({
    display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.9rem', borderRadius: '8px', fontSize: '0.86rem',
    ...(activo
      ? { backgroundColor: 'var(--accion)', color: 'var(--sobre-accion)', border: '1px solid transparent', fontWeight: 700 }
      : { backgroundColor: 'transparent', color: 'var(--sec-texto)', border: '1px solid var(--sec-borde)' }),
  })
  const botonIcono = (extra = {}) => ({ background: 'transparent', border: '1px solid var(--sec-borde)', color: 'var(--sec-texto)', borderRadius: '6px', padding: '0.35rem 0.5rem', display: 'flex', ...extra })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '0.75rem', flexWrap: 'wrap' }}>
        <h1 style={{ color: 'var(--acento-texto)', margin: 0 }}>Directorio</h1>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button
            onClick={exportar}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--exp-bg)', color: 'var(--exp-texto)', border: '1px solid var(--exp-borde)', padding: '0.5rem 0.9rem', borderRadius: '8px', fontSize: '0.9rem' }}
          >
            <Download size={15} /> Exportar Excel
          </button>
          {esAdmin && (
            <button
              onClick={abrirNuevo}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--accion)', color: 'var(--sobre-accion)', border: 'none', padding: '0.6rem 1.1rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.95rem' }}
            >
              <Plus size={18} /> Nueva entrada
            </button>
          )}
        </div>
      </div>

      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <Search size={17} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--texto-4)' }} />
        <input
          value={busqueda} onChange={(e) => setBusqueda(e.target.value)} aria-label="Buscar en el directorio"
          placeholder="Buscar por nombre, número, departamento o ubicación..."
          style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem', borderRadius: '10px', border: '1px solid var(--campo-borde)', backgroundColor: 'var(--campo-bg-2)', color: 'var(--texto-claro)', fontSize: '0.9rem', boxSizing: 'border-box' }}
        />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <button onClick={() => setFiltro('todos')} aria-pressed={filtro === 'todos'} style={estiloChip(filtro === 'todos')}>Todos ({cuenta('todos')})</button>
        {TIPOS.map(t => {
          const Icono = ICONOS[t.clave]
          return (
            <button key={t.clave} onClick={() => setFiltro(t.clave)} aria-pressed={filtro === t.clave} style={estiloChip(filtro === t.clave)}>
              <Icono size={14} /> {t.plural} ({cuenta(t.clave)})
            </button>
          )
        })}
        <label style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--texto-tenue)', fontSize: '0.84rem' }}>
          <input type="checkbox" checked={verInactivos} onChange={(e) => setVerInactivos(e.target.checked)} />
          Mostrar inactivos
        </label>
      </div>

      {filtradas.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--texto-4)', padding: '2rem' }}>
          <p style={{ margin: 0 }}>
            {lineas.length === 0
              ? (esAdmin ? 'Todavía no hay nada en el directorio. Crea la primera entrada con «Nueva entrada».' : 'Todavía no hay nada en el directorio.')
              : 'Nada coincide con tu búsqueda.'}
          </p>
        </div>
      ) : (
        <div className="card">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Número</th>
              <th>Departamento</th>
              <th>Ubicación</th>
              {esAdmin && <th>Línea</th>}
              <th style={{ width: esAdmin ? '130px' : '60px' }} />
            </tr>
          </thead>
          <tbody>
            {filtradas.map((l, i) => {
              const Icono = ICONOS[l.tipo]
              const detalle = [l.operador, l.plan].filter(Boolean).join(' · ')
              return (
                <tr key={l.id} style={{ backgroundColor: i % 2 === 1 ? 'rgba(var(--velo-rgb), 0.015)' : 'transparent', opacity: l.activo ? 1 : 0.55 }}>
                  <td>
                    {l.nombre}
                    {!l.activo && <span style={{ marginLeft: '0.5rem', fontSize: '0.72rem', color: 'var(--texto-4)', border: '1px solid var(--borde-suave)', borderRadius: '999px', padding: '0.05rem 0.45rem' }}>Inactivo</span>}
                  </td>
                  <td>
                    <span className="fx-mono" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                      <Icono size={14} color="var(--texto-4)" /> {formatearNumero(l.tipo, l.numero)}
                    </span>
                  </td>
                  <td style={{ color: 'var(--texto-tenue)' }}>{l.departamento_nombre || '—'}</td>
                  <td style={{ color: 'var(--texto-tenue)' }}>{l.ubicacion || '—'}</td>
                  {esAdmin && (
                    <td style={{ color: 'var(--texto-tenue)', fontSize: '0.84rem' }}>
                      {detalle || '—'}
                      {l.equipo_nombre && <div style={{ fontSize: '0.76rem', color: 'var(--texto-4)' }}>{l.equipo_nombre}</div>}
                    </td>
                  )}
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                      <button aria-label={`Copiar ${formatearNumero(l.tipo, l.numero)}`} title="Copiar el número" onClick={() => handleCopiar(l)} style={botonIcono()}><Copy size={14} /></button>
                      {esAdmin && (
                        <>
                          <button aria-label={`Editar ${l.nombre}`} title="Editar" onClick={() => abrirEditar(l)} style={botonIcono()}><Pencil size={14} /></button>
                          <button
                            aria-label={`Eliminar ${l.nombre}`} title="Eliminar" onClick={() => setAEliminar(l)}
                            style={botonIcono({ backgroundColor: 'var(--cancel-bg)', border: '1px solid var(--cancel-borde)', color: 'var(--cancel-texto)' })}
                          ><Trash2 size={14} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        </div>
      )}

      <Modal isOpen={modalAbierto} onClose={cerrarModal} title={editando ? 'Editar entrada' : 'Nueva entrada del directorio'}>
        <DirectorioForm
          inicial={editando} empleados={empleados} departamentos={departamentos} equipos={equipos}
          onSubmit={handleGuardar} onCancel={cerrarModal}
          onDepartamentoCreado={() => axios.get(`${API_URL}/departamentos/`).then(res => setDepartamentos(res.data))}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!aEliminar}
        title="Eliminar entrada"
        message={aEliminar ? `Se eliminará «${aEliminar.nombre}» (${formatearNumero(aEliminar.tipo, aEliminar.numero)}). Si solo dejó de usarse, mejor edítala y desmarca «Activo».` : ''}
        onConfirm={confirmarEliminar}
        onCancel={() => setAEliminar(null)}
      />

      <Toast key={toast?.key} mensaje={toast?.mensaje} tipo={toast?.tipo} onClose={() => setToast(null)} />
    </div>
  )
}

export default Directorio
