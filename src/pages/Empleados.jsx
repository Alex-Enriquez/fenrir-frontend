import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { Plus, Pencil, Trash2, Search, ArrowUpDown, Mail, Phone, Download } from 'lucide-react'
import Modal from '../components/Modal'
import EmpleadoForm from '../components/EmpleadoForm'
import ConfirmDialog from '../components/ConfirmDialog'
import { descargarArchivo } from '../utils/descargarArchivo'
import { API_URL } from '../config'

const estatusColors = {
  activo: { bg: 'var(--exito-bg)', color: 'var(--exito-texto)' },
  baja: { bg: 'var(--peligro-bg-2)', color: 'var(--peligro-texto)' },
}

const filtros = [
  { key: 'todos', label: 'Todos' },
  { key: 'activo', label: 'Activos' },
  { key: 'baja', label: 'De baja' },
]

function EstatusBadge({ estatus }) {
  const style = estatusColors[estatus] || { bg: 'var(--campo-borde)', color: 'var(--texto-claro)' }
  return (
    <span style={{
      backgroundColor: style.bg, color: style.color,
      padding: '0.25rem 0.65rem', borderRadius: '999px',
      fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize',
    }}>
      {estatus}
    </span>
  )
}

function Empleados() {
  const [empleados, setEmpleados] = useState([])
  const [departamentos, setDepartamentos] = useState([])
  // Recarga solo la lista de departamentos (para el "+" del formulario), sin "Cargando..." ni tocar el resto.
  const recargarDepartamentos = () => axios.get(`${API_URL}/departamentos/`).then(res => setDepartamentos(res.data))
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const [busqueda, setBusqueda] = useState('')
  const [filtroActivo, setFiltroActivo] = useState('todos')
  const [orden, setOrden] = useState({ campo: 'nombre_completo', dir: 1 })

  const [modalAbierto, setModalAbierto] = useState(false)
  const [empleadoEditando, setEmpleadoEditando] = useState(null)
  const [empleadoAEliminar, setEmpleadoAEliminar] = useState(null)

  const cargarDatos = () => {
    setCargando(true)
    Promise.all([
      axios.get(`${API_URL}/empleados/`),
      axios.get(`${API_URL}/departamentos/`),
    ])
      .then(([empleadosRes, departamentosRes]) => {
        setEmpleados(empleadosRes.data)
        setDepartamentos(departamentosRes.data)
        setCargando(false)
      })
      .catch(err => {
        setError('No se pudo conectar con el servidor. ¿Está corriendo Django?')
        setCargando(false)
        console.error(err)
      })
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const conteos = useMemo(() => {
    const c = { todos: empleados.length, activo: 0, baja: 0 }
    empleados.forEach(e => { c[e.estatus] = (c[e.estatus] || 0) + 1 })
    return c
  }, [empleados])

  const empleadosFiltrados = useMemo(() => {
    let lista = empleados.filter(e => {
      const coincideFiltro = filtroActivo === 'todos' || e.estatus === filtroActivo
      const texto = busqueda.trim().toLowerCase()
      const coincideBusqueda = !texto || [e.nombre_completo, e.correo, e.puesto, e.departamento_nombre]
        .some(campo => (campo || '').toLowerCase().includes(texto))
      return coincideFiltro && coincideBusqueda
    })

    if (orden.campo) {
      lista = [...lista].sort((a, b) => {
        const valA = (a[orden.campo] || '').toString().toLowerCase()
        const valB = (b[orden.campo] || '').toString().toLowerCase()
        if (valA < valB) return -1 * orden.dir
        if (valA > valB) return 1 * orden.dir
        return 0
      })
    }
    return lista
  }, [empleados, busqueda, filtroActivo, orden])

  const toggleOrden = (campo) => {
    setOrden(prev => prev.campo === campo ? { campo, dir: prev.dir * -1 } : { campo, dir: 1 })
  }

  const abrirNuevo = () => {
    setEmpleadoEditando(null)
    setModalAbierto(true)
  }

  const abrirEditar = (empleado) => {
    setEmpleadoEditando(empleado)
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    setEmpleadoEditando(null)
  }

  const handleGuardar = (form) => {
    const payload = { ...form }
    const peticion = empleadoEditando
      ? axios.put(`${API_URL}/empleados/${empleadoEditando.id}/`, payload)
      : axios.post(`${API_URL}/empleados/`, payload)

    peticion
      .then(() => {
        cerrarModal()
        cargarDatos()
      })
      .catch(err => {
        alert('Error al guardar. Revisa que todos los campos requeridos estén llenos.')
        console.error(err.response?.data || err)
      })
  }

  const confirmarEliminar = () => {
    if (!empleadoAEliminar) return
    axios.delete(`${API_URL}/empleados/${empleadoAEliminar.id}/`)
      .then(() => {
        setEmpleadoAEliminar(null)
        cargarDatos()
      })
      .catch(err => {
        alert('No se pudo eliminar el empleado.')
        console.error(err)
      })
  }

  if (cargando) return <p>Cargando empleados...</p>
  if (error) return <p style={{ color: 'var(--peligro-texto)' }}>{error}</p>

  const columnas = [
    { key: 'nombre_completo', label: 'Nombre' },
    { key: 'departamento_nombre', label: 'Departamento' },
    { key: 'puesto', label: 'Puesto' },
    { key: 'estatus', label: 'Estatus' },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ color: 'var(--acento-texto)', margin: 0 }}>Empleados</h1>
          <button
            onClick={() => descargarArchivo(`${API_URL}/empleados/exportar/`, 'empleados.xlsx')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              background: 'var(--exp-bg)', border: '1px solid var(--exp-borde)', borderRadius: '6px',
              padding: '0.4rem 0.7rem', color: 'var(--exp-texto)', fontSize: '0.82rem',
            }}
          >
            <Download size={14} /> Exportar Excel
          </button>
        </div>
        <button
          onClick={abrirNuevo}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            backgroundColor: 'var(--accion)', color: 'var(--sobre-accion)', border: 'none',
            padding: '0.6rem 1.1rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.95rem',
          }}
        >
          <Plus size={18} /> Nuevo empleado
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <Search size={17} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--texto-4)' }} />
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, correo, puesto o departamento..."
          style={{
            width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem', borderRadius: '10px',
            border: '1px solid var(--campo-borde)', backgroundColor: 'var(--campo-bg-2)',
            color: 'var(--texto-claro)', fontSize: '0.9rem', boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {filtros.map(f => (
          <button
            key={f.key}
            onClick={() => setFiltroActivo(f.key)}
            style={{
              padding: '0.4rem 0.9rem', borderRadius: '999px',
              border: filtroActivo === f.key ? '1px solid var(--acento)' : '1px solid var(--campo-borde)',
              backgroundColor: filtroActivo === f.key ? 'rgba(248,194,46,0.12)' : 'transparent',
              color: filtroActivo === f.key ? 'var(--acento-texto)' : 'var(--texto-tenue)',
              fontSize: '0.82rem', fontWeight: filtroActivo === f.key ? 600 : 500,
            }}
          >
            {f.label} ({f.key === 'todos' ? conteos.todos : (conteos[f.key] || 0)})
          </button>
        ))}
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              {columnas.map(col => (
                <th key={col.key} style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleOrden(col.key)}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    {col.label}
                    <ArrowUpDown size={12} style={{ opacity: orden.campo === col.key ? 1 : 0.35 }} />
                  </span>
                </th>
              ))}
              <th>Contacto</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {empleadosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: 'var(--texto-4)', padding: '2rem' }}>
                  No se encontraron empleados con esos criterios.
                </td>
              </tr>
            ) : (
              empleadosFiltrados.map((empleado, i) => (
                <tr key={empleado.id} style={{ backgroundColor: i % 2 === 1 ? 'rgba(var(--velo-rgb), 0.015)' : 'transparent' }}>
                  <td>{empleado.nombre_completo}</td>
                  <td>{empleado.departamento_nombre}</td>
                  <td>{empleado.puesto}</td>
                  <td><EstatusBadge estatus={empleado.estatus} /></td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', fontSize: '0.82rem', color: 'var(--texto-tenue)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Mail size={13} /> {empleado.correo}
                      </span>
                      {empleado.telefono && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Phone size={13} /> {empleado.telefono}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => abrirEditar(empleado)}
                        title="Editar"
                        style={{ background: 'var(--edit-bg)', border: 'none', borderRadius: '6px', padding: '0.4rem', color: 'var(--edit-texto)', display: 'flex' }}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => setEmpleadoAEliminar(empleado)}
                        title="Eliminar"
                        style={{ background: 'var(--peligro-bg)', border: 'none', borderRadius: '6px', padding: '0.4rem', color: 'var(--peligro-texto)', display: 'flex' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={modalAbierto}
        onClose={cerrarModal}
        title={empleadoEditando ? 'Editar empleado' : 'Nuevo empleado'}
      >
        <EmpleadoForm
          departamentos={departamentos}
          onDepartamentoCreado={recargarDepartamentos}
          empleadoInicial={empleadoEditando}
          onSubmit={handleGuardar}
          onCancel={cerrarModal}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!empleadoAEliminar}
        title="¿Eliminar este empleado?"
        message={empleadoAEliminar ? `Se eliminará a ${empleadoAEliminar.nombre_completo}. Esta acción no se puede deshacer.` : ''}
        onConfirm={confirmarEliminar}
        onCancel={() => setEmpleadoAEliminar(null)}
      />
    </div>
  )
}

export default Empleados
