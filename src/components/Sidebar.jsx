import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  LayoutDashboard, Monitor, KeyRound, Users, ClipboardList, Wrench,
  Lock, LogOut, ShieldCheck, FileText, Truck, CircleDollarSign, Network,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Modal from './Modal'
import MiPerfilForm from './MiPerfilForm'

const API_URL = 'http://127.0.0.1:8000/api'

const itemsGenerales = [
  { to: '/', end: true, label: 'Dashboard', icon: LayoutDashboard, accent: '#F8C22E' },
  { to: '/equipos', label: 'Equipos', icon: Monitor, accent: '#60A5FA' },
  { to: '/licencias', label: 'Licencias', icon: KeyRound, accent: '#C084FC' },
  { to: '/empleados', label: 'Empleados', icon: Users, accent: '#4ADE80' },
  { to: '/asignaciones', label: 'Asignaciones', icon: ClipboardList, accent: '#F97316' },
  { to: '/mantenimientos', label: 'Mantenimientos', icon: Wrench, accent: '#F87171' },
  { to: '/proveedores', label: 'Proveedores', icon: Truck, accent: '#C084FC' },
  { to: '/servicios-contratados', label: 'Servicios', icon: CircleDollarSign, accent: '#4ADE80' },
  { to: '/infraestructura', label: 'Infraestructura', icon: Network, accent: '#60A5FA' },
]

const itemsSoloAdmin = [
  { to: '/contrasenas', label: 'Contraseñas', icon: Lock, accent: '#EAB308' },
  { to: '/usuarios-sistema', label: 'Usuarios', icon: ShieldCheck, accent: '#4ADE80' },
  { to: '/responsivas', label: 'Responsivas', icon: FileText, accent: '#F97316' },
]

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

  const items = [...itemsGenerales, ...(perfil?.is_staff ? itemsSoloAdmin : [])]

  return (
    <aside className={`app-sidebar${abierta ? ' sidebar-abierta' : ''}`} style={{
      width: '250px',
      minHeight: '100vh',
      backgroundColor: 'var(--sidebar-bg)',
      borderRight: '1px solid var(--borde-suave)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    }}>
      <div style={{ padding: '1.75rem 1.5rem 1.25rem' }}>
        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--texto-fuerte)', letterSpacing: '-0.02em' }}>
          Alamex<span style={{ color: '#F8C22E' }}>.</span>TI
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--texto-6)', marginTop: '0.15rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Gestión de inventario
        </div>
      </div>

      <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, var(--borde-suave), transparent)', margin: '0 1.5rem 1rem' }} />

      <nav style={{ padding: '0 0.75rem', flex: 1, overflowY: 'auto' }}>
        {items.map(({ to, end, label, icon: Icon, accent }) => (
          <NavLink key={to} to={to} end={end} onClick={cerrarSiMovil}>
            {({ isActive }) => (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.55rem 0.75rem',
                marginBottom: '0.2rem',
                borderRadius: '10px',
                borderLeft: isActive ? `3px solid ${accent}` : '3px solid transparent',
                backgroundColor: isActive ? 'rgba(var(--velo-rgb), 0.04)' : 'transparent',
              }}>
                <div style={{
                  width: '30px', height: '30px', borderRadius: '8px',
                  backgroundColor: isActive ? `${accent}26` : 'rgba(var(--velo-rgb), 0.03)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={16} color={isActive ? accent : '#6B7690'} />
                </div>
                <span style={{
                  fontSize: '0.88rem',
                  color: isActive ? 'var(--texto-fuerte)' : 'var(--texto-tenue)',
                  fontWeight: isActive ? 600 : 500,
                }}>
                  {label}
                </span>
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '1rem 1.5rem 1.25rem' }}>
        <button
          onClick={() => setModalPerfilAbierto(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem',
            width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left',
          }}
        >
          <div style={{
            width: '34px', height: '34px', borderRadius: '9px',
            background: 'linear-gradient(135deg, #F8C22E, #001D5C)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.9rem', color: '#0B0F1A', flexShrink: 0,
          }}>
            {inicial}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: '0.82rem', fontWeight: 600, color: 'var(--texto-claro)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {nombreMostrado}
            </div>
            <div style={{
              fontSize: '0.7rem', color: 'var(--texto-6)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {puestoMostrado}
            </div>
          </div>
        </button>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%',
            background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
            color: '#F87171', padding: '0.5rem 0.75rem', borderRadius: '8px',
            fontSize: '0.82rem', fontWeight: 500,
          }}
        >
          <LogOut size={15} /> Cerrar sesión
        </button>
      </div>

      <Modal isOpen={modalPerfilAbierto} onClose={() => setModalPerfilAbierto(false)} title="Mi perfil">
        <MiPerfilForm perfil={perfil} onSubmit={handleGuardarPerfil} onCancel={() => setModalPerfilAbierto(false)} />
      </Modal>
    </aside>
  )
}

export default Sidebar
