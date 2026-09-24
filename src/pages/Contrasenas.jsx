import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Lock, Mail, Layout, Server, Globe, Trash2, FileBadge, FileText, User } from 'lucide-react'
import Modal from '../components/Modal'
import AccesoDenegado from '../components/AccesoDenegado'
import ConfirmDialog from '../components/ConfirmDialog'
import Toast from '../components/Toast'

const API_URL = 'http://127.0.0.1:8000/api'

function iconoPorCategoria(nombre) {
  const n = (nombre || '').toLowerCase()
  if (n.includes('correo') || n.includes('mail')) return Mail
  if (n.includes('office') || n.includes('microsoft 365')) return FileText
  if (n.includes('licencia')) return FileBadge
  if (n.includes('usuario')) return User
  if (n.includes('aplicativo') || n.includes('interno')) return Layout
  if (n.includes('servidor') || n.includes('sistema')) return Server
  if (n.includes('externo') || n.includes('dominio') || n.includes('hosting')) return Globe
  return Lock
}

const coloresGrupo = ['#F8C22E', '#60A5FA', '#C084FC', '#4ADE80', '#F97316', '#F87171', '#2DD4BF']

function NuevaCategoriaForm({ onSubmit, onCancel }) {
  const [nombre, setNombre] = useState('')
  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(nombre)
  }
  return (
    <form onSubmit={handleSubmit}>
      <label style={{ display: 'block', marginBottom: '0.35rem', color: '#9AA3B8', fontSize: '0.85rem' }}>
        Nombre de la categoría
      </label>
      <input
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        required
        autoFocus
        placeholder="ej. Correos, Aplicativos internos"
        style={{
          width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px',
          border: '1px solid #2C3450', backgroundColor: '#0F1420',
          color: '#E8EAF0', marginBottom: '1rem', fontSize: '0.95rem', boxSizing: 'border-box',
        }}
      />
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button type="submit" style={{
          backgroundColor: '#F8C22E', color: '#0F1420', border: 'none',
          padding: '0.65rem 1.25rem', borderRadius: '6px', fontWeight: 'bold', flex: 1,
        }}>
          Guardar
        </button>
        <button type="button" onClick={onCancel} style={{
          backgroundColor: 'transparent', color: '#9AA3B8', border: '1px solid #2C3450',
          padding: '0.65rem 1.25rem', borderRadius: '6px', flex: 1,
        }}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

function Contrasenas() {
  const [categorias, setCategorias] = useState([])
  const [registros, setRegistros] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [categoriaAEliminar, setCategoriaAEliminar] = useState(null)
  const [toast, setToast] = useState(null)
  const navigate = useNavigate()

  const mostrarToast = (mensaje, tipo = 'error') => setToast({ mensaje, tipo, key: Date.now() })

  const cargarDatos = () => {
    setCargando(true)
    Promise.all([
      axios.get(`${API_URL}/categorias-contrasena/`),
      axios.get(`${API_URL}/registros-contrasena/`),
    ]).then(([catRes, regRes]) => {
      setCategorias(catRes.data)
      setRegistros(regRes.data)
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

  const tarjetas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return categorias
      .map(cat => ({ categoria: cat, cantidad: registros.filter(r => r.categoria === cat.id).length }))
      .filter(t => !texto || t.categoria.nombre.toLowerCase().includes(texto))
      .sort((a, b) => a.categoria.nombre.localeCompare(b.categoria.nombre))
  }, [categorias, registros, busqueda])

  const handleCrearCategoria = (nombre) => {
    axios.post(`${API_URL}/categorias-contrasena/`, { nombre })
      .then(() => { setModalAbierto(false); cargarDatos() })
      .catch(() => mostrarToast('No se pudo crear la categoría.'))
  }

  const confirmarEliminar = () => {
    if (!categoriaAEliminar) return
    axios.delete(`${API_URL}/categorias-contrasena/${categoriaAEliminar.id}/`)
      .then(() => { setCategoriaAEliminar(null); cargarDatos(); mostrarToast('Categoría eliminada.', 'exito') })
      .catch(() => {
        mostrarToast('No se pudo eliminar: aún tiene registros dentro. Elimínalos primero.')
        setCategoriaAEliminar(null)
      })
  }

  if (cargando) return <p>Cargando...</p>
  if (error) return <AccesoDenegado mensaje={error} />

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h1 style={{ color: '#F8C22E', margin: 0 }}>Contraseñas</h1>
        <button
          onClick={() => setModalAbierto(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            backgroundColor: '#F8C22E', color: '#0F1420', border: 'none',
            padding: '0.6rem 1.1rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.95rem',
          }}
        >
          <Plus size={18} /> Nueva categoría
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <Search size={17} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#6B7690' }} />
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar categoría..."
          style={{
            width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem', borderRadius: '10px',
            border: '1px solid #2C3450', backgroundColor: '#141A2C',
            color: '#E8EAF0', fontSize: '0.9rem', boxSizing: 'border-box',
          }}
        />
      </div>

      {tarjetas.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: '#6B7690', padding: '2rem' }}>
          <Lock size={28} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
          <p>No hay categorías todavía. Crea la primera con "Nueva categoría".</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
          gap: '1rem',
        }}>
          {tarjetas.map((t, idx) => {
            const Icon = iconoPorCategoria(t.categoria.nombre)
            const color = coloresGrupo[idx % coloresGrupo.length]
            return (
              <div
                key={t.categoria.id}
                className="card"
                onClick={() => navigate(`/contrasenas/${t.categoria.id}`)}
                style={{ cursor: 'pointer', position: 'relative' }}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); setCategoriaAEliminar(t.categoria) }}
                  title="Eliminar categoría"
                  style={{
                    position: 'absolute', top: '0.75rem', right: '0.75rem',
                    background: '#3A1A1A', border: 'none', borderRadius: '6px',
                    padding: '0.35rem', color: '#F87171', display: 'flex',
                  }}
                >
                  <Trash2 size={14} />
                </button>

                <div style={{
                  width: '42px', height: '42px', borderRadius: '11px',
                  backgroundColor: `${color}22`, color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '0.85rem',
                }}>
                  <Icon size={20} />
                </div>
                <div style={{ fontWeight: 700, color: '#F1F3F9', fontSize: '1rem', marginBottom: '0.2rem' }}>
                  {t.categoria.nombre}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#8892AB' }}>
                  {t.cantidad} registro{t.cantidad !== 1 ? 's' : ''}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal isOpen={modalAbierto} onClose={() => setModalAbierto(false)} title="Nueva categoría">
        <NuevaCategoriaForm onSubmit={handleCrearCategoria} onCancel={() => setModalAbierto(false)} />
      </Modal>

      <ConfirmDialog
        isOpen={!!categoriaAEliminar}
        title="¿Eliminar esta categoría?"
        message={categoriaAEliminar ? `Se eliminará "${categoriaAEliminar.nombre}". Si tiene registros dentro, primero debes eliminarlos.` : ''}
        onConfirm={confirmarEliminar}
        onCancel={() => setCategoriaAEliminar(null)}
      />

      <Toast key={toast?.key} mensaje={toast?.mensaje} tipo={toast?.tipo} onClose={() => setToast(null)} />
    </div>
  )
}

export default Contrasenas
