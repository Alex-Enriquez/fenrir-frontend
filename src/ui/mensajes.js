// Saca de una respuesta de error del servidor el texto que se le puede mostrar a la persona.
// El servidor usa tres formatos: {detail: "..."} (409: una regla del sistema), {error: "..."} y los de validación {campo: ["..."]} (400).
export function mensajeServidor(err, porDefecto) {
  const estado = err?.response?.status
  const d = err?.response?.data
  if (d && typeof d === 'object') {
    if (estado === 409 && typeof d.detail === 'string') return d.detail
    if (typeof d.error === 'string') return d.error
    if (estado === 400) {
      const primero = Object.values(d).flat()[0]
      if (typeof primero === 'string') return primero
    }
  }
  return porDefecto
}
