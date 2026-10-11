const COLORES_ESTADO = {
  operativo: { bg: 'rgba(96,165,250,0.15)', border: '#60A5FA', color: 'var(--info-texto)' },
  mantenimiento: { bg: 'rgba(248,194,46,0.15)', border: 'var(--acento)', color: 'var(--acento-texto)' },
  fuera_de_linea: { bg: 'rgba(248,113,113,0.15)', border: '#F87171', color: 'var(--peligro-texto)' },
}

const ALTURA_FILA = 22

function construirFilas(rack, dispositivos) {
  const filas = []
  let u = rack.altura_u
  while (u >= 1) {
    const dispositivo = dispositivos.find(d => d.posicion_u && u >= d.posicion_u && u <= d.posicion_u + d.altura_u - 1)
    if (dispositivo && u === dispositivo.posicion_u + dispositivo.altura_u - 1) {
      filas.push({ tipo: 'dispositivo', dispositivo })
      u -= dispositivo.altura_u
    } else if (dispositivo) {
      u -= 1
    } else {
      filas.push({ tipo: 'vacio', u })
      u -= 1
    }
  }
  return filas
}

function RackDiagram({ rack, dispositivos }) {
  const filas = construirFilas(rack, dispositivos)

  return (
    <div>
      <div style={{ marginBottom: '0.75rem', color: 'var(--texto-tenue)', fontSize: '0.85rem' }}>
        {rack.ubicacion} · {rack.altura_u}U
      </div>
      <div style={{
        border: '2px solid var(--campo-borde)', borderRadius: '6px', overflow: 'hidden',
        backgroundColor: 'var(--fondo-oscuro)',
      }}>
        {filas.map((fila, i) => {
          if (fila.tipo === 'vacio') {
            return (
              <div key={i} style={{
                height: `${ALTURA_FILA}px`, borderBottom: '1px dashed var(--borde-suave)',
                display: 'flex', alignItems: 'center', paddingLeft: '0.5rem',
                fontSize: '0.65rem', color: 'var(--texto-7)',
              }}>
                U{fila.u}
              </div>
            )
          }
          const d = fila.dispositivo
          const c = COLORES_ESTADO[d.estado] || COLORES_ESTADO.operativo
          return (
            <div key={i} style={{
              height: `${ALTURA_FILA * d.altura_u}px`, backgroundColor: c.bg,
              borderBottom: '1px solid var(--campo-borde)', borderLeft: `3px solid ${c.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 0.75rem',
            }}>
              <span style={{ color: 'var(--texto-fuerte)', fontSize: '0.82rem', fontWeight: 600 }}>{d.nombre}</span>
              <span style={{ color: c.color, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>{d.tipo}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default RackDiagram
