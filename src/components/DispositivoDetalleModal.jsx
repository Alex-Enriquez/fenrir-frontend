import { useState } from 'react'
import { Pencil, Server } from 'lucide-react'
import DispositivoRedForm from './DispositivoRedForm'
import PuertoMapModal from './PuertoMapModal'

const BADGE_ESTADO = {
  operativo: { bg: 'var(--info-bg-2)', color: 'var(--info-texto)' },
  mantenimiento: { bg: 'var(--aviso-bg)', color: 'var(--acento-texto)' },
  fuera_de_linea: { bg: 'var(--peligro-bg-2)', color: 'var(--peligro-texto)' },
}

const filaStyle = {
  display: 'flex', gap: '0.75rem', padding: '0.55rem 0',
  borderBottom: '1px solid var(--borde-suave)', fontSize: '0.85rem',
}
const labelFila = { color: 'var(--texto-tenue)', width: '110px', flexShrink: 0, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }
const valorFila = { color: 'var(--texto-claro)', flex: 1 }

function InfoRow({ label, valor }) {
  return (
    <div style={filaStyle}>
      <span style={labelFila}>{label}</span>
      <span style={valorFila}>{valor || '—'}</span>
    </div>
  )
}

function DispositivoDetalleModal({ dispositivo, racks, onGuardar, onCerrar }) {
  const [tab, setTab] = useState('info')
  const [editando, setEditando] = useState(false)

  const badge = BADGE_ESTADO[dispositivo.estado] || BADGE_ESTADO.operativo

  const handleGuardar = (form) => {
    return Promise.resolve(onGuardar(form)).then(() => setEditando(false))
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--borde)' }}>
        <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: 'rgba(96,165,250,0.12)', color: 'var(--info-texto)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Server size={22} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: 'var(--texto-fuerte)', fontSize: '1.05rem' }}>{dispositivo.nombre}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--texto-tenue)' }}>{dispositivo.marca} {dispositivo.modelo} · {dispositivo.rack_nombre || 'Sin rack'}</div>
        </div>
        {!editando && (
          <button onClick={() => setEditando(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(248,194,46,0.12)', border: '1px solid rgba(248,194,46,0.3)', borderRadius: '6px', color: 'var(--acento-texto)', padding: '0.4rem 0.7rem', fontSize: '0.8rem', fontWeight: 600 }}>
            <Pencil size={13} /> Editar
          </button>
        )}
      </div>

      {editando ? (
        <DispositivoRedForm racks={racks} dispositivoInicial={dispositivo} onSubmit={handleGuardar} onCancel={() => setEditando(false)} />
      ) : (
        <>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button onClick={() => setTab('info')} style={{ background: tab === 'info' ? 'rgba(248,194,46,0.12)' : 'transparent', color: tab === 'info' ? 'var(--acento-texto)' : 'var(--texto-tenue)', border: 'none', borderRadius: '6px', padding: '0.4rem 0.9rem', fontSize: '0.85rem', fontWeight: 600 }}>
              Información
            </button>
            {dispositivo.tipo === 'switch' && (
              <button onClick={() => setTab('puertos')} style={{ background: tab === 'puertos' ? 'rgba(248,194,46,0.12)' : 'transparent', color: tab === 'puertos' ? 'var(--acento-texto)' : 'var(--texto-tenue)', border: 'none', borderRadius: '6px', padding: '0.4rem 0.9rem', fontSize: '0.85rem', fontWeight: 600 }}>
                Puertos
              </button>
            )}
          </div>

          {tab === 'info' ? (
            <div>
              <InfoRow label="Estado" valor={
                <span style={{ backgroundColor: badge.bg, color: badge.color, padding: '0.15rem 0.55rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span className="led-dot" style={{ backgroundColor: badge.color, color: badge.color }} />
                  {dispositivo.estado === 'fuera_de_linea' ? 'Fuera de línea' : dispositivo.estado === 'mantenimiento' ? 'Mantenimiento' : 'Operativo'}
                </span>
              } />
              <InfoRow label="Tipo" valor={dispositivo.tipo?.replace('_', ' ')} />
              <InfoRow label="N° Serie" valor={dispositivo.numero_serie} />
              <InfoRow label="IP gestión" valor={dispositivo.ip_gestion} />
              <InfoRow label="Rack" valor={dispositivo.rack_nombre ? `${dispositivo.rack_nombre} (U${dispositivo.posicion_u}, ${dispositivo.altura_u}U)` : null} />
              <InfoRow label="Garantía" valor={dispositivo.garantia_hasta} />
              <InfoRow label="Notas" valor={dispositivo.notas} />
            </div>
          ) : (
            <PuertoMapModal dispositivo={dispositivo} />
          )}
        </>
      )}
    </div>
  )
}

export default DispositivoDetalleModal
