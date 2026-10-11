import { useState } from 'react'

const inputStyle = {
  width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px',
  border: '1px solid var(--campo-borde)', backgroundColor: 'var(--campo-bg)',
  color: 'var(--texto-claro)', marginBottom: '1rem', fontSize: '0.95rem', boxSizing: 'border-box',
}
const labelStyle = { display: 'block', marginBottom: '0.35rem', color: 'var(--texto-2)', fontSize: '0.85rem' }
const rowStyle = { display: 'flex', gap: '0.75rem' }

function MiPerfilForm({ perfil, onSubmit, onCancel }) {
  const [nombreCompleto, setNombreCompleto] = useState(perfil?.nombre_completo || '')
  const [nuevaPassword, setNuevaPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (nuevaPassword && nuevaPassword !== confirmarPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    const payload = { nombre_completo: nombreCompleto }
    if (nuevaPassword) payload.nueva_password = nuevaPassword

    setGuardando(true)
    Promise.resolve(onSubmit(payload)).finally(() => setGuardando(false))
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <span style={{ color: 'var(--texto-tenue)', fontSize: '0.85rem' }}>{perfil?.email || perfil?.username}</span>
        <span style={{
          backgroundColor: perfil?.is_staff ? 'rgba(248,194,46,0.12)' : 'rgba(96,165,250,0.12)',
          color: perfil?.is_staff ? 'var(--acento-texto)' : 'var(--info-texto)',
          padding: '0.15rem 0.55rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600,
        }}>
          {perfil?.is_staff ? 'Administrador' : 'Analista'}
        </span>
      </div>

      {error && (
        <div style={{
          backgroundColor: 'var(--peligro-bg-2)', color: 'var(--peligro-texto)', padding: '0.5rem 0.7rem',
          borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem',
        }}>
          {error}
        </div>
      )}

      <label style={labelStyle}>Nombre para mostrar</label>
      <input value={nombreCompleto} onChange={(e) => setNombreCompleto(e.target.value)} required style={inputStyle} />

      <div style={rowStyle}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Nueva contraseña (opcional)</label>
          <input type="password" value={nuevaPassword} onChange={(e) => setNuevaPassword(e.target.value)} style={inputStyle} placeholder="Dejar vacío para no cambiar" />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Confirmar contraseña</label>
          <input type="password" value={confirmarPassword} onChange={(e) => setConfirmarPassword(e.target.value)} style={inputStyle} placeholder="Repite la contraseña" />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
        <button
          type="submit"
          disabled={guardando}
          style={{
            backgroundColor: 'var(--accion)', color: 'var(--sobre-accion)', border: 'none',
            padding: '0.65rem 1.25rem', borderRadius: '6px', fontWeight: 'bold', flex: 1,
            opacity: guardando ? 0.6 : 1,
          }}
        >
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </button>
        <button type="button" onClick={onCancel} disabled={guardando} style={{
          backgroundColor: 'transparent', color: 'var(--sec-texto)', border: '1px solid var(--sec-borde)',
          padding: '0.65rem 1.25rem', borderRadius: '6px', flex: 1,
        }}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default MiPerfilForm
