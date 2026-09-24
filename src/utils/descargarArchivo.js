import axios from 'axios'

export function descargarArchivo(url, nombreArchivo) {
  axios.get(url, { responseType: 'blob' })
    .then(res => {
      const blobUrl = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = blobUrl
      link.setAttribute('download', nombreArchivo)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(blobUrl)
    })
    .catch(err => {
      console.error(err)
      alert('No se pudo descargar el archivo.')
    })
}
