import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { Plus, Pencil, Trash2, Search, ArrowUpDown, Laptop, Monitor as MonitorIcon, Server, HelpCircle, Download } from 'lucide-react'
import Modal from '../components/Modal'
import EquipoForm from '../components/EquipoForm'
import ConfirmDialog from '../components/ConfirmDialog'
import { descargarArchivo } from '../utils/descargarArchivo'
import ImportarExcelForm from '../components/ImportarExcelForm'

const API_URL = 'http://127.0.0.1:8000/api'

const badgeColors = {
  disponible: { bg: 'var(--exito-bg)', color: 'var(--exito-texto)' },
  asignado: { bg: 'var(--info-bg-2)', color: 'var(--info-texto)' },
  reparacion: { bg: 'var(--aviso-bg)', color: 'var(--acento-texto)' },
  baja: { bg: 'var(--peligro-bg-2)', color: 'var(--peligro-texto)' },
}

const filtros = [
  { key: 'todos', label: 'Todos' },
  { key: 'disponible', label: 'Disponibles' },
  { key: 'asignado', label: 'Asignados' },
  { key: 'reparacion', label: 'En reparación' },
  { key: 'baja', label: 'De baja' },
]

const iconosCategoria = {
  laptop: Laptop,
  pc: MonitorIcon,
  servidor: Server,
}

function IconoCategoria({ nombre }) {
  const key = (nombre || '').toLowerCase()
  const Icon = iconosCategoria[key] || HelpCircle
  return <Icon size={15} color="#8892AB" />
}

function EstadoBadge({ estado }) {
  const style = badgeColors[estado] || { bg: 'var(--campo-borde)', color: 'var(--texto-claro)' }
  return (
    <span style={{
      backgroundColor: style.bg, color: style.color,
      padding: '0.25rem 0.65rem', borderRadius: '999px',
      fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize',
    }}>
      {estado}
    </span>
  )
}

