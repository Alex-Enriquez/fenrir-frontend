import { Sun, Moon } from 'lucide-react'
import { useTema, cambiarTema } from '../context/tema'

function BotonTema() {
  const tema = useTema()
  const esClaro = tema === 'light'
  const etiqueta = esClaro ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'

  return (
    <button
      type="button"
      onClick={() => cambiarTema(esClaro ? 'dark' : 'light')}
      title={etiqueta}
      aria-label={etiqueta}
      style={{
        marginLeft: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '36px', height: '36px', borderRadius: '10px',
        border: '1px solid var(--campo-borde)', backgroundColor: 'var(--campo-bg-2)', color: 'var(--texto-2)',
      }}
    >
      {esClaro ? <Moon size={17} /> : <Sun size={17} />}
    </button>
  )
}

export default BotonTema
