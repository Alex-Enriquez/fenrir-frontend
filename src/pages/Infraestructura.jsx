import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { Plus, Search, Eye, Trash2, Network, List, Server, Grid3x3 } from '../ui/icons'
import Modal from '../components/Modal'
import DispositivoRedForm from '../components/DispositivoRedForm'
import DispositivoDetalleModal from '../components/DispositivoDetalleModal'
import RackForm from '../components/RackForm'
import RackDiagram from '../components/RackDiagram'
import ConfirmDialog from '../components/ConfirmDialog'
import Toast from '../components/Toast'
import { API_URL } from '../config'

const BADGE_ESTADO = {
  operativo: { bg: 'var(--info-bg-2)', color: 'var(--info-texto)' },
  mantenimiento: { bg: 'var(--aviso-bg)', color: 'var(--acento-texto)' },
  fuera_de_linea: { bg: 'var(--peligro-bg-2)', color: 'var(--peligro-texto)' },
}

function EstadoBadge({ estado }) {
  const s = BADGE_ESTADO[estado] || BADGE_ESTADO.operativo
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: s.bg, color: s.color, padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
      <span className="led-dot" style={{ backgroundColor: s.color, color: s.color }} />
      {estado === 'fuera_de_linea' ? 'Fuera de línea' : estado === 'mantenimiento' ? 'Mantenimiento' : 'Operativo'}
    </span>
  )
}

