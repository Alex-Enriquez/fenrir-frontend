import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, Pencil, Trash2, Building2, Monitor, KeyRound, Lock } from '../ui/icons'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import CatalogoForm from '../components/CatalogoForm'
import AccesoDenegado from '../components/AccesoDenegado'
import Toast from '../components/Toast'
import { useEsAdmin } from '../context/perfil'
import { API_URL } from '../config'

// "clave" es también la ruta de la API. "uso" = cómo se llaman, en singular y plural, los registros que usan cada elemento.
const CATALOGOS = [
  {
    clave: 'departamentos', titulo: 'Departamentos', icono: Building2, singular: 'departamento',
    nuevo: 'Nuevo departamento', uso: ['empleado', 'empleados'], ejemplo: 'ej. Finanzas, Ventas, TI',
    ayuda: 'Las áreas de la empresa. Se eligen al dar de alta a un empleado.',
  },
  {
    clave: 'categorias-equipo', titulo: 'Categorías de equipo', icono: Monitor, singular: 'categoría de equipo',
    nuevo: 'Nueva categoría de equipo', uso: ['equipo', 'equipos'], ejemplo: 'ej. Laptop, Monitor, Celular',
    ayuda: 'Laptop, monitor, celular, etc. Se eligen al registrar un equipo.',
  },
  {
    clave: 'tipos-licencia', titulo: 'Tipos de licencia', icono: KeyRound, singular: 'tipo de licencia',
    nuevo: 'Nuevo tipo de licencia', uso: ['licencia', 'licencias'], conProveedor: true, ejemplo: 'ej. Office 365, Antivirus',
    ayuda: 'Office 365, antivirus, etc. Se eligen al registrar una licencia.',
  },
  {
    clave: 'categorias-contrasena', titulo: 'Categorías de contraseñas', icono: Lock, singular: 'categoría de contraseñas',
    nuevo: 'Nueva categoría de contraseñas', uso: ['contraseña', 'contraseñas'], ejemplo: 'ej. Correos, Servidores',
    ayuda: 'Cómo se agrupan las contraseñas guardadas.',
  },
]

// El texto que mande el servidor (por ejemplo "Ya existe «Laptop».") se muestra tal cual.
function mensajeDeError(err, porDefecto) {
  const r = err?.response
  if (!r) return 'No hay conexión con el servidor.'
  if (r.status === 403) return 'Solo un administrador puede cambiar los catálogos.'
  const d = r.data
  if (d && typeof d === 'object') {
    if (d.detail) return String(d.detail)
    const primero = Object.values(d).flat()[0]
    if (primero) return String(primero)
  }
  return porDefecto
}

