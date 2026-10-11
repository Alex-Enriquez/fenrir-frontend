import { useEffect, useSyncExternalStore } from 'react'

// Tema de la aplicación (no del login, que tiene el suyo). Arranca en oscuro.
const CLAVE = 'fenrir-app-theme'
const oyentes = new Set()

function leer() {
  try {
    return localStorage.getItem(CLAVE) === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

let actual = leer()

function suscribir(avisar) {
  oyentes.add(avisar)
  return () => oyentes.delete(avisar)
}

export function cambiarTema(nuevo) {
  actual = nuevo
  try {
    localStorage.setItem(CLAVE, nuevo)
  } catch {
    /* sin almacenamiento: el cambio vale solo para esta sesión */
  }
  oyentes.forEach((avisar) => avisar())
}

// Si el tema cambia en otra pestaña, esta se entera
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === CLAVE) {
      actual = leer()
      oyentes.forEach((avisar) => avisar())
    }
  })
}

export function useTema() {
  return useSyncExternalStore(suscribir, () => actual, () => 'dark')
}

// Se usa dentro de la app: pone el tema en <html> y lo quita al salir (así el login no se ve afectado)
export function useAplicarTema() {
  const tema = useTema()
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema)
    return () => document.documentElement.removeAttribute('data-theme')
  }, [tema])
}
