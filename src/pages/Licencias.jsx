import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, KeyRound, FileSpreadsheet, PenTool, Image as ImageIcon, ShieldCheck, Trash2, Download } from 'lucide-react'
import Modal from '../components/Modal'
import LicenciaForm from '../components/LicenciaForm'
import ConfirmDialog from '../components/ConfirmDialog'
import Toast from '../components/Toast'
import { descargarArchivo } from '../utils/descargarArchivo'

const API_URL = 'http://127.0.0.1:8000/api'

function calcularVigenciaResumen(items) {
  const hoy = new Date()
  let vencidas = 0, porVencer = 0
  items.forEach(l => {
    if (l.modalidad === 'perpetua' || !l.fecha_vencimiento) return
    const dias = Math.ceil((new Date(l.fecha_vencimiento) - hoy) / (1000 * 60 * 60 * 24))
    if (dias < 0) vencidas++
    else if (dias <= 30) porVencer++
  })
  return { vencidas, porVencer }
}

function iconoPorNombre(nombre) {
  const n = (nombre || '').toLowerCase()
  if (n.includes('office') || n.includes('microsoft')) return FileSpreadsheet
  if (n.includes('autocad') || n.includes('cad')) return PenTool
  if (n.includes('adobe')) return ImageIcon
  if (n.includes('antivirus') || n.includes('security')) return ShieldCheck
  return KeyRound
}

const coloresGrupo = ['#F8C22E', '#60A5FA', '#C084FC', '#4ADE80', '#F97316', '#F87171', '#2DD4BF']

