import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core'
import {
  ArrowLeft, KeyRound, Crown, Calculator, Megaphone, PenTool, Monitor,
  Settings, TrendingUp, Package, Users, BadgeCheck, Warehouse, GripVertical,
  Plus, Pencil, Trash2,
} from 'lucide-react'
import Modal from '../components/Modal'
import LicenciaCardForm from '../components/LicenciaCardForm'
import ConfirmDialog from '../components/ConfirmDialog'
import Toast from '../components/Toast'

const API_URL = 'http://127.0.0.1:8000/api'

function iconoPorArea(nombre) {
  const n = (nombre || '').toLowerCase()
  if (n.includes('direcci')) return Crown
  if (n.includes('finanz') || n.includes('contab')) return Calculator
  if (n.includes('marketing')) return Megaphone
  if (n.includes('diseñ')) return PenTool
  if (n === 'ti' || n.includes(' ti') || n.startsWith('ti ')) return Monitor
  if (n.includes('operacion')) return Settings
  if (n.includes('proyecto')) return TrendingUp
  if (n.includes('refaccion') || n.includes('almac')) return Warehouse
  if (n.includes('rh') || n.includes('recursos')) return Users
  if (n.includes('calidad')) return BadgeCheck
  return Package
}

function enmascarar(clave) {
  if (!clave) return 'X'.repeat(15)
  if (clave.length <= 4) return 'X'.repeat(clave.length)
  return 'X'.repeat(clave.length - 4) + clave.slice(-4)
}

function EmpleadoChip({ empleado, asignacionId, licenciaActualId }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `emp-${empleado.id}`,
    data: { empleadoId: empleado.id, asignacionId, licenciaActualId },
  })
  const style = {
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 100 : 1,
  }
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} title={empleado.correo} className="empleado-chip">
      <GripVertical size={12} color="#5B6785" />
      <div style={{
        width: '22px', height: '22px', borderRadius: '50%',
        backgroundColor: 'var(--campo-borde)', color: 'var(--texto-suave)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.7rem', fontWeight: 700, flexShrink: 0,
      }}>
        {empleado.nombre_completo.charAt(0).toUpperCase()}
      </div>
      <span style={{ fontSize: '0.82rem', color: 'var(--texto-claro)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {empleado.nombre_completo}
      </span>
    </div>
  )
}

function AreaGroup({ nombre, empleados }) {
  const Icon = iconoPorArea(nombre)
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
        <Icon size={14} color="#8892AB" />
        <span style={{ fontSize: '0.78rem', color: 'var(--texto-tenue)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          {nombre}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {empleados.map(emp => (
          <EmpleadoChip key={emp.id} empleado={emp} asignacionId={null} licenciaActualId={null} />
        ))}
      </div>
    </div>
  )
}

function LicenciaCard({ licencia, index, asignados, onEditar, onEliminar }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `lic-${licencia.id}`,
    data: { licenciaId: licencia.id, capacidad: licencia.asientos_totales },
  })

  const lleno = asignados.length >= licencia.asientos_totales
  const Icon = iconoPorArea(licencia.etiqueta)
  const titulo = licencia.etiqueta || `Licencia ${index + 1}`

  return (
    <div
      ref={setNodeRef}
      className="card"
      style={{
        padding: '1.1rem',
        border: isOver ? '2px dashed #F8C22E' : '1px solid var(--borde)',
        backgroundColor: isOver ? 'rgba(248,194,46,0.06)' : undefined,
        minHeight: '260px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '9px',
            backgroundColor: 'rgba(248,194,46,0.12)', color: '#F8C22E',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Icon size={17} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--texto-fuerte)', fontSize: '1rem' }}>{titulo}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--texto-5)', letterSpacing: '0.03em' }}>
              {enmascarar(licencia.clave_producto)}
            </div>
          </div>
        </div>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: lleno ? '#F87171' : '#4ADE80', flexShrink: 0 }}>
          {asignados.length}/{licencia.asientos_totales}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
        {asignados.length === 0 && (
          <p style={{ fontSize: '0.8rem', color: 'var(--texto-5)', margin: 0 }}>Sin asignar — arrastra aquí</p>
        )}
        {asignados.map(({ empleado, asignacionId }) => (
          <EmpleadoChip key={empleado.id} empleado={empleado} asignacionId={asignacionId} licenciaActualId={licencia.id} />
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid var(--borde-suave)' }}>
        <button
          onClick={() => onEditar(licencia)}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
            background: '#132A2A', border: 'none', borderRadius: '6px', padding: '0.4rem', color: '#2DD4BF', fontSize: '0.8rem',
          }}
        >
          <Pencil size={13} /> Editar
        </button>
        <button
          onClick={() => onEliminar(licencia)}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
            background: '#3A1A1A', border: 'none', borderRadius: '6px', padding: '0.4rem', color: '#F87171', fontSize: '0.8rem',
          }}
        >
          <Trash2 size={13} /> Eliminar
        </button>
      </div>
    </div>
  )
}

