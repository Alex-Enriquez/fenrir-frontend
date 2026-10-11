import { useState, useEffect } from 'react'
import axios from 'axios'
import { Lightbulb } from 'lucide-react'
import Modal from './Modal'
import OnboardingWizard from './OnboardingWizard'
import tips from '../data/tips'

const API_URL = 'http://127.0.0.1:8000/api'

function diasDesde(fechaStr) {
  if (!fechaStr) return Infinity
  const hoy = new Date()
  const fecha = new Date(fechaStr)
  return Math.floor((hoy - fecha) / (1000 * 60 * 60 * 24))
}

function Onboarding() {
  const [perfil, setPerfil] = useState(null)
  const [modo, setModo] = useState(null) // 'bienvenida' | 'tip' | null
  const [tipActual, setTipActual] = useState('')
  const [noMostrarMas, setNoMostrarMas] = useState(true)

  useEffect(() => {
    axios.get(`${API_URL}/perfil/`)
      .then(res => {
        const p = res.data
        setPerfil(p)
        if (!p.ha_visto_bienvenida) {
          setModo('bienvenida')
        } else if (p.mostrar_tips && diasDesde(p.fecha_ultimo_tip) >= 3) {
          setTipActual(tips[Math.floor(Math.random() * tips.length)])
          setModo('tip')
        }
      })
      .catch(err => console.error(err))
  }, [])

  const cerrarBienvenida = () => {
    axios.patch(`${API_URL}/perfil/`, { ha_visto_bienvenida: true }).catch(() => {})
    setModo(null)
  }

  const cerrarTip = () => {
    const hoy = new Date().toISOString().slice(0, 10)
    const payload = { fecha_ultimo_tip: hoy }
    if (noMostrarMas === false) payload.mostrar_tips = false
    axios.patch(`${API_URL}/perfil/`, payload).catch(() => {})
    setModo(null)
  }

  if (!perfil || !modo) return null

  if (modo === 'bienvenida') {
    return <OnboardingWizard onTerminar={cerrarBienvenida} />
  }

  if (modo === 'tip') {
    return (
      <Modal isOpen={true} onClose={cerrarTip} title="">
        <div style={{ textAlign: 'center', padding: '0.5rem 0 1rem' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px', margin: '0 auto 1rem',
            backgroundColor: 'rgba(248,194,46,0.12)', color: '#F8C22E',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Lightbulb size={26} />
          </div>
          <h2 style={{ color: 'var(--texto-fuerte)', margin: '0 0 0.5rem' }}>Tip del día</h2>
          <p style={{ color: 'var(--texto-suave)', fontSize: '0.92rem', lineHeight: 1.5, margin: '0 0 1.5rem' }}>
            {tipActual}
          </p>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--texto-2)', fontSize: '0.85rem', marginBottom: '1.25rem', cursor: 'pointer' }}>
            <input type="checkbox" onChange={(e) => setNoMostrarMas(e.target.checked ? false : true)} />
            No volver a mostrar tips
          </label>
          <button
            onClick={cerrarTip}
            style={{
              backgroundColor: '#F8C22E', color: '#0F1420', border: 'none',
              padding: '0.65rem 1.75rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.95rem',
            }}
          >
            Entendido
          </button>
        </div>
      </Modal>
    )
  }

  return null
}

export default Onboarding
