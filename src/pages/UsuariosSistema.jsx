import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, KeyRound, ShieldCheck, User, Pencil, Trash2 } from '../ui/icons'
import Modal from '../components/Modal'
import AccesoDenegado from '../components/AccesoDenegado'
import UsuarioForm from '../components/UsuarioForm'
import ResetPasswordForm from '../components/ResetPasswordForm'
import ConfirmDialog from '../components/ConfirmDialog'
import Toast from '../components/Toast'
import { API_URL } from '../config'
import { mensajeServidor } from '../ui/mensajes'

// Clave de cada aviso (antes Date.now(), que el análisis de código marca como impuro en cuanto se usa desde otro botón)
let contadorAvisos = 0

function UsuariosSistema() {
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)

  const [modalForm, setModalForm] = useState(false)
  const [usuarioEditando, setUsuarioEditando] = useState(null)
  const [usuarioReset, setUsuarioReset] = useState(null)
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null)

  const mostrarToast = (mensaje, tipo = 'error') => setToast({ mensaje, tipo, key: ++contadorAvisos })

  const cargarDatos = () => {
    setCargando(true)
    axios.get(`${API_URL}/usuarios-sistema/`)
      .then(res => { setUsuarios(res.data); setCargando(false) })
      .catch(err => {
        if (err.response?.status === 403) {
          setError('No tienes permisos de administrador para ver esta sección.')
        } else {
          setError('No se pudo cargar la lista de usuarios.')
        }
        setCargando(false)
      })
  }

  useEffect(() => { cargarDatos() }, [])

  const abrirCrear = () => { setUsuarioEditando(null); setModalForm(true) }
  const abrirEditar = (u) => { setUsuarioEditando(u); setModalForm(true) }
  const cerrarForm = () => { setModalForm(false); setUsuarioEditando(null) }

  const handleGuardar = (form) => {
    const peticion = usuarioEditando
      ? axios.patch(`${API_URL}/usuarios-sistema/${usuarioEditando.id}/`, form)
      : axios.post(`${API_URL}/usuarios-sistema/`, form)

    peticion
      .then(() => {
        cerrarForm()
        cargarDatos()
        mostrarToast(usuarioEditando ? 'Usuario actualizado.' : 'Usuario creado correctamente.', 'exito')
      })
      .catch(err => {
        const msg = mensajeServidor(err, 'No se pudo guardar el usuario.')
        mostrarToast(msg)
      })
  }

  const handleResetPassword = (passwordManual, modo, callback) => {
    axios.post(`${API_URL}/usuarios-sistema/${usuarioReset.id}/reset_password/`, {
      modo,
      password: passwordManual,
    })
      .then(res => callback(res.data.password))
      .catch(err => mostrarToast(mensajeServidor(err, 'No se pudo restablecer la contraseña.')))
  }

  const aprobarUsuario = (u) => {
    axios.patch(`${API_URL}/usuarios-sistema/${u.id}/`, { is_active: true })
      .then(() => { cargarDatos(); mostrarToast(`${u.username} ya puede entrar.`, 'exito') })
      .catch(err => mostrarToast(mensajeServidor(err, 'No se pudo aprobar la cuenta.')))
  }

  const confirmarEliminar = () => {
    if (!usuarioAEliminar) return
    axios.delete(`${API_URL}/usuarios-sistema/${usuarioAEliminar.id}/`)
      .then(() => { setUsuarioAEliminar(null); cargarDatos(); mostrarToast('Usuario eliminado.', 'exito') })
      .catch(err => { setUsuarioAEliminar(null); mostrarToast(mensajeServidor(err, 'No se pudo eliminar el usuario.')) })
  }

  if (cargando) return <p>Cargando...</p>
  if (error) return <AccesoDenegado mensaje={error} />

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h1 style={{ color: 'var(--acento-texto)', margin: 0 }}>Usuarios del sistema</h1>
        <button
          onClick={abrirCrear}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            backgroundColor: 'var(--accion)', color: 'var(--sobre-accion)', border: 'none',
            padding: '0.6rem 1.1rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.95rem',
          }}
        >
          <Plus size={18} /> Nuevo usuario
        </button>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estatus</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(u => (
              <tr key={u.id}>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    <User size={14} color="#8892AB" /> {u.username}
                  </span>
                </td>
                <td>{u.email || '—'}</td>
                <td>
                  {u.is_staff ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--acento-texto)', fontSize: '0.82rem', fontWeight: 600 }}>
                      <ShieldCheck size={14} /> Administrador
                    </span>
                  ) : (
                    <span style={{ color: 'var(--texto-tenue)', fontSize: '0.82rem' }}>Usuario estándar</span>
                  )}
                </td>
                <td>
                  <span style={{
                    backgroundColor: u.is_active ? 'var(--exito-bg)' : 'var(--peligro-bg-2)',
                    color: u.is_active ? 'var(--exito-texto)' : 'var(--peligro-texto)',
                    padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600,
                  }}>
                    {u.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    {!u.is_active && (
                      <button
                        onClick={() => aprobarUsuario(u)}
                        title="Aprobar"
                        style={{ background: 'var(--exito-bg)', border: 'none', borderRadius: '6px', padding: '0.4rem 0.75rem', color: 'var(--exito-texto)', fontWeight: 600, fontSize: '0.82rem', display: 'flex' }}
                      >
                        Aprobar
                      </button>
                    )}
                    <button
                      onClick={() => setUsuarioReset(u)}
                      title="Restablecer contraseña"
                      style={{ background: 'var(--edit-bg)', border: 'none', borderRadius: '6px', padding: '0.4rem', color: 'var(--edit-texto)', display: 'flex' }}
                    >
                      <KeyRound size={16} />
                    </button>
                    <button
                      onClick={() => abrirEditar(u)}
                      title="Editar"
                      style={{ background: 'var(--info-bg)', border: 'none', borderRadius: '6px', padding: '0.4rem', color: 'var(--info-texto)', display: 'flex' }}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => setUsuarioAEliminar(u)}
                      title="Eliminar"
                      style={{ background: 'var(--peligro-bg)', border: 'none', borderRadius: '6px', padding: '0.4rem', color: 'var(--peligro-texto)', display: 'flex' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalForm} onClose={cerrarForm} title={usuarioEditando ? 'Editar usuario' : 'Nuevo usuario'}>
        <UsuarioForm usuarioInicial={usuarioEditando} onSubmit={handleGuardar} onCancel={cerrarForm} />
      </Modal>

      <Modal isOpen={!!usuarioReset} onClose={() => setUsuarioReset(null)} title="Restablecer contraseña">
        {usuarioReset && (
          <ResetPasswordForm usuario={usuarioReset} onSubmit={handleResetPassword} onCancel={() => setUsuarioReset(null)} />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!usuarioAEliminar}
        title="¿Eliminar este usuario?"
        message={usuarioAEliminar ? `Se eliminará la cuenta "${usuarioAEliminar.username}". Esta acción no se puede deshacer.` : ''}
        onConfirm={confirmarEliminar}
        onCancel={() => setUsuarioAEliminar(null)}
      />

      <Toast key={toast?.key} mensaje={toast?.mensaje} tipo={toast?.tipo} onClose={() => setToast(null)} />
    </div>
  )
}

export default UsuariosSistema