function TarjetaNueva({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="card"
      style={{
        minHeight: '260px', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
        border: '1px dashed var(--campo-borde)', background: 'transparent', color: 'var(--texto-4)',
      }}
    >
      <Plus size={22} />
      <span style={{ fontSize: '0.85rem' }}>Añadir licencia</span>
    </button>
  )
}

function ZonaSinAsignar({ grupos }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'sin-asignar', data: {} })
  return (
    <div
      ref={setNodeRef}
      className="card"
      style={{
        border: isOver ? '2px dashed #F87171' : '1px solid var(--borde)',
        backgroundColor: isOver ? 'rgba(248,113,113,0.06)' : undefined,
        maxHeight: '640px', overflowY: 'auto',
      }}
    >
      <h3 style={{ margin: '0 0 0.75rem', color: 'var(--texto-tenue)', fontSize: '0.85rem' }}>
        Sin asignar ({grupos.reduce((s, g) => s + g.empleados.length, 0)})
      </h3>
      {grupos.length === 0 ? (
        <p style={{ fontSize: '0.8rem', color: 'var(--texto-5)' }}>Todos los empleados tienen esta licencia asignada.</p>
      ) : (
        grupos.map(g => <AreaGroup key={g.nombre} nombre={g.nombre} empleados={g.empleados} />)
      )}
    </div>
  )
}

