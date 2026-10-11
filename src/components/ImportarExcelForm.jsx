import { useState } from 'react'
import axios from 'axios'
import { Download, Upload, CheckCircle2, AlertTriangle } from 'lucide-react'
import { descargarArchivo } from '../utils/descargarArchivo'

function ImportarExcelForm({ urlPlantilla, urlImportar, nombrePlantilla, onTerminado, onCancel }) {
  const [archivo, setArchivo] = useState(null)
  const [subiendo, setSubiendo] = useState(false)
  const [resultado, setResultado] = useState(null)

  const handleImportar = () => {
    if (!archivo) return
    setSubiendo(true)
    const formData = new FormData()
    formData.append('archivo', archivo)

    axios.post(urlImportar, formData)
      .then(res => {
        setResultado(res.data)
        setSubiendo(false)
      })
      .catch(err => {
        setResultado({ error: 'No se pudo procesar el archivo. Revisa que sea un .xlsx válido.' })
        setSubiendo(false)
        console.error(err)
      })
  }

  if (resultado) {
    return (
      <div>
        {resultado.error ? (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', color: 'var(--peligro-texto)', marginBottom: '1rem' }}>
            <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span style={{ fontSize: '0.9rem' }}>{resultado.error}</span>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--exito-texto)', marginBottom: '1rem' }}>
              <CheckCircle2 size={20} />
              <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                {resultado.creados} registro{resultado.creados !== 1 ? 's' : ''} creado{resultado.creados !== 1 ? 's' : ''} correctamente.
              </span>
            </div>
            {resultado.errores && resultado.errores.length > 0 && (
              <div style={{
                backgroundColor: 'var(--aviso-bg-2)', border: '1px solid var(--aviso-borde)', borderRadius: '8px',
                padding: '0.75rem 1rem', marginBottom: '1rem', maxHeight: '180px', overflowY: 'auto',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--acento-texto)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  <AlertTriangle size={15} /> {resultado.errores.length} fila(s) con problemas
                </div>
                {resultado.errores.map((e, i) => (
                  <div key={i} style={{ fontSize: '0.8rem', color: 'var(--texto-suave)', marginBottom: '0.25rem' }}>{e}</div>
                ))}
              </div>
            )}
          </>
        )}
        <button
          onClick={onTerminado}
          style={{
            width: '100%', backgroundColor: 'var(--accion)', color: 'var(--sobre-accion)', border: 'none',
            padding: '0.65rem', borderRadius: '6px', fontWeight: 'bold',
          }}
        >
          Cerrar
        </button>
      </div>
    )
  }

  return (
    <div>
      <p style={{ color: 'var(--texto-tenue)', fontSize: '0.88rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
        1) Descarga la plantilla, 2) llénala con tus datos, 3) súbela aquí para crear los registros automáticamente.
      </p>

      <button
        onClick={() => descargarArchivo(urlPlantilla, nombrePlantilla)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%',
          background: 'transparent', border: '1px solid var(--campo-borde)', borderRadius: '8px',
          padding: '0.65rem', color: 'var(--texto-suave)', fontSize: '0.9rem', marginBottom: '1.25rem',
        }}
      >
        <Download size={16} /> Descargar plantilla
      </button>

      <label style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
        border: '1.5px dashed var(--campo-borde)', borderRadius: '8px', padding: '1.5rem',
        cursor: 'pointer', marginBottom: '1.25rem', textAlign: 'center',
      }}>
        <Upload size={22} color="#6B7690" />
        <span style={{ fontSize: '0.85rem', color: archivo ? 'var(--exito-texto)' : 'var(--texto-tenue)' }}>
          {archivo ? archivo.name : 'Haz clic para elegir tu archivo .xlsx'}
        </span>
        <input
          type="file"
          accept=".xlsx"
          onChange={(e) => setArchivo(e.target.files[0])}
          style={{ display: 'none' }}
        />
      </label>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          onClick={handleImportar}
          disabled={!archivo || subiendo}
          style={{
            backgroundColor: 'var(--accion)', color: 'var(--sobre-accion)', border: 'none',
            padding: '0.65rem 1.25rem', borderRadius: '6px', fontWeight: 'bold', flex: 1,
            opacity: (!archivo || subiendo) ? 0.5 : 1,
          }}
        >
          {subiendo ? 'Importando...' : 'Importar'}
        </button>
        <button type="button" onClick={onCancel} style={{
          backgroundColor: 'transparent', color: 'var(--sec-texto)', border: '1px solid var(--cancel-borde)',
          padding: '0.65rem 1.25rem', borderRadius: '6px', flex: 1,
        }}>
          Cancelar
        </button>
      </div>
    </div>
  )
}

export default ImportarExcelForm
