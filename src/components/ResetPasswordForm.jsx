import { useState } from 'react'
import axios from 'axios'
import { Copy, Check, Save } from 'lucide-react'

const API_URL = 'http://127.0.0.1:8000/api'
const NOMBRE_CATEGORIA_USUARIOS = 'Usuarios del sistema'

function ResetPasswordForm({ usuario, onSubmit, onCancel }) {
  const [modo, setModo] = useState('auto')
  const [passwordManual, setPasswordManual] = useState('')
  const [resultado, setResultado] = useState(null)
  const [copiado, setCopiado] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)
  const [errorGuardar, setErrorGuardar] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(modo === 'manual' ? passwordManual : null, modo, (nuevaPassword) => {
      setResultado(nuevaPassword)
    })
  }

  const copiar = () => {
    navigator.clipboard.writeText(resultado)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  const guardarEnBoveda = async () => {
    setGuardando(true)
    setErrorGuardar('')
    try {
      const categorias = await axios.get(`${API_URL}/categorias-contrasena/`)
      let categoria = categorias.data.find(c => c.nombre === NOMBRE_CATEGORIA_USUARIOS)
      if (!categoria) {
        const nueva = await axios.post(`${API_URL}/categorias-contrasena/`, { nombre: NOMBRE_CATEGORIA_USUARIOS })
        categoria = nueva.data
      }

      const hoy = new Date().toLocaleDateString('es-MX')
      await axios.post(`${API_URL}/registros-contrasena/`, {
        categoria: categoria.id,
        plataforma: usuario.username,
        usuario: usuario.username,
        correo: usuario.email || '',
        contrasena: resultado,
        notas: `Generada el ${hoy} al restablecer desde Usuarios del sistema.`,
      })

      setGuardado(true)
    } catch (err) {
      setErrorGuardar('No se pudo guardar en Contraseñas.')
      console.error(err)
    } finally {
      setGuardando(false)
    }
  }

  if (resultado) {
    return (
      <div>
        <p style={{ color: 'var(--texto-tenue)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
          Nueva contraseña para <strong style={{ color: 'var(--texto-fuerte)' }}>{usuario.username}</strong>:
        </p>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          backgroundColor: 'var(--campo-bg)', border: '1px solid var(--campo-borde)', borderRadius: '8px',
          padding: '0.75rem 1rem', marginBottom: '1rem',
        }}>
          <code style={{ flex: 1, color: 'var(--exito-texto)', fontSize: '1rem' }}>{resultado}</code>
          <button onClick={copiar} style={{ background: 'none', border: 'none', color: 'var(--texto-4)', display: 'flex' }}>
            {copiado ? <Check size={18} color="#4ADE80" /> : <Copy size={18} />}
          </button>
        </div>
        <p style={{ color: 'var(--texto-5)', fontSize: '0.8rem', marginBottom: '1rem' }}>
          Compártela directamente con el usuario — no queda guardada en ningún otro lugar del sistema, a menos que la guardes tú mismo abajo.
        </p>

        <button
          onClick={guardarEnBoveda}
          disabled={guardando || guardado}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            backgroundColor: guardado ? 'rgba(74,222,128,0.12)' : 'transparent',
            border: guardado ? '1px solid rgba(74,222,128,0.4)' : '1px solid var(--campo-borde)',
            color: guardado ? 'var(--exito-texto)' : 'var(--texto-2)',
            padding: '0.6rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem',
          }}
        >
          {guardado ? <><Check size={15} /> Guardada en Contraseñas</> : <><Save size={15} /> {guardando ? 'Guardando...' : 'Guardar en Contraseñas'}</>}
        </button>
        {errorGuardar && <p style={{ color: 'var(--peligro-texto)', fontSize: '0.8rem', marginTop: '-0.5rem', marginBottom: '1rem' }}>{errorGuardar}</p>}

        <button onClick={onCancel} style={{
          width: '100%', backgroundColor: 'var(--accion)', color: 'var(--sobre-accion)', border: 'none',
          padding: '0.65rem', borderRadius: '6px', fontWeight: 'bold',
        }}>
          Cerrar
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <p style={{ color: 'var(--texto-tenue)', fontSize: '0.9rem', marginBottom: '1rem' }}>
        Restablecer contraseña de <strong style={{ color: 'var(--texto-fuerte)' }}>{usuario.username}</strong>
      </p>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <label style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
          padding: '0.6rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.88rem',
          border: modo === 'auto' ? '1px solid var(--acento)' : '1px solid var(--campo-borde)',
          color: modo === 'auto' ? 'var(--acento-texto)' : 'var(--texto-2)',
        }}>
          <input type="radio" checked={modo === 'auto'} onChange={() => setModo('auto')} style={{ display: 'none' }} />
          Generar automática
        </label>
        <label style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
          padding: '0.6rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.88rem',
          border: modo === 'manual' ? '1px solid var(--acento)' : '1px solid var(--campo-borde)',
          color: modo === 'manual' ? 'var(--acento-texto)' : 'var(--texto-2)',
        }}>
          <input type="radio" checked={modo === 'manual'} onChange={() => setModo('manual')} style={{ display: 'none' }} />
          Escribir manual
        </label>
      </div>

      {modo === 'manual' && (
        <input
          value={passwordManual}
          onChange={(e) => setPasswordManual(e.target.value)}
          required
          placeholder="Nueva contraseña"
          style={{
            width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px',
            border: '1px solid var(--campo-borde)', backgroundColor: 'var(--campo-bg)',
            color: 'var(--texto-claro)', marginBottom: '1rem', fontSize: '0.95rem', boxSizing: 'border-box',
          }}
        />
      )}

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button type="submit" style={{
          backgroundColor: 'var(--accion)', color: 'var(--sobre-accion)', border: 'none',
          padding: '0.65rem 1.25rem', borderRadius: '6px', fontWeight: 'bold', flex: 1,
        }}>
          Restablecer
        </button>
        <button type="button" onClick={onCancel} style={{
          backgroundColor: 'var(--cancel-bg)', color: 'var(--cancel-texto)', border: '1px solid var(--cancel-borde)',
          padding: '0.65rem 1.25rem', borderRadius: '6px', flex: 1,
        }}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default ResetPasswordForm