function LicenciaDetalle() {
  const { tipoId } = useParams()
  const navigate = useNavigate()
  const [tipo, setTipo] = useState(null)
  const [licencias, setLicencias] = useState([])
  const [empleados, setEmpleados] = useState([])
  const [asignaciones, setAsignaciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [toast, setToast] = useState(null)

  const [modalAbierto, setModalAbierto] = useState(false)
  const [licenciaEditando, setLicenciaEditando] = useState(null)
  const [licenciaAEliminar, setLicenciaAEliminar] = useState(null)

  const mostrarToast = (mensaje, tipo = 'error') => setToast({ mensaje, tipo, key: Date.now() })

  const cargarDatos = () => {
    setCargando(true)
    Promise.all([
      axios.get(`${API_URL}/tipos-licencia/${tipoId}/`),
      axios.get(`${API_URL}/licencias/`),
      axios.get(`${API_URL}/empleados/`),
      axios.get(`${API_URL}/asignaciones/`),
    ]).then(([tipoRes, licenciasRes, empleadosRes, asignacionesRes]) => {
      setTipo(tipoRes.data)
      setLicencias(licenciasRes.data.filter(l => String(l.tipo) === String(tipoId)))
      setEmpleados(empleadosRes.data)
      setAsignaciones(asignacionesRes.data)
      setCargando(false)
    }).catch(err => {
      console.error(err)
      setCargando(false)
    })
  }

  useEffect(() => {
    cargarDatos()
  }, [tipoId])

  const licenciaIds = useMemo(() => licencias.map(l => l.id), [licencias])

  const asignacionesActivas = useMemo(() => {
    return asignaciones.filter(a => a.licencia && licenciaIds.includes(a.licencia) && !a.fecha_devolucion)
  }, [asignaciones, licenciaIds])

  const empleadoPorId = useMemo(() => {
    const m = {}
    empleados.forEach(e => { m[e.id] = e })
    return m
  }, [empleados])

  const asignacionPorEmpleado = useMemo(() => {
    const m = {}
    asignacionesActivas.forEach(a => { m[a.empleado] = a })
    return m
  }, [asignacionesActivas])

  const licenciasConAsignados = useMemo(() => {
    return licencias.map(lic => ({
      licencia: lic,
      asignados: asignacionesActivas
        .filter(a => a.licencia === lic.id)
        .map(a => ({ empleado: empleadoPorId[a.empleado], asignacionId: a.id }))
        .filter(x => x.empleado),
    }))
  }, [licencias, asignacionesActivas, empleadoPorId])

  const gruposSinAsignar = useMemo(() => {
    const sinAsignar = empleados.filter(e => !asignacionPorEmpleado[e.id])
    const mapa = {}
    sinAsignar.forEach(e => {
      const area = e.departamento_nombre || 'Sin área'
      if (!mapa[area]) mapa[area] = []
      mapa[area].push(e)
    })
    return Object.entries(mapa)
      .map(([nombre, emps]) => ({ nombre, empleados: emps }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
  }, [empleados, asignacionPorEmpleado])

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over) return
    const { empleadoId, asignacionId } = active.data.current

    if (over.id === 'sin-asignar') {
      if (asignacionId) {
        axios.delete(`${API_URL}/asignaciones/${asignacionId}/`)
          .then(cargarDatos)
          .catch(() => mostrarToast('No se pudo desasignar.'))
      }
      return
    }

    if (String(over.id).startsWith('lic-')) {
      const { licenciaId, capacidad } = over.data.current
      const yaEnEsta = licenciasConAsignados.find(l => l.licencia.id === licenciaId)
      const ocupados = yaEnEsta ? yaEnEsta.asignados.length : 0
      const empleadoYaAhi = yaEnEsta && yaEnEsta.asignados.some(a => a.empleado.id === empleadoId)

      if (ocupados >= capacidad && !empleadoYaAhi) {
        mostrarToast('Esta licencia ya no tiene lugares disponibles.')
        return
      }

      if (asignacionId) {
        axios.patch(`${API_URL}/asignaciones/${asignacionId}/`, { licencia: licenciaId })
          .then(cargarDatos)
          .catch(() => mostrarToast('No se pudo mover la asignación.'))
      } else {
        axios.post(`${API_URL}/asignaciones/`, { empleado: empleadoId, licencia: licenciaId })
          .then(() => { cargarDatos(); mostrarToast('Empleado asignado correctamente.', 'exito') })
          .catch(() => mostrarToast('No se pudo asignar.'))
      }
    }
  }

  const abrirCrear = () => { setLicenciaEditando(null); setModalAbierto(true) }
  const abrirEditar = (lic) => { setLicenciaEditando(lic); setModalAbierto(true) }
  const cerrarModal = () => { setModalAbierto(false); setLicenciaEditando(null) }

  const handleGuardarLicencia = (form) => {
    const payload = { ...form, tipo: tipoId, modalidad: 'suscripcion' }
    const peticion = licenciaEditando
      ? axios.patch(`${API_URL}/licencias/${licenciaEditando.id}/`, payload)
      : axios.post(`${API_URL}/licencias/`, payload)

    peticion
      .then(() => { cerrarModal(); cargarDatos() })
      .catch(() => mostrarToast('No se pudo guardar la licencia.'))
  }

  const confirmarEliminarLicencia = () => {
    if (!licenciaAEliminar) return
    axios.delete(`${API_URL}/licencias/${licenciaAEliminar.id}/`)
      .then(() => { setLicenciaAEliminar(null); cargarDatos() })
      .catch(() => mostrarToast('No se pudo eliminar la licencia.'))
  }

  if (cargando) return <p>Cargando...</p>
  if (!tipo) return <p style={{ color: '#F87171' }}>No se encontró este tipo de licencia.</p>

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div>
        <button
          onClick={() => navigate('/licencias')}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            background: 'none', border: 'none', color: 'var(--texto-tenue)',
            fontSize: '0.85rem', marginBottom: '1rem', padding: 0,
          }}
        >
          <ArrowLeft size={16} /> Volver a Licencias
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            backgroundColor: 'rgba(248,194,46,0.12)', color: '#F8C22E',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <KeyRound size={22} />
          </div>
          <div>
            <h1 style={{ color: 'var(--texto-fuerte)', margin: 0 }}>{tipo.nombre}</h1>
            <p style={{ color: 'var(--texto-tenue)', margin: 0, fontSize: '0.85rem' }}>
              Arrastra un nombre para asignarlo o moverlo entre licencias
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.25rem', alignItems: 'start' }}>
          <ZonaSinAsignar grupos={gruposSinAsignar} />

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
            gap: '1.1rem',
          }}>
            {licenciasConAsignados.map(({ licencia, asignados }, i) => (
              <LicenciaCard
                key={licencia.id}
                licencia={licencia}
                index={i}
                asignados={asignados}
                onEditar={abrirEditar}
                onEliminar={setLicenciaAEliminar}
              />
            ))}
            <TarjetaNueva onClick={abrirCrear} />
          </div>
        </div>
      </div>

      <Modal
        isOpen={modalAbierto}
        onClose={cerrarModal}
        title={licenciaEditando ? 'Editar licencia' : 'Nueva licencia'}
      >
        <LicenciaCardForm
          licenciaInicial={licenciaEditando}
          onSubmit={handleGuardarLicencia}
          onCancel={cerrarModal}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!licenciaAEliminar}
        title="¿Eliminar esta licencia?"
        message={licenciaAEliminar ? `Se eliminará "${licenciaAEliminar.etiqueta || 'esta licencia'}" y las asignaciones asociadas. Esta acción no se puede deshacer.` : ''}
        onConfirm={confirmarEliminarLicencia}
        onCancel={() => setLicenciaAEliminar(null)}
      />

      <Toast key={toast?.key} mensaje={toast?.mensaje} tipo={toast?.tipo} onClose={() => setToast(null)} />
    </DndContext>
  )
}

export default LicenciaDetalle
