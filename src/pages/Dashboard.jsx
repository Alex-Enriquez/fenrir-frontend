import { useState, useEffect } from 'react'
import axios from 'axios'
import { Monitor, CheckCircle2, UserCheck, Wrench, XCircle } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const API_URL = 'http://127.0.0.1:8000/api'

const tarjetas = [
  { key: 'total', label: 'Total de equipos', icon: Monitor, color: '#F8C22E' },
  { key: 'disponible', label: 'Disponibles', icon: CheckCircle2, color: '#4ADE80' },
  { key: 'asignado', label: 'Asignados', icon: UserCheck, color: '#60A5FA' },
  { key: 'reparacion', label: 'En reparación', icon: Wrench, color: '#FBBF24' },
  { key: 'baja', label: 'De baja', icon: XCircle, color: '#F87171' },
]

const COLORES_ESTADO = {
  disponible: '#4ADE80',
  asignado: '#60A5FA',
  reparacion: '#FBBF24',
  baja: '#F87171',
}

const NOMBRES_ESTADO = {
  disponible: 'Disponible',
  asignado: 'Asignado',
  reparacion: 'En reparación',
  baja: 'De baja',
}

function Dashboard() {
  const [conteos, setConteos] = useState(null)
  const [datosEstado, setDatosEstado] = useState([])
  const [datosCategoria, setDatosCategoria] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    axios.get(`${API_URL}/equipos/`)
      .then(res => {
        const equipos = res.data
        const nuevosConteos = {
          total: equipos.length,
          disponible: equipos.filter(e => e.estado === 'disponible').length,
          asignado: equipos.filter(e => e.estado === 'asignado').length,
          reparacion: equipos.filter(e => e.estado === 'reparacion').length,
          baja: equipos.filter(e => e.estado === 'baja').length,
        }
        setConteos(nuevosConteos)

        setDatosEstado(
          Object.entries(NOMBRES_ESTADO)
            .map(([key, nombre]) => ({ nombre, valor: nuevosConteos[key], color: COLORES_ESTADO[key] }))
            .filter(d => d.valor > 0)
        )

        const grupos = {}
        equipos.forEach(e => {
          const cat = e.categoria_nombre || 'Sin categoría'
          grupos[cat] = (grupos[cat] || 0) + 1
        })
        setDatosCategoria(Object.entries(grupos).map(([nombre, cantidad]) => ({ nombre, cantidad })))

        setCargando(false)
      })
      .catch(err => {
        console.error(err)
        setCargando(false)
      })
  }, [])

  if (cargando) return <p>Cargando dashboard...</p>
  if (!conteos) return <p style={{ color: '#F87171' }}>No se pudo cargar la información.</p>

  return (
    <div>
      <h1 style={{ color: '#F8C22E', marginBottom: '1.5rem' }}>Dashboard</h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        {tarjetas.map(({ key, label, icon: Icon, color }) => (
          <div key={key} className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{
                backgroundColor: `${color}22`,
                color, borderRadius: '10px',
                width: '38px', height: '38px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={20} />
              </div>
              <span style={{ color: '#8892AB', fontSize: '0.85rem' }}>{label}</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{conteos[key]}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) minmax(320px, 1.4fr)', gap: '1.25rem' }}>
        <div className="card">
          <h2 style={{ marginTop: 0, color: '#F8C22E', fontSize: '1.1rem' }}>Equipos por estado</h2>
          {datosEstado.length === 0 ? (
            <p style={{ color: '#8892AB' }}>Sin datos todavía.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={datosEstado}
                  dataKey="valor"
                  nameKey="nombre"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {datosEstado.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#161C2E', border: '1px solid #262E48', borderRadius: '8px' }} />
                <Legend
                  formatter={(value) => <span style={{ color: '#C4CAD9', fontSize: '0.85rem' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0, color: '#F8C22E', fontSize: '1.1rem' }}>Equipos por categoría</h2>
          {datosCategoria.length === 0 ? (
            <p style={{ color: '#8892AB' }}>Sin datos todavía.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={datosCategoria} layout="vertical" margin={{ left: 10, right: 20 }}>
                <XAxis type="number" stroke="#5B6785" fontSize={12} allowDecimals={false} />
                <YAxis type="category" dataKey="nombre" stroke="#8892AB" fontSize={12} width={90} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{ backgroundColor: '#161C2E', border: '1px solid #262E48', borderRadius: '8px' }}
                />
                <Bar dataKey="cantidad" fill="#F8C22E" radius={[0, 6, 6, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
