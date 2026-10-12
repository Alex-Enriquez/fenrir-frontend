import { useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import Onboarding from './components/Onboarding'
import Dashboard from './pages/Dashboard'
import Equipos from './pages/Equipos'
import Empleados from './pages/Empleados'
import Licencias from './pages/Licencias'
import LicenciaDetalle from './pages/LicenciaDetalle'
import Asignaciones from './pages/Asignaciones'
import Contrasenas from './pages/Contrasenas'
import ContrasenaDetalle from './pages/ContrasenaDetalle'
import UsuariosSistema from './pages/UsuariosSistema'
import Mantenimientos from './pages/Mantenimientos'
import Responsivas from './pages/Responsivas'
import Proveedores from './pages/Proveedores'
import ServiciosContratados from './pages/ServiciosContratados'
import Infraestructura from './pages/Infraestructura'
import Catalogos from './pages/Catalogos'
import Login from './pages/Login'
import BotonTema from './components/BotonTema'
import { useAplicarTema } from './context/tema'

const titulos = {
  '/': 'Dashboard',
  '/equipos': 'Equipos',
  '/empleados': 'Empleados',
  '/licencias': 'Licencias',
  '/asignaciones': 'Asignaciones',
  '/mantenimientos': 'Mantenimientos',
  '/responsivas': 'Responsivas',
  '/proveedores': 'Proveedores',
  '/servicios-contratados': 'Servicios contratados',
  '/infraestructura': 'Infraestructura de red',
  '/contrasenas': 'Contraseñas',
  '/usuarios-sistema': 'Usuarios del sistema',
  '/catalogos': 'Catálogos',
}

// Título de la barra superior: la ruta exacta o, si no, la que coincide al inicio
// (así /licencias/3 también dice "Licencias")
function tituloDe(ruta) {
  if (titulos[ruta]) return titulos[ruta]
  const base = Object.keys(titulos)
    .filter((k) => k !== '/' && ruta.startsWith(k + '/'))
    .sort((a, b) => b.length - a.length)[0]
  return base ? titulos[base] : 'Alamex TI'
}

function Topbar() {
  const location = useLocation()
  const titulo = tituloDe(location.pathname)

  return (
    <header style={{
      height: '60px',
      borderBottom: '1px solid var(--top-borde)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 2rem',
      backgroundColor: 'var(--top-bg)',
      backdropFilter: 'blur(6px)',
    }}>
      <span className="titulo-barra" style={{ color: 'var(--top-titulo)', fontSize: '0.95rem', fontWeight: 600 }}>
        {titulo}
      </span>
      <span style={{ color: 'var(--top-sub)', fontSize: '0.85rem', marginLeft: '0.6rem' }}>
        · Sistema de Inventario TI
      </span>
      <BotonTema />
    </header>
  )
}

function RutaProtegida({ children }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

// Si ya hay sesión al abrir /login, manda a la app. Solo se revisa al montar:
// así no corta la animación del lobo cuando el login se completa.
function RutaPublica({ children }) {
  const { isAuthenticated } = useAuth()
  const [yaTeniaSesion] = useState(isAuthenticated)
  if (yaTeniaSesion) return <Navigate to="/" replace />
  return children
}

function AppLayout() {
  useAplicarTema()
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <Onboarding />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Topbar />
        <main style={{ flex: 1, padding: '2rem' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/equipos" element={<Equipos />} />
            <Route path="/empleados" element={<Empleados />} />
            <Route path="/licencias" element={<Licencias />} />
            <Route path="/licencias/:tipoId" element={<LicenciaDetalle />} />
            <Route path="/asignaciones" element={<Asignaciones />} />
            <Route path="/contrasenas" element={<Contrasenas />} />
            <Route path="/contrasenas/:categoriaId" element={<ContrasenaDetalle />} />
            <Route path="/usuarios-sistema" element={<UsuariosSistema />} />
            <Route path="/mantenimientos" element={<Mantenimientos />} />
            <Route path="/responsivas" element={<Responsivas />} />
            <Route path="/proveedores" element={<Proveedores />} />
            <Route path="/servicios-contratados" element={<ServiciosContratados />} />
            <Route path="/infraestructura" element={<Infraestructura />} />
            <Route path="/catalogos" element={<Catalogos />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<RutaPublica><Login /></RutaPublica>} />
      <Route
        path="/*"
        element={
          <RutaProtegida>
            <AppLayout />
          </RutaProtegida>
        }
      />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
