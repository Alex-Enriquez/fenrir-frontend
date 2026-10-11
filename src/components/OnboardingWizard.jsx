import { useState } from 'react'
import { LayoutDashboard, Monitor, Lock, FileText, PartyPopper, X } from 'lucide-react'

const PASOS = [
  {
    icon: PartyPopper,
    color: 'var(--acento-texto)',
    titulo: 'Bienvenido a Fenrir',
    subtitulo: 'Alamex · TI',
    bullets: [
      'Control total de equipos, licencias y personal en un solo lugar',
      'Historial completo de asignaciones y mantenimientos',
      'Todo cifrado y respaldado de forma segura',
    ],
  },
  {
    icon: LayoutDashboard,
    color: 'var(--info-texto)',
    titulo: 'Dashboard y métricas',
    subtitulo: 'Todo de un vistazo',
    bullets: [
      'Gráficas en tiempo real por estado y categoría de equipo',
      'Resumen de disponibles, asignados y en reparación',
      'Actualizado siempre con datos reales del inventario',
    ],
  },
  {
    icon: Monitor,
    color: 'var(--exito-texto)',
    titulo: 'Equipos y Licencias',
    subtitulo: 'Activos de la empresa',
    bullets: [
      'Da de alta equipos y periféricos con categorías propias',
      'Asigna, reasigna y libera equipos con un clic',
      'Distribuye licencias por área arrastrando y soltando',
    ],
  },
  {
    icon: Lock,
    color: '#EAB308',
    titulo: 'Contraseñas y seguridad',
    subtitulo: 'Bóveda cifrada',
    bullets: [
      'Guarda credenciales de TI cifradas de verdad',
      'Genera contraseñas seguras automáticamente',
      'Restablece accesos de usuarios cuando lo necesiten',
    ],
  },
  {
    icon: FileText,
    color: 'var(--naranja-texto)',
    titulo: 'Documentación',
    subtitulo: 'Responsivas y mantenimientos',
    bullets: [
      'Genera responsivas en PDF con un clic',
      'Lleva el historial de mantenimientos por equipo',
      'Exporta o importa datos desde Excel',
    ],
  },
]

function OnboardingWizard({ onTerminar }) {
  const [paso, setPaso] = useState(0)
  const actual = PASOS[paso]
  const Icon = actual.icon
  const esUltimo = paso === PASOS.length - 1

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div className="modal-content" style={{
        backgroundColor: 'rgba(var(--modal-rgb), 0.9)', backdropFilter: 'blur(16px)',
        borderRadius: '16px', padding: '1.75rem', width: '90%', maxWidth: '460px',
        border: '1px solid var(--campo-borde)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: actual.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {paso + 1} · {actual.titulo}
          </span>
          <button onClick={onTerminar} style={{ background: 'none', border: 'none', color: 'var(--texto-4)', display: 'flex', padding: 0 }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '1.5rem' }}>
          {PASOS.map((_, i) => (
            <div key={i} style={{
              flex: 1, height: '3px', borderRadius: '2px',
              backgroundColor: i <= paso ? actual.color : '#2C3450',
              transition: 'background-color 0.2s ease',
            }} />
          ))}
        </div>

        <div style={{
          width: '56px', height: '56px', borderRadius: '16px', margin: '0 auto 1.1rem',
          backgroundColor: `${actual.color}22`, color: actual.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={26} />
        </div>

        <h2 style={{ color: 'var(--texto-fuerte)', textAlign: 'center', margin: '0 0 0.2rem', fontSize: '1.2rem' }}>
          {actual.titulo}
        </h2>
        <p style={{ color: actual.color, textAlign: 'center', fontSize: '0.82rem', margin: '0 0 1.1rem', fontWeight: 600 }}>
          {actual.subtitulo}
        </p>

        <ul style={{ margin: '0 0 1.5rem', padding: 0, listStyle: 'none' }}>
          {actual.bullets.map((b, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--texto-suave)' }}>
              <span style={{ color: actual.color, marginTop: '0.15rem' }}>●</span> {b}
            </li>
          ))}
        </ul>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--borde)' }}>
          {paso > 0 ? (
            <button onClick={() => setPaso(p => p - 1)} style={{ background: 'none', border: 'none', color: 'var(--texto-tenue)', fontSize: '0.88rem' }}>
              ← Anterior
            </button>
          ) : (
            <button onClick={onTerminar} style={{ background: 'none', border: 'none', color: 'var(--texto-5)', fontSize: '0.85rem' }}>
              Saltar tutorial
            </button>
          )}
          <button
            onClick={() => esUltimo ? onTerminar() : setPaso(p => p + 1)}
            style={{
              backgroundColor: actual.color, color: '#0B0F1A', border: 'none',
              padding: '0.55rem 1.3rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.88rem',
            }}
          >
            {esUltimo ? 'Comenzar →' : 'Siguiente →'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default OnboardingWizard