function Equipos() {
  const [equipos, setEquipos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const [busqueda, setBusqueda] = useState('')
  const [filtroActivo, setFiltroActivo] = useState('todos')
  const [orden, setOrden] = useState({ campo: null, dir: 1 })

  const [modalAbierto, setModalAbierto] = useState(false)
  const [equipoEditando, setEquipoEditando] = useState(null)
  const [equipoAEliminar, setEquipoAEliminar] = useState(null)
  const [modalImportar, setModalImportar] = useState(false)

  const cargarDatos = () => {
    setCargando(true)
    Promise.all([
      axios.get(`${API_URL}/equipos/`),
      axios.get(`${API_URL}/categorias-equipo/`),
    ])
      .then(([equiposRes, categoriasRes]) => {
        setEquipos(equiposRes.data)
        setCategorias(categoriasRes.data)
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
    const c = { todos: equipos.length, disponible: 0, asignado: 0, reparacion: 0, baja: 0 }
    equipos.forEach(e => { c[e.estado] = (c[e.estado] || 0) + 1 })
    return c
  }, [equipos])

  const equiposFiltrados = useMemo(() => {
    let lista = equipos.filter(e => {
      const coincideFiltro = filtroActivo === 'todos' || e.estado === filtroActivo
      const texto = busqueda.trim().toLowerCase()
      const coincideBusqueda = !texto || [e.marca, e.modelo, e.numero_serie, e.categoria_nombre]
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
  }, [equipos, busqueda, filtroActivo, orden])

  const toggleOrden = (campo) => {
    setOrden(prev => prev.campo === campo ? { campo, dir: prev.dir * -1 } : { campo, dir: 1 })
  }

  const abrirNuevo = () => {
    setEquipoEditando(null)
    setModalAbierto(true)
  }

  const abrirEditar = (equipo) => {
    setEquipoEditando(equipo)
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    setEquipoEditando(null)
  }

   const handleGuardar = (form) => {
    const payload = { ...form }
    const peticion = equipoEditando
      ? axios.put(`${API_URL}/equipos/${equipoEditando.id}/`, payload)
      : axios.post(`${API_URL}/equipos/`, payload)

    return peticion
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
    if (!equipoAEliminar) return
    axios.delete(`${API_URL}/equipos/${equipoAEliminar.id}/`)
      .then(() => {
        setEquipoAEliminar(null)
        cargarDatos()
      })
      .catch(err => {
        alert('No se pudo eliminar el equipo.')
        console.error(err)
      })
  }

  if (cargando) return <p>Cargando equipos...</p>
  if (error) return <p style={{ color: 'var(--peligro-texto)' }}>{error}</p>

  const columnas = [
    { key: 'marca', label: 'Marca' },
    { key: 'modelo', label: 'Modelo' },
    { key: 'numero_serie', label: 'N° Serie' },
    { key: 'categoria_nombre', label: 'Categoría' },
    { key: 'estado', label: 'Estado' },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ color: 'var(--acento-texto)', margin: 0 }}>Equipos</h1>
                    <button
            onClick={() => descargarArchivo(`${API_URL}/equipos/exportar/`, 'equipos.xlsx')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              background: 'var(--exp-bg)', border: '1px solid var(--exp-borde)', borderRadius: '6px',
              padding: '0.4rem 0.7rem', color: 'var(--exp-texto)', fontSize: '0.82rem',
            }}
          >
            <Download size={14} /> Exportar Excel
          </button>
          <button
            onClick={() => setModalImportar(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              background: 'var(--exp-bg)', border: '1px solid var(--exp-borde)', borderRadius: '6px',
              padding: '0.4rem 0.7rem', color: 'var(--exp-texto)', fontSize: '0.82rem',
            }}
          >
            <Download size={14} style={{ transform: 'rotate(180deg)' }} /> Importar Excel
          </button>
        </div>
        <button
          onClick={abrirNuevo}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            backgroundColor: 'var(--accion)', color: 'var(--sobre-accion)', border: 'none',
            padding: '0.6rem 1.1rem', borderRadius: '8px', fontWeight: 'bold',
            fontSize: '0.95rem',
          }}
        >
          <Plus size={18} /> Nuevo equipo
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <Search size={17} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--texto-4)' }} />
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por marca, modelo, número de serie o categoría..."
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
              <th>Procesador</th>
              <th>RAM</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {equiposFiltrados.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', color: 'var(--texto-4)', padding: '2rem' }}>
                  No se encontraron equipos con esos criterios.
                </td>
              </tr>
            ) : (
              equiposFiltrados.map((equipo, i) => (
                <tr key={equipo.id} style={{ backgroundColor: i % 2 === 1 ? 'rgba(var(--velo-rgb), 0.015)' : 'transparent' }}>
                  <td>{equipo.marca}</td>
                  <td>{equipo.modelo}</td>
                  <td>{equipo.numero_serie}</td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      <IconoCategoria nombre={equipo.categoria_nombre} /> {equipo.categoria_nombre}
                    </span>
                  </td>
                  <td><EstadoBadge estado={equipo.estado} /></td>
                  <td>{equipo.procesador}</td>
                  <td>{equipo.memoria_ram}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => abrirEditar(equipo)}
                        title="Editar"
                        style={{ background: 'var(--edit-bg)', border: 'none', borderRadius: '6px', padding: '0.4rem', color: 'var(--edit-texto)', display: 'flex' }}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => setEquipoAEliminar(equipo)}
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
        title={equipoEditando ? 'Editar equipo' : 'Nuevo equipo'}
      >
        <EquipoForm
          categorias={categorias}
          equipoInicial={equipoEditando}
          onSubmit={handleGuardar}
          onCancel={cerrarModal}
          onCategoriaCreada={cargarDatos}
        />
      </Modal>

      <Modal isOpen={modalImportar} onClose={() => setModalImportar(false)} title="Importar equipos desde Excel">
        <ImportarExcelForm
          urlPlantilla={`${API_URL}/equipos/plantilla/`}
          urlImportar={`${API_URL}/equipos/importar/`}
          nombrePlantilla="plantilla_equipos.xlsx"
          onTerminado={() => { setModalImportar(false); cargarDatos() }}
          onCancel={() => setModalImportar(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!equipoAEliminar}
        title="¿Eliminar este equipo?"
        message={equipoAEliminar ? `Se eliminará ${equipoAEliminar.marca} ${equipoAEliminar.modelo} (${equipoAEliminar.numero_serie}). Esta acción no se puede deshacer.` : ''}
        onConfirm={confirmarEliminar}
        onCancel={() => setEquipoAEliminar(null)}
      />
    </div>
  )
}

export default Equipos
