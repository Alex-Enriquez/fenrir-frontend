import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeft, Plus, Pencil, Trash2, Eye, EyeOff, Copy, Lock } from '../ui/icons'
import Modal from '../components/Modal'
import AccesoDenegado from '../components/AccesoDenegado'
import ContrasenaForm from '../components/ContrasenaForm'
import ConfirmDialog from '../components/ConfirmDialog'
import Toast from '../components/Toast'
import { API_URL } from '../config'

function FilaRegistro({ registro, seleccionado, onToggleSeleccion, onEditar, onEliminar, onCopiar }) {
  const [verPassword, setVerPassword] = useState(false)
  return (
    <tr>
      <td style={{ width: '2rem' }}>
        <input type="checkbox" checked={seleccionado} onChange={() => onToggleSeleccion(registro.id)} />
      </td>
      <td>{registro.plataforma}</td>
      <td>{registro.empleado_nombre || <span style={{ color: 'var(--texto-5)' }}>Sin asignar</span>}</td>
      <td>{registro.usuario || '—'}</td>
      <td>{registro.correo || '—'}</td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
            {verPassword ? registro.contrasena : '•'.repeat(10)}
          </span>
          <button onClick={() => setVerPassword(v => !v)} style={{ background: 'none', border: 'none', color: 'var(--texto-4)', display: 'flex', padding: 0 }}>
            {verPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
          <button onClick={() => onCopiar(registro.contrasena)} title="Copiar" style={{ background: 'none', border: 'none', color: 'var(--texto-4)', display: 'flex', padding: 0 }}>
            <Copy size={15} />
          </button>
        </div>
      </td>
      <td>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button onClick={() => onEditar(registro)} title="Editar" style={{ background: 'var(--edit-bg)', border: 'none', borderRadius: '6px', padding: '0.4rem', color: 'var(--edit-texto)', display: 'flex' }}>
            <Pencil size={16} />
          </button>
          <button onClick={() => onEliminar(registro)} title="Eliminar" style={{ background: 'var(--peligro-bg)', border: 'none', borderRadius: '6px', padding: '0.4rem', color: 'var(--peligro-texto)', display: 'flex' }}>
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  )
}

function ContrasenaDetalle() {
  const { categoriaId } = useParams()
  const navigate = useNavigate()
  const [categoria, setCategoria] = useState(null)
  const [registros, setRegistros] = useState([])
  const [empleados, setEmpleados] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)
  const [seleccionados, setSeleccionados] = useState([])

  const [modalAbierto, setModalAbierto] = useState(false)
  const [registroEditando, setRegistroEditando] = useState(null)
  const [registroAEliminar, setRegistroAEliminar] = useState(null)
  const [confirmarEliminarSeleccionados, setConfirmarEliminarSeleccionados] = useState(false)

  const mostrarToast = (mensaje, tipo = 'error') => setToast({ mensaje, tipo, key: Date.now() })

  const cargarDatos = () => {
    setCargando(true)
    Promise.all([
      axios.get(`${API_URL}/categorias-contrasena/${categoriaId}/`),
      axios.get(`${API_URL}/registros-contrasena/`),
      axios.get(`${API_URL}/empleados/`),
    ]).then(([catRes, regRes, empRes]) => {
      setCategoria(catRes.data)
      setRegistros(regRes.data.filter(r => String(r.categoria) === String(categoriaId)))
      setEmpleados(empRes.data)
      setCargando(false)
      setSeleccionados([])
       }).catch(err => {
      if (err.response?.status === 403) {
        setError('No tienes permisos de administrador para ver esta sección.')
      }
      console.error(err)
      setCargando(false)
    })
  }

  useEffect(() => { cargarDatos() }, [categoriaId])

  const abrirNuevo = () => { setRegistroEditando(null); setModalAbierto(true) }
  const abrirEditar = (reg) => { setRegistroEditando(reg); setModalAbierto(true) }
  const cerrarModal = () => { setModalAbierto(false); setRegistroEditando(null) }

  const handleGuardar = (form) => {
    const payload = { ...form, categoria: categoriaId, empleado: form.empleado || null }
    const peticion = registroEditando
      ? axios.put(`${API_URL}/registros-contrasena/${registroEditando.id}/`, payload)
      : axios.post(`${API_URL}/registros-contrasena/`, payload)

    peticion
      .then(() => { cerrarModal(); cargarDatos() })
      .catch(() => mostrarToast('No se pudo guardar el registro.'))
  }

  const confirmarEliminar = () => {
    if (!registroAEliminar) return
    axios.delete(`${API_URL}/registros-contrasena/${registroAEliminar.id}/`)
      .then(() => { setRegistroAEliminar(null); cargarDatos(); mostrarToast('Registro eliminado.', 'exito') })
      .catch(() => mostrarToast('No se pudo eliminar el registro.'))
  }

  const toggleSeleccion = (id) => {
    setSeleccionados(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const toggleSeleccionarTodos = () => {
    setSeleccionados(prev => prev.length === registros.length ? [] : registros.map(r => r.id))
  }

  const eliminarSeleccionados = () => {
    Promise.all(seleccionados.map(id => axios.delete(`${API_URL}/registros-contrasena/${id}/`)))
      .then(() => {
        setConfirmarEliminarSeleccionados(false)
        cargarDatos()
        mostrarToast(`${seleccionados.length} registro(s) eliminado(s).`, 'exito')
      })
      .catch(() => {
        setConfirmarEliminarSeleccionados(false)
        mostrarToast('Ocurrió un error al eliminar algunos registros.')
        cargarDatos()
      })
  }

  const copiarPortapapeles = (texto) => {
    navigator.clipboard.writeText(texto)
      .then(() => mostrarToast('Contraseña copiada.', 'exito'))
      .catch(() => mostrarToast('No se pudo copiar.'))
  }

    if (cargando) return <p>Cargando...</p>
  if (error) return <AccesoDenegado mensaje={error} />

  const todosSeleccionados = registros.length > 0 && seleccionados.length === registros.length

  return (
    <div>
      <button
        onClick={() => navigate('/contrasenas')}
        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', color: 'var(--texto-tenue)', fontSize: '0.85rem', marginBottom: '1rem', padding: 0 }}
      >
        <ArrowLeft size={16} /> Volver a Contraseñas
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: 'rgba(248,194,46,0.12)', color: 'var(--acento-texto)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock size={22} />
          </div>
          <h1 style={{ color: 'var(--acento-texto)', margin: 0 }}>{categoria.nombre}</h1>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {seleccionados.length > 0 && (
            <button
              onClick={() => setConfirmarEliminarSeleccionados(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--peligro-bg)', color: 'var(--peligro-texto)', border: 'none', padding: '0.6rem 1.1rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.9rem' }}
            >
              <Trash2 size={16} /> Eliminar ({seleccionados.length})
            </button>
          )}
          <button
            onClick={abrirNuevo}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--accion)', color: 'var(--sobre-accion)', border: 'none', padding: '0.6rem 1.1rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.95rem' }}
          >
            <Plus size={18} /> Añadir
          </button>
        </div>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th style={{ width: '2rem' }}>
                <input type="checkbox" checked={todosSeleccionados} onChange={toggleSeleccionarTodos} />
              </th>
              <th>Plataforma</th>
              <th>Usuario asignado</th>
              <th>Usuario/Login</th>
              <th>Correo</th>
              <th>Contraseña</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {registros.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--texto-4)', padding: '2rem' }}>No hay registros en esta categoría.</td></tr>
            ) : (
              registros.map(reg => (
                <FilaRegistro
                  key={reg.id}
                  registro={reg}
                  seleccionado={seleccionados.includes(reg.id)}
                  onToggleSeleccion={toggleSeleccion}
                  onEditar={abrirEditar}
                  onEliminar={setRegistroAEliminar}
                  onCopiar={copiarPortapapeles}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalAbierto} onClose={cerrarModal} title={registroEditando ? 'Editar registro' : 'Nuevo registro'}>
        <ContrasenaForm empleados={empleados} registroInicial={registroEditando} onSubmit={handleGuardar} onCancel={cerrarModal} />
      </Modal>

      <ConfirmDialog
        isOpen={!!registroAEliminar}
        title="¿Eliminar este registro?"
        message={registroAEliminar ? `Se eliminará "${registroAEliminar.plataforma}". Esta acción no se puede deshacer.` : ''}
        onConfirm={confirmarEliminar}
        onCancel={() => setRegistroAEliminar(null)}
      />

      <ConfirmDialog
        isOpen={confirmarEliminarSeleccionados}
        title="¿Eliminar los registros seleccionados?"
        message={`Se eliminarán ${seleccionados.length} registro(s). Esta acción no se puede deshacer.`}
        onConfirm={eliminarSeleccionados}
        onCancel={() => setConfirmarEliminarSeleccionados(false)}
      />

      <Toast key={toast?.key} mensaje={toast?.mensaje} tipo={toast?.tipo} onClose={() => setToast(null)} />
    </div>
  )
}

export default ContrasenaDetalle
