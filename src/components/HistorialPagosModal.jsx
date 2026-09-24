import { useState, useEffect } from 'react'
import axios from 'axios'
import { Receipt } from 'lucide-react'

const API_URL = 'http://127.0.0.1:8000/api'

function HistorialPagosModal({ servicio }) {
  const [pagos, setPagos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!servicio) return
    axios.get(`${API_URL}/servicios-contratados/${servicio.id}/pagos/`)
      .then(res => { setPagos(res.data); setCargando(false) })
      .catch(() => setCargando(false))
  }, [servicio])

  if (cargando) return <p>Cargando historial...</p>

  return (
    <div>
      {pagos.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#6B7690', padding: '1.5rem 0' }}>
          <Receipt size={24} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
          <p>Sin pagos registrados todavía.</p>
        </div>
      ) : (
        <table>
          <thead>
            <tr><th>Fecha</th><th>Monto</th></tr>
          </thead>
          <tbody>
            {pagos.map(p => (
              <tr key={p.id}>
                <td>{p.fecha}</td>
                <td>${p.monto}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default HistorialPagosModal
