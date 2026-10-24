import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { LogOut } from '../ui/icons'
import { grupos } from '../ui/navegacion'
import { useAuth } from '../context/AuthContext'
import Modal from './Modal'
import MiPerfilForm from './MiPerfilForm'
import { API_URL } from '../config'

function Sidebar({ abierta, onCerrar }) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [perfil, setPerfil] = useState(null)
  const [modalPerfilAbierto, setModalPerfilAbierto] = useState(false)

  const cargarPerfil = () => {
    axios.get(`${API_URL}/perfil/`)
      .then(res => setPerfil(res.data))
      .catch(err => console.error(err))
  }

  useEffect(() => { cargarPerfil() }, [])

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const cerrarSiMovil = () => {
    if (onCerrar) onCerrar()
  }

  const handleGuardarPerfil = (payload) => {
    return axios.patch(`${API_URL}/perfil/`, payload)
      .then(res => {
        setPerfil(res.data)
        setModalPerfilAbierto(false)
      })
      .catch(err => {
        alert('No se pudo guardar. Intenta de nuevo.')
        console.error(err)
      })
  }

  const nombreMostrado = perfil?.nombre_completo || 'Usuario'
  const puestoMostrado = perfil?.puesto || 'Alamex TI'
  const inicial = nombreMostrado.charAt(0).toUpperCase()

  const gruposVisibles = grupos.filter((g) => !g.admin || perfil?.is_staff)

  return (
    <>
      {abierta && <div className="fx-nav-velo" onClick={onCerrar} aria-hidden="true" />}
      <aside className={`fx-nav app-sidebar${abierta ? ' sidebar-abierta' : ''}`}>
        <div className="fx-nav-brand">
          <div className="fx-nav-wordmark">
            Alamex<span className="p">.</span><span className="ti">TI</span>
          </div>
          <div className="fx-nav-tag">Gestión de inventario</div>
        </div>

        <nav className="fx-nav-scroll" aria-label="Navegación principal">
          {gruposVisibles.map((g) => (
            <div key={g.titulo || 'inicio'}>
              {g.titulo && <div className="fx-nav-group">{g.titulo}</div>}
              {g.items.map(({ to, end, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={cerrarSiMovil}
                  className={({ isActive }) => `fx-nav-item${isActive ? ' activo' : ''}`}
                >
                  <Icon size={19} weight="duotone" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="fx-nav-foot">
          <button type="button" className="fx-nav-user" onClick={() => setModalPerfilAbierto(true)}>
            <div className="fx-avatar">{inicial}</div>
            <div style={{ minWidth: 0 }}>
              <div className="n">{nombreMostrado}</div>
              <div className="r">{puestoMostrado}</div>
            </div>
          </button>
          <button type="button" className="fx-nav-salir" onClick={handleLogout}>
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>
      </aside>

      <Modal isOpen={modalPerfilAbierto} onClose={() => setModalPerfilAbierto(false)} title="Mi perfil">
        <MiPerfilForm perfil={perfil} onSubmit={handleGuardarPerfil} onCancel={() => setModalPerfilAbierto(false)} />
      </Modal>
    </>
  )
}

export default Sidebar
