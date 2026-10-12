import { useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL } from '../config'

// ¿El usuario actual es administrador? Se consulta una sola vez por sesión y se comparte entre componentes.
// (Si cambia la sesión, se vuelve a consultar. Un fallo de red no se guarda: se reintenta la próxima vez.)
let guardado = { token: null, esAdmin: null }
let enCurso = null

export function useEsAdmin() {
  const token = localStorage.getItem('token')
  const [esAdmin, setEsAdmin] = useState(guardado.token === token ? guardado.esAdmin : null)

  useEffect(() => {
    let vivo = true
    if (guardado.token === token && guardado.esAdmin !== null) {
      setEsAdmin(guardado.esAdmin)
      return undefined
    }
    if (!enCurso || enCurso.token !== token) {
      enCurso = {
        token,
        promesa: axios.get(`${API_URL}/perfil/`)
          .then(res => ({ valor: !!res.data.is_staff, exito: true }))
          .catch(() => ({ valor: false, exito: false })),
      }
    }
    enCurso.promesa.then(({ valor, exito }) => {
      if (exito) guardado = { token, esAdmin: valor }
      if (vivo) setEsAdmin(valor)
    })
    return () => { vivo = false }
  }, [token])

  return esAdmin
}