function Infraestructura() {
  const [vista, setVista] = useState('dispositivos') // 'dispositivos' | 'racks'
  const [dispositivos, setDispositivos] = useState([])
  const [racks, setRacks] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [toast, setToast] = useState(null)

  const [modalNuevoDispositivo, setModalNuevoDispositivo] = useState(false)
  const [dispositivoViendo, setDispositivoViendo] = useState(null)
  const [dispositivoAEliminar, setDispositivoAEliminar] = useState(null)

  const [modalRack, setModalRack] = useState(false)
  const [rackEditando, setRackEditando] = useState(null)
  const [rackAEliminar, setRackAEliminar] = useState(null)
  const [rackViendo, setRackViendo] = useState(null)

  const mostrarToast = (mensaje, tipo = 'error') => setToast({ mensaje, tipo, key: Date.now() })

  const cargarDatos = () => {
    setCargando(true)
    Promise.all([
      axios.get(`${API_URL}/dispositivos-red/`),
      axios.get(`${API_URL}/racks/`),
    ]).then(([dispRes, rackRes]) => {
      setDispositivos(dispRes.data)
      setRacks(rackRes.data)
      setCargando(false)
      if (dispositivoViendo) {
        const actualizado = dispRes.data.find(d => d.id === dispositivoViendo.id)
        if (actualizado) setDispositivoViendo(actualizado)
      }
    }).catch(err => { console.error(err); setCargando(false) })
  }

  useEffect(() => { cargarDatos() }, [])

  const dispositivosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return dispositivos.filter(d => !texto || [d.nombre, d.marca, d.modelo, d.ip_gestion].some(c => (c || '').toLowerCase().includes(texto)))
  }, [dispositivos, busqueda])

  // --- Dispositivos ---
  const handleCrearDispositivo = (form) => {
    return axios.post(`${API_URL}/dispositivos-red/`, form)
      .then(() => { setModalNuevoDispositivo(false); cargarDatos(); mostrarToast('Dispositivo creado.', 'exito') })
      .catch(() => mostrarToast('No se pudo crear el dispositivo.'))
  }

  const handleGuardarDispositivo = (form) => {
    return axios.put(`${API_URL}/dispositivos-red/${dispositivoViendo.id}/`, form)
      .then(() => { cargarDatos(); mostrarToast('Dispositivo actualizado.', 'exito') })
      .catch(() => mostrarToast('No se pudo guardar el dispositivo.'))
  }

  const confirmarEliminarDispositivo = () => {
    if (!dispositivoAEliminar) return
    axios.delete(`${API_URL}/dispositivos-red/${dispositivoAEliminar.id}/`)
      .then(() => { setDispositivoAEliminar(null); cargarDatos(); mostrarToast('Dispositivo eliminado.', 'exito') })
      .catch(() => mostrarToast('No se pudo eliminar.'))
  }

  // --- Racks ---
  const abrirNuevoRack = () => { setRackEditando(null); setModalRack(true) }
  const cerrarModalRack = () => { setModalRack(false); setRackEditando(null) }

  const handleGuardarRack = (form) => {
    const peticion = rackEditando
      ? axios.put(`${API_URL}/racks/${rackEditando.id}/`, form)
      : axios.post(`${API_URL}/racks/`, form)
    peticion
      .then(() => { cerrarModalRack(); cargarDatos(); mostrarToast('Rack guardado.', 'exito') })
      .catch(() => mostrarToast('No se pudo guardar el rack.'))
  }

  const confirmarEliminarRack = () => {
    if (!rackAEliminar) return
    axios.delete(`${API_URL}/racks/${rackAEliminar.id}/`)
      .then(() => { setRackAEliminar(null); cargarDatos(); mostrarToast('Rack eliminado.', 'exito') })
      .catch(() => mostrarToast('No se pudo eliminar: aún tiene dispositivos asignados.'))
  }

  if (cargando) return <p>Cargando...</p>

  const BotonesVista = () => (
    <div style={{ display: 'flex', gap: '0.3rem', backgroundColor: 'var(--campo-bg-2)', borderRadius: '8px', padding: '0.25rem' }}>
      <button onClick={() => setVista('dispositivos')} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', border: 'none', borderRadius: '6px', padding: '0.4rem 0.7rem', fontSize: '0.82rem', backgroundColor: vista === 'dispositivos' ? 'var(--accion)' : 'transparent', color: vista === 'dispositivos' ? 'var(--sobre-accion)' : 'var(--texto-tenue)' }}>
        <List size={14} /> Dispositivos
      </button>
      <button onClick={() => setVista('racks')} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', border: 'none', borderRadius: '6px', padding: '0.4rem 0.7rem', fontSize: '0.82rem', backgroundColor: vista === 'racks' ? 'var(--accion)' : 'transparent', color: vista === 'racks' ? 'var(--sobre-accion)' : 'var(--texto-tenue)' }}>
        <Grid3x3 size={14} /> Racks
      </button>
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h1 style={{ color: 'var(--acento-texto)', margin: 0 }}>Infraestructura de red</h1>
        <BotonesVista />
      </div>

      {vista === 'dispositivos' ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={17} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--texto-4)' }} />
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre, marca, modelo o IP..."
                style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem', borderRadius: '10px', border: '1px solid var(--campo-borde)', backgroundColor: 'var(--campo-bg-2)', color: 'var(--texto-claro)', fontSize: '0.9rem', boxSizing: 'border-box' }}
              />
            </div>
            <button onClick={() => setModalNuevoDispositivo(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--accion)', color: 'var(--sobre-accion)', border: 'none', padding: '0.6rem 1.1rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
              <Plus size={18} /> Nuevo dispositivo
            </button>
          </div>

          <div className="card">
            <table>
              <thead>
                <tr>
                  <th>Tipo</th><th>Nombre</th><th>Marca/Modelo</th><th>IP</th><th>Rack</th><th>Estado</th><th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {dispositivosFiltrados.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--texto-4)', padding: '2rem' }}><Network size={24} style={{ opacity: 0.5, marginBottom: '0.5rem' }} /><br />No hay dispositivos registrados.</td></tr>
                ) : (
                  dispositivosFiltrados.map((d, i) => (
                    <tr key={d.id} style={{ backgroundColor: i % 2 === 1 ? 'rgba(var(--velo-rgb), 0.015)' : 'transparent' }}>
                      <td style={{ textTransform: 'capitalize' }}>{d.tipo.replace('_', ' ')}</td>
                      <td>{d.nombre}</td>
                      <td>{d.marca} {d.modelo}</td>
                      <td>{d.ip_gestion || '—'}</td>
                      <td>{d.rack_nombre || '—'}</td>
                      <td><EstadoBadge estado={d.estado} /></td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          <button onClick={() => setDispositivoViendo(d)} title="Ver dispositivo" style={{ background: 'var(--info-bg)', border: 'none', borderRadius: '6px', padding: '0.4rem', color: 'var(--info-texto)', display: 'flex' }}>
                            <Eye size={15} />
                          </button>
                          <button onClick={() => setDispositivoAEliminar(d)} title="Eliminar" style={{ background: 'var(--peligro-bg)', border: 'none', borderRadius: '6px', padding: '0.4rem', color: 'var(--peligro-texto)', display: 'flex' }}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
            <button onClick={abrirNuevoRack} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--accion)', color: 'var(--sobre-accion)', border: 'none', padding: '0.6rem 1.1rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.95rem' }}>
              <Plus size={18} /> Nuevo rack
            </button>
          </div>

          {racks.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', color: 'var(--texto-4)', padding: '2rem' }}>
              <Server size={28} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
              <p>No hay racks registrados todavía.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '1rem' }}>
              {racks.map(r => {
                const cantidad = dispositivos.filter(d => d.rack === r.id).length
                return (
                  <div key={r.id} className="card" onClick={() => setRackViendo(r)} style={{ cursor: 'pointer', position: 'relative' }}>
                    <button onClick={(e) => { e.stopPropagation(); setRackAEliminar(r) }} style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'var(--peligro-bg)', border: 'none', borderRadius: '6px', padding: '0.35rem', color: 'var(--peligro-texto)', display: 'flex' }}>
                      <Trash2 size={14} />
                    </button>
                    <div style={{ width: '42px', height: '42px', borderRadius: '11px', backgroundColor: 'rgba(96,165,250,0.12)', color: 'var(--info-texto)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem' }}>
                      <Server size={20} />
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--texto-fuerte)', fontSize: '1rem', marginBottom: '0.2rem' }}>{r.nombre}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--texto-tenue)' }}>{r.altura_u}U · {cantidad} dispositivo{cantidad !== 1 ? 's' : ''}</div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      <Modal isOpen={modalNuevoDispositivo} onClose={() => setModalNuevoDispositivo(false)} title="Nuevo dispositivo">
        <DispositivoRedForm racks={racks} dispositivoInicial={null} onSubmit={handleCrearDispositivo} onCancel={() => setModalNuevoDispositivo(false)} />
      </Modal>

      <Modal isOpen={modalRack} onClose={cerrarModalRack} title={rackEditando ? 'Editar rack' : 'Nuevo rack'}>
        <RackForm rackInicial={rackEditando} onSubmit={handleGuardarRack} onCancel={cerrarModalRack} />
      </Modal>

      <Modal isOpen={!!dispositivoViendo} onClose={() => setDispositivoViendo(null)} title="">
        {dispositivoViendo && (
          <DispositivoDetalleModal
            dispositivo={dispositivoViendo}
            racks={racks}
            onGuardar={handleGuardarDispositivo}
            onCerrar={() => setDispositivoViendo(null)}
          />
        )}
      </Modal>

      <Modal isOpen={!!rackViendo} onClose={() => setRackViendo(null)} title={rackViendo?.nombre || ''}>
        {rackViendo && <RackDiagram rack={rackViendo} dispositivos={dispositivos.filter(d => d.rack === rackViendo.id)} />}
      </Modal>

      <ConfirmDialog isOpen={!!dispositivoAEliminar} title="¿Eliminar este dispositivo?" message={dispositivoAEliminar ? `Se eliminará "${dispositivoAEliminar.nombre}" y sus puertos.` : ''} onConfirm={confirmarEliminarDispositivo} onCancel={() => setDispositivoAEliminar(null)} />
      <ConfirmDialog isOpen={!!rackAEliminar} title="¿Eliminar este rack?" message={rackAEliminar ? `Se eliminará "${rackAEliminar.nombre}".` : ''} onConfirm={confirmarEliminarRack} onCancel={() => setRackAEliminar(null)} />

      <Toast key={toast?.key} mensaje={toast?.mensaje} tipo={toast?.tipo} onClose={() => setToast(null)} />
    </div>
  )
}

export default Infraestructura
