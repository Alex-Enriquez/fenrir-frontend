import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { Search, Monitor, Plus, Repeat, Undo2, Cpu, HardDrive, MemoryStick, LayoutGrid, List, Download } from '../ui/icons'
import Modal from '../components/Modal'
import AsignarEquipoForm from '../components/AsignarEquipoForm'
import ReasignarForm from '../components/ReasignarForm'
import ReasignarEquipo from '../components/ReasignarEquipo'
import ConfirmDialog from '../components/ConfirmDialog'
import Toast from '../components/Toast'
import { descargarArchivo } from '../utils/descargarArchivo'
import { API_URL } from '../config'
import { mensajeServidor } from '../ui/mensajes'

function EquipoInfo({ equipo }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '0.85rem' }}>
      <div style={{ fontWeight: 700, color: 'var(--texto-fuerte)', fontSize: '0.95rem' }}>
        {equipo.marca} {equipo.modelo}
      </div>
      <div style={{ fontSize: '0.78rem', color: 'var(--texto-5)' }}>N° Serie: {equipo.numero_serie}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.4rem' }}>
        {equipo.procesador && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--texto-tenue)' }}>
            <Cpu size={13} /> {equipo.procesador}
          </span>
        )}
        {equipo.memoria_ram && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--texto-tenue)' }}>
            <MemoryStick size={13} /> {equipo.memoria_ram}
          </span>
        )}
        {(equipo.disco_tipo || equipo.disco_capacidad) && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--texto-tenue)' }}>
            <HardDrive size={13} /> {equipo.disco_tipo} {equipo.disco_capacidad}
          </span>
        )}
        {equipo.sistema_operativo && (
          <span style={{ fontSize: '0.8rem', color: 'var(--texto-tenue)' }}>{equipo.sistema_operativo}</span>
        )}
      </div>
    </div>
  )
}