function Licencias() {
  const [licencias, setLicencias] = useState([])
  const [tipos, setTipos] = useState([])
  const [asignaciones, setAsignaciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [tipoAEliminar, setTipoAEliminar] = useState(null)
  const [toast, setToast] = useState(null)
  const navigate = useNavigate()

  const mostrarToast = (mensaje, tipo = 'error') => setToast({ mensaje, tipo, key: Date.now() })

  const cargarDatos = () => {
    setCargando(true)
    Promise.all([
      axios.get(`${API_URL}/licencias/`),
      axios.get(`${API_URL}/tipos-licencia/`),
      axios.get(`${API_URL}/asignaciones/`),
    ])
      .then(([licenciasRes, tiposRes, asigRes]) => {
        setLicencias(licenciasRes.data)
        setTipos(tiposRes.data)
        setAsignaciones(asigRes.data)
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

  const ocupadosPorLicencia = useMemo(() => {
    const m = {}
    asignaciones.forEach(a => {
      if (a.licencia && !a.fecha_devolucion) {
        m[a.licencia] = (m[a.licencia] || 0) + 1
      }
    })
    return m
  }, [asignaciones])

  const tarjetas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return tipos
      .map(tipo => {
        const items = licencias.filter(l => l.tipo === tipo.id)
        const totalAsientos = items.reduce((sum, l) => sum + (l.asientos_totales || 0), 0)
        const ocupados = items.reduce((sum, l) => sum + (ocupadosPorLicencia[l.id] || 0), 0)
        return { tipo, items, totalAsientos, ocupados, ...calcularVigenciaResumen(items) }
      })
      .filter(t => !texto || t.tipo.nombre.toLowerCase().includes(texto) || (t.tipo.proveedor || '').toLowerCase().includes(texto))
      .sort((a, b) => a.tipo.nombre.localeCompare(b.tipo.nombre))
  }, [tipos, licencias, busqueda, ocupadosPorLicencia])

  const handleGuardar = (form) => {
    const payload = { ...form }
    if (payload.modalidad === 'perpetua') payload.fecha_vencimiento = null
    axios.post(`${API_URL}/licencias/`, payload)
      .then(() => {
        setModalAbierto(false)
        cargarDatos()
      })
      .catch(err => {
        mostrarToast('Error al guardar. Revisa que todos los campos requeridos estén llenos.')
        console.error(err.response?.data || err)
      })
  }

  const confirmarEliminarTipo = () => {
    if (!tipoAEliminar) return
    axios.delete(`${API_URL}/tipos-licencia/${tipoAEliminar.id}/`)
      .then(() => { setTipoAEliminar(null); cargarDatos(); mostrarToast('Tipo de licencia eliminado.', 'exito') })
      .catch(() => {
        mostrarToast('No se pudo eliminar: aún tiene licencias asociadas. Elimínalas primero.')
        setTipoAEliminar(null)
      })
  }

  if (cargando) return <p>Cargando licencias...</p>
  if (error) return <p style={{ color: 'var(--peligro-texto)' }}>{error}</p>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ color: 'var(--acento-texto)', margin: 0 }}>Licencias</h1>
          <button
            onClick={() => descargarArchivo(`${API_URL}/licencias/exportar/`, 'licencias.xlsx')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              background: 'transparent', border: '1px solid var(--campo-borde)', borderRadius: '6px',
              padding: '0.4rem 0.7rem', color: 'var(--texto-tenue)', fontSize: '0.82rem',
            }}
          >
            <Download size={14} /> Exportar Excel
          </button>
        </div>
        <button
          onClick={() => setModalAbierto(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            backgroundColor: 'var(--accion)', color: 'var(--sobre-accion)', border: 'none',
            padding: '0.6rem 1.1rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.95rem',
          }}
        >
          <Plus size={18} /> Nueva licencia
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <Search size={17} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--texto-4)' }} />
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o proveedor..."
          style={{
            width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem', borderRadius: '10px',
            border: '1px solid var(--campo-borde)', backgroundColor: 'var(--campo-bg-2)',
            color: 'var(--texto-claro)', fontSize: '0.9rem', boxSizing: 'border-box',
          }}
        />
      </div>

      {tarjetas.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--texto-4)', padding: '2rem' }}>
          <KeyRound size={28} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
          <p>No hay tipos de licencia registrados. Agrega uno desde el admin de Django (Licencias → Tipo licencias).</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
          gap: '1rem',
        }}>
          {tarjetas.map((t, idx) => {
            const Icon = iconoPorNombre(t.tipo.nombre)
            const color = coloresGrupo[idx % coloresGrupo.length]
            const libres = t.totalAsientos - t.ocupados
            const lleno = t.totalAsientos > 0 && libres <= 0

            return (
              <div
                key={t.tipo.id}
                className="card"
                onClick={() => navigate(`/licencias/${t.tipo.id}`)}
                style={{ cursor: 'pointer', position: 'relative', transition: 'transform 0.15s ease' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); setTipoAEliminar(t.tipo) }}
                  title="Eliminar tipo de licencia"
                  style={{
                    position: 'absolute', top: '0.75rem', right: '0.75rem',
                    background: 'var(--peligro-bg)', border: 'none', borderRadius: '6px',
                    padding: '0.35rem', color: 'var(--peligro-texto)', display: 'flex',
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
                <div style={{ fontWeight: 700, color: 'var(--texto-fuerte)', fontSize: '1rem', marginBottom: '0.2rem' }}>
                  {t.tipo.nombre}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--texto-tenue)', marginBottom: '0.5rem' }}>
                  {t.items.length} licencia{t.items.length !== 1 ? 's' : ''}
                </div>

                {t.totalAsientos > 0 && (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                    backgroundColor: lleno ? 'rgba(248,113,113,0.1)' : 'rgba(74,222,128,0.1)',
                    color: lleno ? 'var(--peligro-texto)' : 'var(--exito-texto)',
                    padding: '0.2rem 0.55rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700,
                    marginBottom: '0.6rem',
                  }}>
                    {t.ocupados}/{t.totalAsientos} · {libres} libre{libres !== 1 ? 's' : ''}
                  </div>
                )}

                {(t.vencidas > 0 || t.porVencer > 0) && (
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {t.vencidas > 0 && (
                      <span style={{ backgroundColor: 'var(--peligro-bg-2)', color: 'var(--peligro-texto)', padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600 }}>
                        {t.vencidas} vencida{t.vencidas !== 1 ? 's' : ''}
                      </span>
                    )}
                    {t.porVencer > 0 && (
                      <span style={{ backgroundColor: 'var(--aviso-bg)', color: 'var(--acento-texto)', padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600 }}>
                        {t.porVencer} por vencer
                      </span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <Modal isOpen={modalAbierto} onClose={() => setModalAbierto(false)} title="Nueva licencia">
        <LicenciaForm
          tipos={tipos}
          licenciaInicial={null}
          onSubmit={handleGuardar}
          onCancel={() => setModalAbierto(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!tipoAEliminar}
        title="¿Eliminar este tipo de licencia?"
        message={tipoAEliminar ? `Se eliminará "${tipoAEliminar.nombre}". Si tiene licencias asociadas, primero debes eliminarlas.` : ''}
        onConfirm={confirmarEliminarTipo}
        onCancel={() => setTipoAEliminar(null)}
      />

      <Toast key={toast?.key} mensaje={toast?.mensaje} tipo={toast?.tipo} onClose={() => setToast(null)} />
    </div>
  )
}

export default Licencias
