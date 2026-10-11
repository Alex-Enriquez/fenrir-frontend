import { useState, useEffect } from 'react'

const inputStyle = {
  width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px',
  border: '1px solid var(--campo-borde)', backgroundColor: 'var(--campo-bg)',
  color: 'var(--texto-claro)', marginBottom: '1rem', fontSize: '0.95rem', boxSizing: 'border-box',
}
const labelStyle = { display: 'block', marginBottom: '0.35rem', color: 'var(--texto-2)', fontSize: '0.85rem' }
const checkStyle = { display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--texto-2)', fontSize: '0.88rem', marginBottom: '0.75rem', cursor: 'pointer' }

function UsuarioForm({ usuarioInicial, onSubmit, onCancel }) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isStaff, setIsStaff] = useState(false)
  const [isActive, setIsActive] = useState(true)

  const esEdicion = !!usuarioInicial

  useEffect(() => {
    if (usuarioInicial) {
      setUsername(usuarioInicial.username || '')
      setEmail(usuarioInicial.email || '')
      setIsStaff(usuarioInicial.is_staff || false)
      setIsActive(usuarioInicial.is_active ?? true)
      setPassword('')
    } else {
      setUsername(''); setEmail(''); setPassword(''); setIsStaff(false); setIsActive(true)
    }
  }, [usuarioInicial])

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = { username, email, is_staff: isStaff, is_active: isActive }
    if (password) payload.password = password
    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit}>
      <label style={labelStyle}>Usuario</label>
      <input value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus style={inputStyle} disabled={esEdicion} />

      <label style={labelStyle}>Correo</label>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />

      <label style={labelStyle}>
        {esEdicion ? 'Nueva contraseña (déjalo vacío para no cambiarla)' : 'Contraseña inicial'}
      </label>
      <input
        type="text"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required={!esEdicion}
        style={inputStyle}
        placeholder={esEdicion ? '••••••••' : 'Se la compartes tú directamente'}
      />

      <label style={checkStyle}>
        <input type="checkbox" checked={isStaff} onChange={(e) => setIsStaff(e.target.checked)} />
        Es administrador (acceso total, incluido este panel)
      </label>

      <label style={{ ...checkStyle, marginBottom: '1.25rem' }}>
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        Usuario activo (desmarcar para dar de baja / bloquear acceso)
      </label>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button type="submit" style={{
          backgroundColor: 'var(--accion)', color: 'var(--sobre-accion)', border: 'none',
          padding: '0.65rem 1.25rem', borderRadius: '6px', fontWeight: 'bold', flex: 1,
        }}>
          {esEdicion ? 'Guardar cambios' : 'Crear usuario'}
        </button>
        <button type="button" onClick={onCancel} style={{
          backgroundColor: 'transparent', color: 'var(--sec-texto)', border: '1px solid var(--sec-borde)',
          padding: '0.65rem 1.25rem', borderRadius: '6px', flex: 1,
        }}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default UsuarioForm
