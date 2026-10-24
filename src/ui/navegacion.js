import {
  LayoutDashboard, Monitor, KeyRound, Users, ClipboardList, Wrench, Phone, Network, CircleDollarSign, Truck,
  FileText, Lock, ShieldCheck, ListChecks,
} from './icons'

// Estructura del menú lateral (y de la ruta que se muestra arriba). Un solo lugar para cambiarla.
// admin: true = solo lo ven los administradores.
export const grupos = [
  { titulo: null, items: [
    { to: '/', end: true, label: 'Dashboard', icon: LayoutDashboard },
  ] },
  { titulo: 'Inventario', items: [
    { to: '/equipos', label: 'Equipos', icon: Monitor },
    { to: '/licencias', label: 'Licencias', icon: KeyRound },
    { to: '/asignaciones', label: 'Asignaciones', icon: ClipboardList },
    { to: '/mantenimientos', label: 'Mantenimientos', icon: Wrench },
  ] },
  { titulo: 'Personas', items: [
    { to: '/empleados', label: 'Empleados', icon: Users },
    { to: '/directorio', label: 'Directorio', icon: Phone },
  ] },
  { titulo: 'Red y servicios', items: [
    { to: '/infraestructura', label: 'Infraestructura', icon: Network },
    { to: '/servicios-contratados', label: 'Servicios', icon: CircleDollarSign },
    { to: '/proveedores', label: 'Proveedores', icon: Truck },
  ] },
  { titulo: 'Administración', admin: true, items: [
    { to: '/responsivas', label: 'Responsivas', icon: FileText },
    { to: '/contrasenas', label: 'Contraseñas', icon: Lock },
    { to: '/usuarios-sistema', label: 'Usuarios', icon: ShieldCheck },
    { to: '/catalogos', label: 'Catálogos', icon: ListChecks },
  ] },
]

// ¿A qué grupo del menú pertenece esta ruta? (/licencias/3 cuenta como Licencias). El Dashboard no tiene grupo.
export function grupoDe(ruta) {
  for (const g of grupos) {
    if (!g.titulo) continue
    if (g.items.some((i) => ruta === i.to || ruta.startsWith(i.to + '/'))) return g.titulo
  }
  return null
}
