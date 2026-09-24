import { useState, useEffect } from 'react'
import { Eye, EyeOff, Wand2 } from 'lucide-react'

const inputStyle = {
  width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px',
  border: '1px solid #2C3450', backgroundColor: '#0F1420',
  color: '#E8EAF0', marginBottom: '1rem', fontSize: '0.95rem', boxSizing: 'border-box',
}
const labelStyle = { display: 'block', marginBottom: '0.35rem', color: '#9AA3B8', fontSize: '0.85rem' }

const initialState = { plataforma: '', empleado: '', usuario: '', correo: '', contrasena: '', notas: '' }

function generarPasswordAutomatica() {
  const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%'
  let resultado = ''
  for (let i = 0; i < 14; i++) {
    resultado += alfabeto.charAt(Math.floor(Math.random() * alfabeto.length))
  }
  return resultado
}

function ContrasenaForm({ empleados, registroInicial, onSubmit, onCancel }) {
  const [form, setForm] = useState(initialState)
  const [verPassword, setVerPassword] = useState(false)

  useEffect(() => {
    if (registroInicial) {
      setForm({ ...initialState, ...registroInicial })
    } else {
      setForm(initialState)
    }
  }, [registroInicial])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleGenerar = () => {
    setForm(prev => ({ ...prev, contrasena: generarPasswordAutomatica() }))
    setVerPassword(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit}>
      <label style={labelStyle}>Plataforma</label>
      <input name="plataforma" value={form.plataforma} onChange={handleChange} required style={inputStyle} placeholder="ej. Microsoft 365, Panel NAS" />

      <label style={labelStyle}>Usuario asignado (opcional)</label>
      <select name="empleado" value={form.empleado || ''} onChange={handleChange} style={inputStyle}>
        <option value="">-- Sin asignar --</option>
        {[...empleados].sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo)).map(emp => (
          <option key={emp.id} value={emp.id}>{emp.nombre_completo} ({emp.departamento_nombre})</option>
        ))}
      </select>

      <label style={labelStyle}>Usuario / Login</label>
      <input name="usuario" value={form.usuario || ''} onChange={handleChange} style={inputStyle} />

      <label style={labelStyle}>Correo</label>
      <input type="email" name="correo" value={form.correo || ''} onChange={handleChange} style={inputStyle} />

      <label style={labelStyle}>Contraseña</label>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type={verPassword ? 'text' : 'password'}
            name="contrasena"
            value={form.contrasena || ''}
            onChange={handleChange}
            required
            style={{ ...inputStyle, marginBottom: 0, paddingRight: '2.6rem' }}
          />
          <button
            type="button"
            onClick={() => setVerPassword(v => !v)}
            style={{
              position: 'absolute', right: '0.7rem', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', color: '#6B7690', display: 'flex', padding: 0,
            }}
          >
            {verPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
        <button
          type="button"
          onClick={handleGenerar}
          title="Generar contraseña segura"
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            background: 'rgba(248,194,46,0.12)', border: '1px solid rgba(248,194,46,0.3)',
            borderRadius: '6px', color: '#F8C22E', padding: '0 0.9rem', fontSize: '0.85rem', fontWeight: 600,
          }}
        >
          <Wand2 size={15} /> Generar
        </button>
      </div>

      <label style={labelStyle}>Notas</label>
      <textarea name="notas" value={form.notas || ''} onChange={handleChange} rows="2" style={inputStyle} />

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
        <button type="submit" style={{
          backgroundColor: '#F8C22E', color: '#0F1420', border: 'none',
          padding: '0.65rem 1.25rem', borderRadius: '6px', fontWeight: 'bold', flex: 1,
        }}>
          Guardar
        </button>
        <button type="button" onClick={onCancel} style={{
          backgroundColor: 'transparent', color: '#9AA3B8', border: '1px solid #2C3450',
          padding: '0.65rem 1.25rem', borderRadius: '6px', flex: 1,
        }}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default ContrasenaForm