function Catalogos() {
  const esAdmin = useEsAdmin()
  const [clave, setClave] = useState(CATALOGOS[0].clave)
  const cat = CATALOGOS.find(c => c.clave === clave)

  const [items, setItems] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)
  const [recarga, setRecarga] = useState(0)

  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [aEliminar, setAEliminar] = useState(null)

  const mostrarToast = (mensaje, tipo = 'error') => setToast({ mensaje, tipo, key: Date.now() })
  const recargar = () => setRecarga(n => n + 1)

  useEffect(() => {
    if (!esAdmin) return undefined
    let vivo = true
    setCargando(true)
    setError(null)
    axios.get(`${API_URL}/${clave}/`)
      .then(res => { if (vivo) { setItems(res.data); setCargando(false) } })
      .catch(err => { if (vivo) { setItems([]); setError(mensajeDeError(err, 'No se pudo cargar la lista.')); setCargando(false) } })
    return () => { vivo = false }
  }, [clave, esAdmin, recarga])

  if (esAdmin === null) return <p>Cargando...</p>
  if (!esAdmin) return <AccesoDenegado mensaje="No tienes permisos de administrador para ver esta sección." />

  const abrirNuevo = () => { setEditando(null); setModalAbierto(true) }
  const abrirEditar = (item) => { setEditando(item); setModalAbierto(true) }
  const cerrarModal = () => { setModalAbierto(false); setEditando(null) }

  const handleGuardar = (form) => {
    const datos = { nombre: form.nombre.trim() }
    if (cat.conProveedor) datos.proveedor = (form.proveedor || '').trim()
    const peticion = editando
      ? axios.put(`${API_URL}/${clave}/${editando.id}/`, datos)
      : axios.post(`${API_URL}/${clave}/`, datos)
    return peticion
      .then(() => { cerrarModal(); recargar(); mostrarToast('Guardado.', 'exito') })
      .catch(err => mostrarToast(mensajeDeError(err, 'No se pudo guardar.')))
  }

  const confirmarEliminar = () => {
    if (!aEliminar) return
    axios.delete(`${API_URL}/${clave}/${aEliminar.id}/`)
      .then(() => { setAEliminar(null); recargar(); mostrarToast('Eliminado.', 'exito') })
      .catch(err => { setAEliminar(null); recargar(); mostrarToast(mensajeDeError(err, 'No se pudo eliminar.')) })
  }

  const ordenados = [...items].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
  const etiquetaUso = (n) => (n === 0 ? 'Sin uso' : `${n} ${n === 1 ? cat.uso[0] : cat.uso[1]}`)

  const estiloTab = (activa) => ({
    display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.5rem 0.95rem',
    borderRadius: '8px', fontSize: '0.88rem',
    ...(activa
      ? { backgroundColor: 'var(--accion)', color: 'var(--sobre-accion)', border: '1px solid transparent', fontWeight: 700 }
      : { backgroundColor: 'transparent', color: 'var(--sec-texto)', border: '1px solid var(--sec-borde)' }),
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
        <h1 style={{ color: 'var(--acento-texto)', margin: 0 }}>Catálogos</h1>
        <button
          onClick={abrirNuevo}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            backgroundColor: 'var(--accion)', color: 'var(--sobre-accion)', border: 'none',
            padding: '0.6rem 1.1rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.95rem',
          }}
        >
          <Plus size={18} /> {cat.nuevo}
        </button>
      </div>
      <p style={{ color: 'var(--texto-tenue)', fontSize: '0.88rem', margin: '0 0 1.25rem' }}>
        Las listas que aparecen en los formularios. Solo los administradores pueden cambiarlas.
      </p>

      <div role="tablist" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
        {CATALOGOS.map(c => {
          const Icono = c.icono
          return (
            <button key={c.clave} role="tab" aria-selected={c.clave === clave} onClick={() => setClave(c.clave)} style={estiloTab(c.clave === clave)}>
              <Icono size={15} /> {c.titulo}
            </button>
          )
        })}
      </div>
      <p style={{ color: 'var(--texto-4)', fontSize: '0.82rem', margin: '0 0 1rem' }}>{cat.ayuda}</p>

      {cargando ? (
        <p>Cargando...</p>
      ) : error ? (
        <p style={{ color: 'var(--peligro-texto)' }}>{error}</p>
      ) : ordenados.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--texto-4)', padding: '2rem' }}>
          <p style={{ margin: 0 }}>Todavía no hay {cat.titulo.toLowerCase()}. Crea el primero con «{cat.nuevo}».</p>
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              {cat.conProveedor && <th>Proveedor</th>}
              <th>En uso</th>
              <th style={{ width: '110px' }} />
            </tr>
          </thead>
          <tbody>
            {ordenados.map((item, i) => {
              const enUso = (item.usos || 0) > 0
              return (
                <tr key={item.id} style={{ backgroundColor: i % 2 === 1 ? 'rgba(var(--velo-rgb), 0.015)' : 'transparent' }}>
                  <td>{item.nombre}</td>
                  {cat.conProveedor && <td style={{ color: 'var(--texto-tenue)' }}>{item.proveedor || '—'}</td>}
                  <td style={{ color: enUso ? 'var(--texto-claro)' : 'var(--texto-4)' }}>{etiquetaUso(item.usos || 0)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                      <button
                        aria-label={`Editar ${item.nombre}`} title="Editar" onClick={() => abrirEditar(item)}
                        style={{ background: 'transparent', border: '1px solid var(--sec-borde)', color: 'var(--sec-texto)', borderRadius: '6px', padding: '0.35rem 0.5rem', display: 'flex' }}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        aria-label={`Eliminar ${item.nombre}`} disabled={enUso}
                        title={enUso ? 'En uso: no se puede eliminar' : 'Eliminar'}
                        onClick={() => setAEliminar(item)}
                        style={{
                          backgroundColor: 'var(--cancel-bg)', border: '1px solid var(--cancel-borde)', color: 'var(--cancel-texto)',
                          borderRadius: '6px', padding: '0.35rem 0.5rem', display: 'flex',
                          opacity: enUso ? 0.35 : 1, cursor: enUso ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}

      <Modal isOpen={modalAbierto} onClose={cerrarModal} title={editando ? `Editar ${cat.singular}` : cat.nuevo}>
        <CatalogoForm
          inicial={editando} conProveedor={!!cat.conProveedor} ejemploNombre={cat.ejemplo}
          onSubmit={handleGuardar} onCancel={cerrarModal}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!aEliminar}
        title={`Eliminar ${cat.singular}`}
        message={aEliminar ? `Se eliminará «${aEliminar.nombre}». Esta acción no se puede deshacer.` : ''}
        onConfirm={confirmarEliminar}
        onCancel={() => setAEliminar(null)}
      />

      <Toast key={toast?.key} mensaje={toast?.mensaje} tipo={toast?.tipo} onClose={() => setToast(null)} />
    </div>
  )
}

export default Catalogos
