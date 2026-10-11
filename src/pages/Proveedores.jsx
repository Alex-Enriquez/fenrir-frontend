import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { Plus, Search, Pencil, Trash2, Star, Truck, Mail, Phone } from 'lucide-react'
import Modal from '../components/Modal'
import ProveedorForm from '../components/ProveedorForm'
import ConfirmDialog from '../components/ConfirmDialog'
import Toast from '../components/Toast'
import { API_URL } from '../config'

function Estrellas({ calificacion }) {
  return (
    <div style={{ display: 'flex', gap: '0.15rem' }}>
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} size={14} color={n <= calificacion ? '#F8C22E' : '#2C3450'} fill={n <= calificacion ? '#F8C22E' : 'none'} />
      ))}
    </div>
  )
}

function Proveedores() {
  const [proveedores, setProveedores] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [toast, setToast] = useState(null)

  const [modalAbierto, setModalAbierto] = useState(false)
  const [proveedorEditando, setProveedorEditando] = useState(null)
  const [proveedorAEliminar, setProveedorAEliminar] = useState(null)

  const mostrarToast = (mensaje, tipo = 'error') => setToast({ mensaje, tipo, key: Date.now() })

  const cargarDatos = () => {
    setCargando(true)
    axios.get(`${API_URL}/proveedores/`)
      .then(res => { setProveedores(res.data); setCargando(false) })
      .catch(err => { console.error(err); setCargando(false) })
  }

  useEffect(() => { cargarDatos() }, [])

  const proveedoresFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return proveedores
      .filter(p => !texto || [p.nombre, p.servicio, p.contacto].some(c => (c || '').toLowerCase().includes(texto)))
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
  }, [proveedores, busqueda])

  const abrirNuevo = () => { setProveedorEditando(null); setModalAbierto(true) }
  const abrirEditar = (p) => { setProveedorEditando(p); setModalAbierto(true) }
  const cerrarModal = () => { setModalAbierto(false); setProveedorEditando(null) }

  const handleGuardar = (form) => {
    const peticion = proveedorEditando
      ? axios.put(`${API_URL}/proveedores/${proveedorEditando.id}/`, form)
      : axios.post(`${API_URL}/proveedores/`, form)

    return peticion
      .then(() => { cerrarModal(); cargarDatos(); mostrarToast('Proveedor guardado.', 'exito') })
      .catch(() => mostrarToast('No se pudo guardar el proveedor.'))
  }

  const confirmarEliminar = () => {
    if (!proveedorAEliminar) return
    axios.delete(`${API_URL}/proveedores/${proveedorAEliminar.id}/`)
      .then(() => { setProveedorAEliminar(null); cargarDatos(); mostrarToast('Proveedor eliminado.', 'exito') })
      .catch(() => mostrarToast('No se pudo eliminar.'))
  }

  if (cargando) return <p>Cargando...</p>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h1 style={{ color: 'var(--acento-texto)', margin: 0 }}>Proveedores</h1>
        <button
          onClick={abrirNuevo}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            backgroundColor: 'var(--accion)', color: 'var(--sobre-accion)', border: 'none',
            padding: '0.6rem 1.1rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.95rem',
          }}
        >
          <Plus size={18} /> Nuevo proveedor
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <Search size={17} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--texto-4)' }} />
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, servicio o contacto..."
          style={{
            width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem', borderRadius: '10px',
            border: '1px solid var(--campo-borde)', backgroundColor: 'var(--campo-bg-2)',
            color: 'var(--texto-claro)', fontSize: '0.9rem', boxSizing: 'border-box',
          }}
        />
      </div>

      {proveedoresFiltrados.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--texto-4)', padding: '2rem' }}>
          <Truck size={28} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
          <p>No hay proveedores registrados todavía.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1rem',
        }}>
          {proveedoresFiltrados.map(p => (
            <div key={p.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--texto-fuerte)', fontSize: '0.98rem' }}>{p.nombre}</div>
                  {p.servicio && <div style={{ fontSize: '0.78rem', color: 'var(--texto-tenue)' }}>{p.servicio}</div>}
                </div>
                <Estrellas calificacion={p.calificacion} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '0.85rem', fontSize: '0.82rem', color: 'var(--texto-tenue)' }}>
                {p.contacto && <span>{p.contacto}</span>}
                {p.telefono && <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Phone size={12} /> {p.telefono}</span>}
                {p.correo && <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Mail size={12} /> {p.correo}</span>}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--borde-suave)' }}>
                <button
                  onClick={() => abrirEditar(p)}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', background: 'var(--edit-bg)', border: 'none', borderRadius: '6px', padding: '0.4rem', color: 'var(--edit-texto)', fontSize: '0.8rem' }}
                >
                  <Pencil size={13} /> Editar
                </button>
                <button
                  onClick={() => setProveedorAEliminar(p)}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', background: 'var(--peligro-bg)', border: 'none', borderRadius: '6px', padding: '0.4rem', color: 'var(--peligro-texto)', fontSize: '0.8rem' }}
                >
                  <Trash2 size={13} /> Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalAbierto} onClose={cerrarModal} title={proveedorEditando ? 'Editar proveedor' : 'Nuevo proveedor'}>
        <ProveedorForm proveedorInicial={proveedorEditando} onSubmit={handleGuardar} onCancel={cerrarModal} />
      </Modal>

      <ConfirmDialog
        isOpen={!!proveedorAEliminar}
        title="¿Eliminar este proveedor?"
        message={proveedorAEliminar ? `Se eliminará "${proveedorAEliminar.nombre}". Esta acción no se puede deshacer.` : ''}
        onConfirm={confirmarEliminar}
        onCancel={() => setProveedorAEliminar(null)}
      />

      <Toast key={toast?.key} mensaje={toast?.mensaje} tipo={toast?.tipo} onClose={() => setToast(null)} />
    </div>
  )
}

export default Proveedores