function Asignaciones() {
  const [empleados, setEmpleados] = useState([])
  const [equipos, setEquipos] = useState([])
  const [asignaciones, setAsignaciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [vista, setVista] = useState('tarjetas')
  const [toast, setToast] = useState(null)

  const [empleadoParaAsignar, setEmpleadoParaAsignar] = useState(null)
  const [asignacionParaReasignar, setAsignacionParaReasignar] = useState(null)
  const [asignacionParaLiberar, setAsignacionParaLiberar] = useState(null)

  const mostrarToast = (mensaje, tipo = 'error') => setToast({ mensaje, tipo, key: Date.now() })

  const cargarDatos = () => {
    setCargando(true)
    Promise.all([
      axios.get(`${API_URL}/empleados/`),
      axios.get(`${API_URL}/equipos/`),
      axios.get(`${API_URL}/asignaciones/`),
    ]).then(([empRes, eqRes, asigRes]) => {
      setEmpleados(empRes.data)
      setEquipos(eqRes.data)
      setAsignaciones(asigRes.data)
      setCargando(false)
    }).catch(err => {
      console.error(err)
      setCargando(false)
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

  const equiposDisponibles = useMemo(() => equipos.filter(e => e.estado === 'disponible'), [equipos])

  const empleadosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return empleados
      .filter(e => !texto || [e.nombre_completo, e.departamento_nombre].some(c => (c || '').toLowerCase().includes(texto)))
      .sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo))
  }, [empleados, busqueda])

  const handleAsignar = (equipoId) => {
    axios.post(`${API_URL}/asignaciones/`, { empleado: empleadoParaAsignar.id, equipo: equipoId })
      .then(() => {
        setEmpleadoParaAsignar(null)
        cargarDatos()
        mostrarToast('Equipo asignado correctamente.', 'exito')
      })
      .catch(err => mostrarToast(mensajeServidor(err, 'No se pudo asignar el equipo.')))
  }

  const handleReasignar = (nuevoEmpleadoId) => {
    const asignacionVieja = asignacionParaReasignar
    axios.patch(`${API_URL}/asignaciones/${asignacionVieja.id}/`, {
      fecha_devolucion: new Date().toISOString().slice(0, 10),
    })
      .then(() => axios.post(`${API_URL}/asignaciones/`, {
        empleado: nuevoEmpleadoId,
        equipo: asignacionVieja.equipo,
      }))
      .then(() => {
        setAsignacionParaReasignar(null)
        cargarDatos()
        mostrarToast('Equipo reasignado correctamente.', 'exito')
      })
      .catch(err => mostrarToast(mensajeServidor(err, 'No se pudo reasignar el equipo.')))
  }

  const confirmarLiberar = () => {
    if (!asignacionParaLiberar) return
    axios.patch(`${API_URL}/asignaciones/${asignacionParaLiberar.id}/`, {
      fecha_devolucion: new Date().toISOString().slice(0, 10),
    })
      .then(() => {
        setAsignacionParaLiberar(null)
        cargarDatos()
        mostrarToast('Equipo liberado, ahora está disponible.', 'exito')
      })
      .catch(() => mostrarToast('No se pudo liberar el equipo.'))
  }

  if (cargando) return <p>Cargando...</p>

  const BotonesVista = () => (
    <div style={{ display: 'flex', gap: '0.3rem', backgroundColor: 'var(--campo-bg-2)', borderRadius: '8px', padding: '0.25rem' }}>
      <button
        onClick={() => setVista('tarjetas')}
        title="Vista de tarjetas"
        style={{
          display: 'flex', alignItems: 'center', gap: '0.35rem', border: 'none', borderRadius: '6px',
          padding: '0.4rem 0.7rem', fontSize: '0.82rem',
          backgroundColor: vista === 'tarjetas' ? 'var(--accion)' : 'transparent',
          color: vista === 'tarjetas' ? 'var(--sobre-accion)' : 'var(--texto-tenue)',
        }}
      >
        <LayoutGrid size={14} /> Tarjetas
      </button>
      <button
        onClick={() => setVista('tabla')}
        title="Vista de tabla"
        style={{
          display: 'flex', alignItems: 'center', gap: '0.35rem', border: 'none', borderRadius: '6px',
          padding: '0.4rem 0.7rem', fontSize: '0.82rem',
          backgroundColor: vista === 'tabla' ? 'var(--accion)' : 'transparent',
          color: vista === 'tabla' ? 'var(--sobre-accion)' : 'var(--texto-tenue)',
        }}
      >
        <List size={14} /> Tabla
      </button>
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ color: 'var(--acento-texto)', margin: 0 }}>Asignaciones</h1>
          <button
            onClick={() => descargarArchivo(`${API_URL}/asignaciones/exportar/`, 'asignaciones.xlsx')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              background: 'var(--exp-bg)', border: '1px solid var(--exp-borde)', borderRadius: '6px',
              padding: '0.4rem 0.7rem', color: 'var(--exp-texto)', fontSize: '0.82rem',
            }}
          >
            <Download size={14} /> Exportar Excel
          </button>
        </div>
        <BotonesVista />
      </div>

      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <Search size={17} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--texto-4)' }} />
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar empleado o área..."
          style={{
            width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem', borderRadius: '10px',
            border: '1px solid var(--campo-borde)', backgroundColor: 'var(--campo-bg-2)',
            color: 'var(--texto-claro)', fontSize: '0.9rem', boxSizing: 'border-box',
          }}
        />
      </div>

      {vista === 'tarjetas' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1rem',
        }}>
          {empleadosFiltrados.map(emp => {
            const asignacion = asignacionActivaPorEmpleado[emp.id]
            const equipo = asignacion ? equipoPorId[asignacion.equipo] : null

            return (
              <div key={emp.id} className="card" style={{ minHeight: '200px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--texto-fuerte)', fontSize: '0.95rem' }}>{emp.nombre_completo}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--texto-tenue)' }}>{emp.departamento_nombre}</div>
                </div>

                <div style={{ flex: 1 }}>
                  {equipo ? (
                    <EquipoInfo equipo={equipo} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--texto-5)', fontSize: '0.85rem', margin: '0.5rem 0' }}>
                      <Monitor size={16} /> Sin equipo asignado
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--borde-suave)' }}>
                  {equipo ? (
                    <>
                      <button
                        onClick={() => setAsignacionParaReasignar(asignacion)}
                        style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                          background: 'var(--info-bg)', border: 'none', borderRadius: '6px', padding: '0.4rem', color: 'var(--info-texto)', fontSize: '0.8rem',
                        }}
                      >
                        <Repeat size={13} /> Reasignar
                      </button>
                      <button
                        onClick={() => setAsignacionParaLiberar(asignacion)}
                        style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                          background: 'var(--peligro-bg)', border: 'none', borderRadius: '6px', padding: '0.4rem', color: 'var(--peligro-texto)', fontSize: '0.8rem',
                        }}
                      >
                        <Undo2 size={13} /> Liberar
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setEmpleadoParaAsignar(emp)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                        background: 'rgba(248,194,46,0.1)', border: '1px solid rgba(248,194,46,0.3)', borderRadius: '6px',
                        padding: '0.45rem', color: 'var(--acento-texto)', fontSize: '0.85rem', fontWeight: 600,
                      }}
                    >
                      <Plus size={14} /> Asignar equipo
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Empleado</th>
                <th>Área</th>
                <th>Equipo</th>
                <th>N° Serie</th>
                <th>Procesador</th>
                <th>RAM</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empleadosFiltrados.map((emp, i) => {
                const asignacion = asignacionActivaPorEmpleado[emp.id]
                const equipo = asignacion ? equipoPorId[asignacion.equipo] : null

                return (
                  <tr key={emp.id} style={{ backgroundColor: i % 2 === 1 ? 'rgba(var(--velo-rgb), 0.015)' : 'transparent' }}>
                    <td>{emp.nombre_completo}</td>
                    <td>{emp.departamento_nombre}</td>
                    <td>{equipo ? `${equipo.marca} ${equipo.modelo}` : <span style={{ color: 'var(--texto-5)' }}>Sin equipo</span>}</td>
                    <td>{equipo?.numero_serie || equipo?.imei || '—'}</td>
                    <td>{equipo?.procesador || '—'}</td>
                    <td>{equipo?.memoria_ram || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        {equipo ? (
                          <>
                            <button
                              onClick={() => setAsignacionParaReasignar(asignacion)}
                              title="Reasignar"
                              style={{ background: 'var(--info-bg)', border: 'none', borderRadius: '6px', padding: '0.4rem', color: 'var(--info-texto)', display: 'flex' }}
                            >
                              <Repeat size={15} />
                            </button>
                            <button
                              onClick={() => setAsignacionParaLiberar(asignacion)}
                              title="Liberar"
                              style={{ background: 'var(--peligro-bg)', border: 'none', borderRadius: '6px', padding: '0.4rem', color: 'var(--peligro-texto)', display: 'flex' }}
                            >
                              <Undo2 size={15} />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setEmpleadoParaAsignar(emp)}
                            title="Asignar equipo"
                            style={{ background: 'rgba(248,194,46,0.1)', border: 'none', borderRadius: '6px', padding: '0.4rem', color: 'var(--acento-texto)', display: 'flex' }}
                          >
                            <Plus size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={!!empleadoParaAsignar} onClose={() => setEmpleadoParaAsignar(null)} title={`Asignar equipo a ${empleadoParaAsignar?.nombre_completo || ''}`}>
        <AsignarEquipoForm equiposDisponibles={equiposDisponibles} onSubmit={handleAsignar} onCancel={() => setEmpleadoParaAsignar(null)} />
      </Modal>

      <ReasignarEquipo
        asignacion={asignacionParaReasignar?.equipo && !asignacionParaReasignar?.licencia ? asignacionParaReasignar : null}
        empleados={empleados}
        equipos={equipos}
        asignaciones={asignaciones}
        mostrarToast={mostrarToast}
        onClose={() => setAsignacionParaReasignar(null)}
        onHecho={() => Promise.all([axios.get(`${API_URL}/asignaciones/`), axios.get(`${API_URL}/equipos/`)])
          .then(([a, e]) => { setAsignaciones(a.data); setEquipos(e.data) })}
      />

      <Modal isOpen={!!asignacionParaReasignar && !(asignacionParaReasignar.equipo && !asignacionParaReasignar.licencia)} onClose={() => setAsignacionParaReasignar(null)} title="Reasignar licencia">
        <ReasignarForm
          empleadosDisponibles={empleados.filter(e => e.id !== asignacionParaReasignar?.empleado)}
          onSubmit={handleReasignar}
          onCancel={() => setAsignacionParaReasignar(null)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!asignacionParaLiberar}
        title="¿Liberar este equipo?"
        message="El equipo quedará disponible para asignarse a otra persona."
        onConfirm={confirmarLiberar}
        onCancel={() => setAsignacionParaLiberar(null)}
      />

      <Toast key={toast?.key} mensaje={toast?.mensaje} tipo={toast?.tipo} onClose={() => setToast(null)} />
    </div>
  )
}

export default Asignaciones
