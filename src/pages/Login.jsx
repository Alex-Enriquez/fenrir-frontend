import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import './Login.css'

const API_URL = 'http://127.0.0.1:8000/api'

function IconoSol() {
  return (
    <svg className="icon-sun" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.7" /><path d="M12 2.5v2.6M12 18.9v2.6M4.2 4.2l1.9 1.9M17.9 17.9l1.9 1.9M2.5 12h2.6M18.9 12h2.6M4.2 19.8l1.9-1.9M17.9 6.1l1.9-1.9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
  )
}
function IconoLuna() {
  return (
    <svg className="icon-moon" viewBox="0 0 24 24" fill="none"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg>
  )
}
function IconoOjoAbierto() {
  return <svg className="eye-open" viewBox="0 0 24 24" fill="none"><path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" /></svg>
}
function IconoOjoCerrado() {
  return <svg className="eye-closed" viewBox="0 0 24 24" fill="none"><path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /><path d="M10.6 5.2C11 5.1 11.5 5 12 5c7 0 10.5 7 10.5 7-.5.9-1.5 2.4-3 3.7M6.6 6.6C4 8.3 1.5 12 1.5 12s3.5 7 10.5 7c1.2 0 2.3-.2 3.3-.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function IconoCheck() {
  return <path d="M5 12.5 9.5 17 19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
}
function EmblemaEscudo() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M12 2 20 6v6c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6l8-4Z" stroke="#F8C22E" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke="#F8C22E" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [theme, setTheme] = useState(() => localStorage.getItem('fenrir-theme') || 'light')
  const [pane, setPane] = useState('login')
  const [transicion, setTransicion] = useState('entered')

  const [loginCorreo, setLoginCorreo] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [verLoginPassword, setVerLoginPassword] = useState(false)
  const [loginCargando, setLoginCargando] = useState(false)

  const [regNombre, setRegNombre] = useState('')
  const [regCorreo, setRegCorreo] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [verRegPassword, setVerRegPassword] = useState(false)
  const [regTocado, setRegTocado] = useState({ nombre: false, correo: false })
  const [regCargando, setRegCargando] = useState(false)

  const [toast, setToast] = useState(null)

  useEffect(() => {
    localStorage.setItem('fenrir-theme', theme)
  }, [theme])

  const mostrarToast = (mensaje, tipo = 'exito') => {
    setToast({ mensaje, tipo })
    setTimeout(() => setToast(null), 3500)
  }

  const cambiarPane = (destino) => {
    setTransicion('leaving')
    setTimeout(() => {
      setPane(destino)
      setTransicion('entering')
      requestAnimationFrame(() => setTransicion('entered'))
    }, 260)
  }

  const nombreValido = /^[A-Za-zÀ-ÖØ-öø-ÿ]+( [A-Za-zÀ-ÖØ-öø-ÿ]+)+$/.test(regNombre.trim())
  const correoValido = /^[^\s@]+@alam\.mx$/i.test(regCorreo.trim())
  const passLen = regPassword.length >= 8
  const passUpper = /[A-Z]/.test(regPassword)
  const passNum = /[0-9]/.test(regPassword)
  const registroValido = nombreValido && correoValido && passLen && passUpper && passNum

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginCargando(true)
    try {
      await login(loginCorreo, loginPassword)
      navigate('/')
    } catch (err) {
      mostrarToast(err.response?.data?.error || 'Usuario o contraseña incorrectos.', 'error')
    } finally {
      setLoginCargando(false)
    }
  }

  const handleRegistro = async (e) => {
    e.preventDefault()
    if (!registroValido) return
    setRegCargando(true)
    try {
      await axios.post(`${API_URL}/auth/registro/`, {
        nombre_completo: regNombre.trim(),
        correo: regCorreo.trim(),
        password: regPassword,
      })
      mostrarToast('Cuenta creada. Ya puedes iniciar sesión.', 'exito')
      setLoginCorreo(regCorreo.trim())
      setRegNombre(''); setRegCorreo(''); setRegPassword('')
      cambiarPane('login')
    } catch (err) {
      mostrarToast(err.response?.data?.error || 'No se pudo crear la cuenta.', 'error')
    } finally {
      setRegCargando(false)
    }
  }

  return (
    <div className="login-page-root" data-theme={theme}>
      <div className="scene">

        <div className="panel-form">
          <button
            type="button"
            className="theme-toggle"
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            aria-label="Cambiar tema"
          >
            <IconoSol />
            <IconoLuna />
          </button>

          <div className="form-shell">
            <div className="mark">
              <div className="mark-badge"><EmblemaEscudo /></div>
              <div className="mark-word">FENRIR<span>·TI</span></div>
            </div>

            <div className="stage">
              {pane === 'login' ? (
                <form className={`pane ${transicion}`} onSubmit={handleLogin}>
                  <div>
                    <h1 className="headline">Bienvenido de nuevo</h1>
                    <p className="sub">Ingresa con tu cuenta de Alamex para continuar.</p>
                  </div>

                  <div className="field">
                    <label htmlFor="login-correo">Correo corporativo</label>
                    <div className="input-wrap">
                      <input
                        id="login-correo" type="text" placeholder="nombre@alam.mx"
                        value={loginCorreo} onChange={(e) => setLoginCorreo(e.target.value)}
                        autoComplete="username" required
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="login-pass">Contraseña</label>
                    <div className="input-wrap with-icon">
                      <input
                        id="login-pass" type={verLoginPassword ? 'text' : 'password'} placeholder="Tu contraseña"
                        value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                        autoComplete="current-password" required
                      />
                      <button type="button" className={`eye-btn${verLoginPassword ? ' is-visible' : ''}`} onClick={() => setVerLoginPassword(v => !v)} aria-label="Mostrar contraseña">
                        <IconoOjoAbierto /><IconoOjoCerrado />
                      </button>
                    </div>
                  </div>

                  <div className="row-between">
                    <label className="checkbox-row"><input type="checkbox" />Recordarme</label>
                    <a href="#" className="link">¿Olvidaste tu contraseña?</a>
                  </div>

                  <button type="submit" className="submit-btn" disabled={loginCargando}>
                    {loginCargando ? 'Ingresando...' : 'Ingresar'}
                  </button>
                </form>
              ) : (
                <form className={`pane ${transicion}`} onSubmit={handleRegistro}>
                  <div>
                    <h1 className="headline">Crea tu cuenta</h1>
                    <p className="sub">Usa tu correo de Alamex para darte de alta en Fenrir.</p>
                  </div>

                  <div className="field">
                    <label htmlFor="reg-name">Nombre completo</label>
                    <div className="input-wrap with-icon">
                      <input
                        id="reg-name" type="text" placeholder="Nombre y apellido"
                        value={regNombre}
                        onChange={(e) => setRegNombre(e.target.value)}
                        onBlur={() => setRegTocado(t => ({ ...t, nombre: true }))}
                        className={regTocado.nombre ? (nombreValido ? 'has-success' : 'has-error') : ''}
                        autoComplete="name"
                      />
                      <svg className={`status-icon ${regTocado.nombre ? 'show' : ''} ${nombreValido ? 'ok' : 'bad'}`} viewBox="0 0 24 24" fill="none">
                        {nombreValido ? <IconoCheck /> : <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />}
                      </svg>
                    </div>
                    {regTocado.nombre && !nombreValido && <div className="field-note error">Escribe nombre y apellido, solo letras</div>}
                  </div>

                  <div className="field">
                    <label htmlFor="reg-email">Correo corporativo</label>
                    <div className="input-wrap with-icon">
                      <input
                        id="reg-email" type="email" placeholder="nombre@alam.mx"
                        value={regCorreo}
                        onChange={(e) => setRegCorreo(e.target.value)}
                        onBlur={() => setRegTocado(t => ({ ...t, correo: true }))}
                        className={regTocado.correo ? (correoValido ? 'has-success' : 'has-error') : ''}
                        autoComplete="email"
                      />
                      <svg className={`status-icon ${regTocado.correo ? 'show' : ''} ${correoValido ? 'ok' : 'bad'}`} viewBox="0 0 24 24" fill="none">
                        {correoValido ? <IconoCheck /> : <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />}
                      </svg>
                    </div>
                    {regTocado.correo && !correoValido && <div className="field-note error">Debe ser un correo @alam.mx</div>}
                  </div>

                  <div className="field">
                    <label htmlFor="reg-pass">Contraseña</label>
                    <div className="input-wrap with-icon">
                      <input
                        id="reg-pass" type={verRegPassword ? 'text' : 'password'} placeholder="Crea una contraseña"
                        value={regPassword} onChange={(e) => setRegPassword(e.target.value)}
                        autoComplete="new-password"
                      />
                      <button type="button" className={`eye-btn${verRegPassword ? ' is-visible' : ''}`} onClick={() => setVerRegPassword(v => !v)} aria-label="Mostrar contraseña">
                        <IconoOjoAbierto /><IconoOjoCerrado />
                      </button>
                    </div>
                    <ul className="checklist">
                      <li className={passLen ? 'met' : ''}><svg viewBox="0 0 24 24" fill="none"><IconoCheck /></svg>8 caracteres o más</li>
                      <li className={passUpper ? 'met' : ''}><svg viewBox="0 0 24 24" fill="none"><IconoCheck /></svg>Una letra mayúscula</li>
                      <li className={passNum ? 'met' : ''}><svg viewBox="0 0 24 24" fill="none"><IconoCheck /></svg>Un número</li>
                    </ul>
                  </div>

                  <button type="submit" className="submit-btn" disabled={!registroValido || regCargando}>
                    {regCargando ? 'Creando cuenta...' : 'Crear cuenta'}
                  </button>
                </form>
              )}
            </div>

            {pane === 'login' ? (
              <p className="foot-switch">¿Aún no tienes cuenta?<button type="button" onClick={() => cambiarPane('register')}>Crear una</button></p>
            ) : (
              <p className="foot-switch">¿Ya tienes cuenta?<button type="button" onClick={() => cambiarPane('login')}>Inicia sesión</button></p>
            )}
          </div>
        </div>

        <div className="panel-brand">
          <div className="glow g1" />
          <div className="glow g2" />
          <div className="brand-content">
            <div className="lockup">
              <div className="emblem-stage">
                <div className="emblem"><EmblemaEscudo /></div>
              </div>
              <h2 className="brand-title">FENRIR<span>·TI</span></h2>
            </div>
            <p className="brand-caption">Sistema de inventario de TI · Alamex</p>
          </div>
        </div>
      </div>

      {toast && (
        <div className={`login-toast show${toast.tipo === 'error' ? ' error' : ''}`}>
          {toast.mensaje}
        </div>
      )}
    </div>
  )
}

export default Login
