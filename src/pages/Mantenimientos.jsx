import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { Plus, Search, Pencil, Trash2, Wrench } from 'lucide-react'
import Modal from '../components/Modal'
import MantenimientoForm from '../components/MantenimientoForm'
import ConfirmDialog from '../components/ConfirmDialog'
import Toast from '../components/Toast'
import { API_URL } from '../config'

function Mantenimientos() {
  const [mantenimientos, setMantenimientos] = useState([])
  const [equipos, setEquipos] = useState([])
  const [empleados, setEmpleados] = useState([])
  const [asignaciones, setAsignaciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [toast, setToast] = useState(null)

  const [modalAbierto, setModalAbierto] = useState(false)
  const [mantenimientoEditando, setMantenimientoEditando] = useState(null)
  const [mantenimientoAEliminar, setMantenimientoAEliminar] = useState(null)

  const mostrarToast = (mensaje, tipo = 'error') => setToast({ mensaje, tipo, key: Date.now() })

  const cargarDatos = () => {
    setCargando(true)
    Promise.all([
      axios.get(`${API_URL}/mantenimientos/`),
      axios.get(`${API_URL}/equipos/`),
      axios.get(`${API_URL}/empleados/`),
      axios.get(`${API_URL}/asignaciones/`),
    ]).then(([mantRes, eqRes, empRes, asigRes]) => {
      setMantenimientos(mantRes.data)
      setEquipos(eqRes.data)
      setEmpleados(empRes.data)
      setAsignaciones(asigRes.data)
      setCargando(false)
    }).catch(err => {
      setError('No se pudo conectar con el servidor. ¿Está corriendo Django?')
      setCargando(false)
      console.error(err)
    })
  }

  useEffect(() => { cargarDatos() }, [])

  const equipoPorId = useMemo(() => {
    const m = {}
    equipos.forEach(e => { m[e.id] = e })
    return m
  }, [equipos])

  const asignacionActivaPorEmpleado = useMemo(() => {
    const m = {}
    asignaciones.forEach(a => {
      if (a.equipo && !a.fecha_devolucion) m[a.empleado] = a
    })
    return m
  }, [asignaciones])

  const mantenimientosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return mantenimientos
      .map(m => ({ ...m, equipoInfo: equipoPorId[m.equipo] }))
      .filter(m => {
        if (!texto) return true
        const campos = [
          m.equipoInfo ? `${m.equipoInfo.marca} ${m.equipoInfo.modelo} ${m.equipoInfo.numero_serie}` : '',
          m.descripcion, m.solucion, m.realizado_por,
        ]
        return campos.some(c => (c || '').toLowerCase().includes(texto))
      })
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  }, [mantenimientos, equipoPorId, busqueda])

  const abrirNuevo = () => { setMantenimientoEditando(null); setModalAbierto(true) }
  const abrirEditar = (m) => { setMantenimientoEditando(m); setModalAbierto(true) }
  const cerrarModal = () => { setModalAbierto(false); setMantenimientoEditando(null) }

  const handleGuardar = (form) => {
    const payload = { ...form, costo: form.costo || null }
    const peticion = mantenimientoEditando
      ? axios.put(`${API_URL}/mantenimientos/${mantenimientoEditando.id}/`, payload)
      : axios.post(`${API_URL}/mantenimientos/`, payload)

    peticion
      .then(() => { cerrarModal(); cargarDatos(); mostrarToast('Mantenimiento guardado.', 'exito') })
      .catch(() => mostrarToast('No se pudo guardar el mantenimiento.'))
  }

  const confirmarEliminar = () => {
    if (!mantenimientoAEliminar) return
    axios.delete(`${API_URL}/mantenimientos/${mantenimientoAEliminar.id}/`)
      .then(() => { setMantenimientoAEliminar(null); cargarDatos(); mostrarToast('Mantenimiento eliminado.', 'exito') })
      .catch(() => mostrarToast('No se pudo eliminar.'))
  }

  if (cargando) return <p>Cargando...</p>
  if (error) return <p style={{ color: 'var(--peligro-texto)' }}>{error}</p>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h1 style={{ color: 'var(--acento-texto)', margin: 0 }}>Mantenimientos</h1>
        <button
          onClick={abrirNuevo}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            backgroundColor: 'var(--accion)', color: 'var(--sobre-accion)', border: 'none',
            padding: '0.6rem 1.1rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.95rem',
          }}
        >
          <Plus size={18} /> Nuevo registro
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <Search size={17} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--texto-4)' }} />
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por equipo, descripción, solución o técnico..."
          style={{
            width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem', borderRadius: '10px',
            border: '1px solid var(--campo-borde)', backgroundColor: 'var(--campo-bg-2)',
            color: 'var(--texto-claro)', fontSize: '0.9rem', boxSizing: 'border-box',
          }}
        />
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Equipo</th>
              <th>Descripción</th>
              <th>Solución</th>
              <th>Realizado por</th>
              <th>Costo</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {mantenimientosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: 'var(--texto-4)', padding: '2rem' }}>
                  <Wrench size={24} style={{ marginBottom: '0.5rem', opacity: 0.5, display: 'block', margin: '0 auto 0.5rem' }} />
                  No hay mantenimientos registrados todavía.
                </td>
              </tr>
            ) : (
              mantenimientosFiltrados.map((m, i) => (
                <tr key={m.id} style={{ backgroundColor: i % 2 === 1 ? 'rgba(var(--velo-rgb), 0.015)' : 'transparent' }}>
                  <td>{m.fecha}</td>
                  <td>{m.equipoInfo ? `${m.equipoInfo.marca} ${m.equipoInfo.modelo} (${m.equipoInfo.numero_serie})` : '—'}</td>
                  <td style={{ maxWidth: '220px' }}>{m.descripcion}</td>
                  <td style={{ maxWidth: '220px' }}>{m.solucion || '—'}</td>
                  <td>{m.realizado_por || '—'}</td>
                  <td>{m.costo ? `$${m.costo}` : '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => abrirEditar(m)}
                        title="Editar"
                        style={{ background: 'var(--edit-bg)', border: 'none', borderRadius: '6px', padding: '0.4rem', color: 'var(--edit-texto)', display: 'flex' }}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => setMantenimientoAEliminar(m)}
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

      <Modal isOpen={modalAbierto} onClose={cerrarModal} title={mantenimientoEditando ? 'Editar mantenimiento' : 'Nuevo mantenimiento'}>
        <MantenimientoForm
          empleados={empleados}
          asignacionActivaPorEmpleado={asignacionActivaPorEmpleado}
          equipoPorId={equipoPorId}
          mantenimientoInicial={mantenimientoEditando}
          onSubmit={handleGuardar}
          onCancel={cerrarModal}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!mantenimientoAEliminar}
        title="¿Eliminar este registro?"
        message="Esta acción no se puede deshacer."
        onConfirm={confirmarEliminar}
        onCancel={() => setMantenimientoAEliminar(null)}
      />

      <Toast key={toast?.key} mensaje={toast?.mensaje} tipo={toast?.tipo} onClose={() => setToast(null)} />
    </div>
  )
}

export default Mantenimientos
