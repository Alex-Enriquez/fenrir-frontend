import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { Plus, Search, Pencil, Trash2, CircleDollarSign, CheckCircle2, History } from 'lucide-react'
import Modal from '../components/Modal'
import ServicioContratadoForm from '../components/ServicioContratadoForm'
import HistorialPagosModal from '../components/HistorialPagosModal'
import ConfirmDialog from '../components/ConfirmDialog'
import Toast from '../components/Toast'
import { API_URL } from '../config'

function calcularVigencia(servicio) {
  if (!servicio.fecha_proximo_pago) return { label: 'Sin fecha', bg: 'var(--campo-borde)', color: 'var(--texto-tenue)' }
  const hoy = new Date()
  const dias = Math.ceil((new Date(servicio.fecha_proximo_pago) - hoy) / (1000 * 60 * 60 * 24))
  if (dias < 0) return { label: `Vencido (${Math.abs(dias)}d)`, bg: 'var(--peligro-bg-2)', color: 'var(--peligro-texto)' }
  if (dias <= 7) return { label: `Vence en ${dias}d`, bg: 'var(--aviso-bg)', color: 'var(--acento-texto)' }
  return { label: 'Al día', bg: 'var(--exito-bg)', color: 'var(--exito-texto)' }
}

function ServiciosContratados() {
  const [servicios, setServicios] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [toast, setToast] = useState(null)

  const [modalAbierto, setModalAbierto] = useState(false)
  const [servicioEditando, setServicioEditando] = useState(null)
  const [servicioAEliminar, setServicioAEliminar] = useState(null)
  const [servicioHistorial, setServicioHistorial] = useState(null)

  const mostrarToast = (mensaje, tipo = 'error') => setToast({ mensaje, tipo, key: Date.now() })

  const cargarDatos = () => {
    setCargando(true)
    Promise.all([
      axios.get(`${API_URL}/servicios-contratados/`),
      axios.get(`${API_URL}/proveedores/`),
    ]).then(([servRes, provRes]) => {
      setServicios(servRes.data)
      setProveedores(provRes.data)
      setCargando(false)
    }).catch(err => { console.error(err); setCargando(false) })
  }

  useEffect(() => { cargarDatos() }, [])

  const serviciosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return servicios
      .filter(s => !texto || [s.nombre, s.tipo, s.proveedor_nombre].some(c => (c || '').toLowerCase().includes(texto)))
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
  }, [servicios, busqueda])

  const abrirNuevo = () => { setServicioEditando(null); setModalAbierto(true) }
  const abrirEditar = (s) => { setServicioEditando(s); setModalAbierto(true) }
  const cerrarModal = () => { setModalAbierto(false); setServicioEditando(null) }

  const handleGuardar = (form) => {
    const peticion = servicioEditando
      ? axios.put(`${API_URL}/servicios-contratados/${servicioEditando.id}/`, form)
      : axios.post(`${API_URL}/servicios-contratados/`, form)

    return peticion
      .then(() => { cerrarModal(); cargarDatos(); mostrarToast('Servicio guardado.', 'exito') })
      .catch(() => mostrarToast('No se pudo guardar el servicio.'))
  }

  const marcarPago = (servicio) => {
    axios.post(`${API_URL}/servicios-contratados/${servicio.id}/marcar_pago/`, { monto: servicio.costo })
      .then(() => { cargarDatos(); mostrarToast('Pago registrado y próxima fecha actualizada.', 'exito') })
      .catch(() => mostrarToast('No se pudo registrar el pago.'))
  }

  const confirmarEliminar = () => {
    if (!servicioAEliminar) return
    axios.delete(`${API_URL}/servicios-contratados/${servicioAEliminar.id}/`)
      .then(() => { setServicioAEliminar(null); cargarDatos(); mostrarToast('Servicio eliminado.', 'exito') })
      .catch(() => mostrarToast('No se pudo eliminar.'))
  }

  if (cargando) return <p>Cargando...</p>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h1 style={{ color: 'var(--acento-texto)', margin: 0 }}>Servicios contratados</h1>
        <button
          onClick={abrirNuevo}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            backgroundColor: 'var(--accion)', color: 'var(--sobre-accion)', border: 'none',
            padding: '0.6rem 1.1rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.95rem',
          }}
        >
          <Plus size={18} /> Nuevo servicio
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <Search size={17} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--texto-4)' }} />
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, tipo o proveedor..."
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
              <th>Servicio</th>
              <th>Tipo</th>
              <th>Proveedor</th>
              <th>Costo</th>
              <th>Periodicidad</th>
              <th>Próximo pago</th>
              <th>Estado</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {serviciosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', color: 'var(--texto-4)', padding: '2rem' }}>
                  <CircleDollarSign size={24} style={{ marginBottom: '0.5rem', opacity: 0.5, display: 'block', margin: '0 auto 0.5rem' }} />
                  No hay servicios contratados todavía.
                </td>
              </tr>
            ) : (
              serviciosFiltrados.map((s, i) => {
                const v = calcularVigencia(s)
                return (
                  <tr key={s.id} style={{ backgroundColor: i % 2 === 1 ? 'rgba(var(--velo-rgb), 0.015)' : 'transparent' }}>
                    <td>{s.nombre}</td>
                    <td>{s.tipo || '—'}</td>
                    <td>{s.proveedor_nombre || '—'}</td>
                    <td>${s.costo}</td>
                    <td style={{ textTransform: 'capitalize' }}>{s.periodicidad}</td>
                    <td>{s.fecha_proximo_pago || '—'}</td>
                    <td>
                      <span style={{ backgroundColor: v.bg, color: v.color, padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
                        {v.label}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => marcarPago(s)} title="Marcar pago" style={{ background: 'var(--exito-bg)', border: 'none', borderRadius: '6px', padding: '0.4rem', color: 'var(--exito-texto)', display: 'flex' }}>
                          <CheckCircle2 size={15} />
                        </button>
                        <button onClick={() => setServicioHistorial(s)} title="Ver historial" style={{ background: 'var(--info-bg)', border: 'none', borderRadius: '6px', padding: '0.4rem', color: 'var(--info-texto)', display: 'flex' }}>
                          <History size={15} />
                        </button>
                        <button onClick={() => abrirEditar(s)} title="Editar" style={{ background: 'var(--edit-bg)', border: 'none', borderRadius: '6px', padding: '0.4rem', color: 'var(--edit-texto)', display: 'flex' }}>
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => setServicioAEliminar(s)} title="Eliminar" style={{ background: 'var(--peligro-bg)', border: 'none', borderRadius: '6px', padding: '0.4rem', color: 'var(--peligro-texto)', display: 'flex' }}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalAbierto} onClose={cerrarModal} title={servicioEditando ? 'Editar servicio' : 'Nuevo servicio'}>
        <ServicioContratadoForm proveedores={proveedores} servicioInicial={servicioEditando} onSubmit={handleGuardar} onCancel={cerrarModal} />
      </Modal>

      <Modal isOpen={!!servicioHistorial} onClose={() => setServicioHistorial(null)} title={`Historial de pagos — ${servicioHistorial?.nombre || ''}`}>
        <HistorialPagosModal servicio={servicioHistorial} />
      </Modal>

      <ConfirmDialog
        isOpen={!!servicioAEliminar}
        title="¿Eliminar este servicio?"
        message={servicioAEliminar ? `Se eliminará "${servicioAEliminar.nombre}" y su historial de pagos. Esta acción no se puede deshacer.` : ''}
        onConfirm={confirmarEliminar}
        onCancel={() => setServicioAEliminar(null)}
      />

      <Toast key={toast?.key} mensaje={toast?.mensaje} tipo={toast?.tipo} onClose={() => setToast(null)} />
    </div>
  )
}

export default ServiciosContratados
