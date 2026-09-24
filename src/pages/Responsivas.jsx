import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, FileText, Trash2, Search } from 'lucide-react'
import Modal from '../components/Modal'
import AccesoDenegado from '../components/AccesoDenegado'
import ResponsivaForm from '../components/ResponsivaForm'
import ConfirmDialog from '../components/ConfirmDialog'
import Toast from '../components/Toast'

const API_URL = 'http://127.0.0.1:8000/api'

function Responsivas() {
  const [responsivas, setResponsivas] = useState([])
  const [empleados, setEmpleados] = useState([])
  const [equipos, setEquipos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [toast, setToast] = useState(null)

  const [modalAbierto, setModalAbierto] = useState(false)
  const [responsivaAEliminar, setResponsivaAEliminar] = useState(null)

  const mostrarToast = (mensaje, tipo = 'error') => setToast({ mensaje, tipo, key: Date.now() })

  const cargarDatos = () => {
    setCargando(true)
    Promise.all([
      axios.get(`${API_URL}/responsivas/`),
      axios.get(`${API_URL}/empleados/`),
      axios.get(`${API_URL}/equipos/`),
    ]).then(([respRes, empRes, eqRes]) => {
      setResponsivas(respRes.data)
      setEmpleados(empRes.data)
      setEquipos(eqRes.data)
      setCargando(false)
    }).catch(err => {
      if (err.response?.status === 403) {
        setError('No tienes permisos de administrador para ver esta sección.')
      }
      console.error(err)
      setCargando(false)
    })
  }

  useEffect(() => { cargarDatos() }, [])

  const handleCrear = (form) => {
    axios.post(`${API_URL}/responsivas/`, form)
      .then(() => { setModalAbierto(false); cargarDatos(); mostrarToast('Responsiva generada correctamente.', 'exito') })
      .catch(err => {
        console.error(err.response?.data || err)
        mostrarToast('No se pudo generar la responsiva.')
      })
  }

  const confirmarEliminar = () => {
    if (!responsivaAEliminar) return
    axios.delete(`${API_URL}/responsivas/${responsivaAEliminar.id}/`)
      .then(() => { setResponsivaAEliminar(null); cargarDatos(); mostrarToast('Responsiva eliminada.', 'exito') })
      .catch(() => mostrarToast('No se pudo eliminar.'))
  }

  const verPdf = (id) => {
    window.open(`${API_URL}/responsivas/${id}/pdf/`, '_blank')
  }

  const responsivasFiltradas = responsivas.filter(r => {
    const texto = busqueda.trim().toLowerCase()
    return !texto || [r.folio, r.empleado_nombre, r.quien_entrega].some(c => (c || '').toLowerCase().includes(texto))
  })

  if (cargando) return <p>Cargando...</p>
  if (error) return <AccesoDenegado mensaje={error} />

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h1 style={{ color: '#F8C22E', margin: 0 }}>Responsivas</h1>
        <button
          onClick={() => setModalAbierto(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            backgroundColor: '#F8C22E', color: '#0F1420', border: 'none',
            padding: '0.6rem 1.1rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.95rem',
          }}
        >
          <Plus size={18} /> Nueva responsiva
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <Search size={17} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#6B7690' }} />
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por folio, empleado o quien entrega..."
          style={{
            width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem', borderRadius: '10px',
            border: '1px solid #2C3450', backgroundColor: '#141A2C',
            color: '#E8EAF0', fontSize: '0.9rem', boxSizing: 'border-box',
          }}
        />
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Folio</th>
              <th>Empleado</th>
              <th>Fecha</th>
              <th>Quien entrega</th>
              <th>Artículos</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {responsivasFiltradas.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: '#6B7690', padding: '2rem' }}>
                  <FileText size={24} style={{ marginBottom: '0.5rem', opacity: 0.5, display: 'block', margin: '0 auto 0.5rem' }} />
                  No hay responsivas generadas todavía.
                </td>
              </tr>
            ) : (
              responsivasFiltradas.map((r, i) => (
                <tr key={r.id} style={{ backgroundColor: i % 2 === 1 ? 'rgba(255,255,255,0.015)' : 'transparent' }}>
                  <td style={{ fontFamily: 'monospace' }}>{r.folio}</td>
                  <td>{r.empleado_nombre}</td>
                  <td>{r.fecha}</td>
                  <td>{r.quien_entrega}</td>
                  <td>{r.items?.length || 0}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => verPdf(r.id)}
                        title="Ver PDF"
                        style={{ background: '#132A2A', border: 'none', borderRadius: '6px', padding: '0.4rem', color: '#2DD4BF', display: 'flex' }}
                      >
                        <FileText size={16} />
                      </button>
                      <button
                        onClick={() => setResponsivaAEliminar(r)}
                        title="Eliminar"
                        style={{ background: '#3A1A1A', border: 'none', borderRadius: '6px', padding: '0.4rem', color: '#F87171', display: 'flex' }}
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

      <Modal isOpen={modalAbierto} onClose={() => setModalAbierto(false)} title="Nueva responsiva">
        <ResponsivaForm empleados={empleados} equipos={equipos} onSubmit={handleCrear} onCancel={() => setModalAbierto(false)} />
      </Modal>

      <ConfirmDialog
        isOpen={!!responsivaAEliminar}
        title="¿Eliminar esta responsiva?"
        message={responsivaAEliminar ? `Se eliminará el folio ${responsivaAEliminar.folio}. Esta acción no se puede deshacer.` : ''}
        onConfirm={confirmarEliminar}
        onCancel={() => setResponsivaAEliminar(null)}
      />

      <Toast key={toast?.key} mensaje={toast?.mensaje} tipo={toast?.tipo} onClose={() => setToast(null)} />
    </div>
  )
}

export default Responsivas
