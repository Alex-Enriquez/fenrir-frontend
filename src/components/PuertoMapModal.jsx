import { useState, useEffect } from 'react'
import axios from 'axios'
import PuertoEditForm from './PuertoEditForm'

const API_URL = 'http://127.0.0.1:8000/api'

const COLORES_PUERTO = {
  libre: { bg: 'var(--borde-suave)', color: 'var(--texto-5)', border: 'var(--campo-borde)' },
  activo: { bg: 'rgba(74,222,128,0.15)', color: '#4ADE80', border: '#4ADE80' },
  inactivo: { bg: 'rgba(248,113,113,0.15)', color: '#F87171', border: '#F87171' },
}

function PuertoMapModal({ dispositivo }) {
  const [puertos, setPuertos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [puertoSeleccionado, setPuertoSeleccionado] = useState(null)

  const cargarPuertos = () => {
    axios.get(`${API_URL}/dispositivos-red/${dispositivo.id}/puertos/`)
      .then(res => { setPuertos(res.data); setCargando(false) })
      .catch(() => setCargando(false))
  }

  useEffect(() => { cargarPuertos() }, [dispositivo])

  const handleGuardarPuerto = (form) => {
    axios.patch(`${API_URL}/puertos-red/${form.id}/`, form)
      .then(() => { setPuertoSeleccionado(null); cargarPuertos() })
      .catch(() => alert('No se pudo guardar el puerto.'))
  }

  if (cargando) return <p>Cargando puertos...</p>

  const activos = puertos.filter(p => p.estado === 'activo').length
  const libres = puertos.filter(p => p.estado === 'libre').length

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', fontSize: '0.82rem' }}>
        <span style={{ color: '#4ADE80' }}>● {activos} activos</span>
        <span style={{ color: 'var(--texto-5)' }}>● {libres} libres</span>
        <span style={{ color: '#F87171' }}>● {puertos.length - activos - libres} inactivos</span>
      </div>

      {puertoSeleccionado ? (
        <PuertoEditForm puerto={puertoSeleccionado} onSubmit={handleGuardarPuerto} onCancel={() => setPuertoSeleccionado(null)} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '0.5rem' }}>
          {puertos.map(p => {
            const c = COLORES_PUERTO[p.estado] || COLORES_PUERTO.libre
            return (
              <button
                key={p.id}
                onClick={() => setPuertoSeleccionado(p)}
                title={p.conectado_a || 'Sin conexión'}
                style={{
                  aspectRatio: '1', borderRadius: '6px', border: `1.5px solid ${c.border}`,
                  backgroundColor: c.bg, color: c.color, fontWeight: 700, fontSize: '0.8rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                }}
              >
                {p.numero}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default PuertoMapModal
