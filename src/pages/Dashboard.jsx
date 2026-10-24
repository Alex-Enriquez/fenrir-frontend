import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { UserCheck, KeyRound, Wrench, ArrowRight, ArrowsClockwise, CheckCircle2 } from '../ui/icons'
import { API_URL } from '../config'

const DIA = 86400000

// Las cuatro situaciones posibles de un equipo, de la más común a la menos. El color de cada una es fijo.
const ESTADOS = [
  { key: 'asignado', nombre: 'Asignados', color: 'var(--fx-info)' },
  { key: 'disponible', nombre: 'Disponibles', color: 'var(--fx-ok)' },
  { key: 'reparacion', nombre: 'En reparación', color: 'var(--fx-warn)' },
  { key: 'baja', nombre: 'De baja', color: 'var(--fx-faint)' },
]

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

// Mismo cálculo de días que usan Licencias y Servicios contratados
const diasHasta = (fecha) => Math.ceil((new Date(fecha) - new Date()) / DIA)
const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`
const lista = (nombres, max = 3) => nombres.slice(0, max).join(', ') + (nombres.length > max ? ` y ${nombres.length - max} más` : '')
const dinero = (n) => (n || n === 0 ? `$${Number(n).toLocaleString('es-MX')}` : '')

function saludo(perfil) {
  const h = new Date().getHours()
  const base = h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches'
  const nombre = (perfil?.nombre_completo || '').trim().split(/\s+/)[0]
  return nombre ? `${base}, ${nombre}` : base
}

function fechaLarga() {
  const t = new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())
  return t.charAt(0).toUpperCase() + t.slice(1)
}

function hace(fecha) {
  const d = Math.floor((new Date() - new Date(fecha)) / DIA)
  if (d <= 0) return 'hoy'
  if (d === 1) return 'ayer'
  if (d < 30) return `hace ${d} días`
  const m = Math.floor(d / 30)
  return m < 12 ? `hace ${m === 1 ? '1 mes' : `${m} meses`}` : 'hace más de un año'
}

const pedir = (ruta) => axios.get(`${API_URL}/${ruta}/`).then((r) => r.data)
const valor = (r) => (r.status === 'fulfilled' && Array.isArray(r.value) ? r.value : [])

// Todo lo que el dashboard muestra sale de aquí. "ok" dice qué datos se pudieron cargar: lo que no, se oculta
// (así un permiso o una falla de red no se confunde con un "0").
function calcular(d) {
  const { equipos, empleados, asignaciones, licencias, tipos, servicios, mantenimientos, ok } = d

  const c = { total: equipos.length }
  ESTADOS.forEach((e) => { c[e.key] = equipos.filter((x) => x.estado === e.key).length })
  const vigentes = c.total - c.baja
  const usoPct = vigentes > 0 ? Math.round((c.asignado / vigentes) * 100) : 0

  const empleadoPorId = Object.fromEntries(empleados.map((e) => [e.id, e]))
  const activasEquipo = asignaciones.filter((a) => a.equipo && !a.fecha_devolucion)
  const nombreTipo = (l) => tipos.find((t) => t.id === l.tipo)?.nombre || l.tipo_nombre || 'Licencia'

  // --- Lo que requiere atención ---
  const atencion = []
  if (ok.licencias) {
    licencias.forEach((l) => {
      if (l.modalidad === 'perpetua' || !l.fecha_vencimiento) return
      const dias = diasHasta(l.fecha_vencimiento)
      if (dias < 0) {
        atencion.push({ nivel: 'alta', orden: dias, titulo: `${nombreTipo(l)} venció`, detalle: `Hace ${plural(Math.abs(dias), 'día', 'días')} · ${plural(l.asientos_totales || 0, 'asiento', 'asientos')}`, a: '/licencias' })
      } else if (dias <= 30) {
        atencion.push({ nivel: 'media', orden: dias, titulo: `${nombreTipo(l)} vence pronto`, detalle: `En ${plural(dias, 'día', 'días')} · ${plural(l.asientos_totales || 0, 'asiento', 'asientos')}`, a: '/licencias' })
      }
    })
  }
  if (ok.servicios) {
    servicios.forEach((s) => {
      if (!s.fecha_proximo_pago) return
      const dias = diasHasta(s.fecha_proximo_pago)
      const extra = [s.proveedor_nombre, dinero(s.costo)].filter(Boolean).join(' · ')
      if (dias < 0) {
        atencion.push({ nivel: 'alta', orden: dias, titulo: `Pago vencido: ${s.nombre}`, detalle: `Hace ${plural(Math.abs(dias), 'día', 'días')}${extra ? ` · ${extra}` : ''}`, a: '/servicios-contratados' })
      } else if (dias <= 7) {
        atencion.push({ nivel: 'media', orden: dias, titulo: `Pago próximo: ${s.nombre}`, detalle: `${dias === 0 ? 'Hoy' : `En ${plural(dias, 'día', 'días')}`}${extra ? ` · ${extra}` : ''}`, a: '/servicios-contratados' })
      }
    })
  }
  if (ok.empleados && ok.asignaciones) {
    const conEquipoDeBaja = empleados
      .filter((e) => e.estatus === 'baja')
      .map((e) => ({ e, n: activasEquipo.filter((a) => a.empleado === e.id).length }))
      .filter((x) => x.n > 0)
    if (conEquipoDeBaja.length > 0) {
      const equiposTotal = conEquipoDeBaja.reduce((s, x) => s + x.n, 0)
      atencion.push({
        nivel: 'alta', orden: -1000,
        titulo: `${plural(conEquipoDeBaja.length, 'empleado de baja conserva', 'empleados de baja conservan')} equipo`,
        detalle: `${lista(conEquipoDeBaja.map((x) => x.e.nombre_completo))} · ${plural(equiposTotal, 'equipo asignado', 'equipos asignados')}`,
        a: '/asignaciones',
      })
    }
  }
  if (c.reparacion > 0) {
    const nombres = equipos.filter((x) => x.estado === 'reparacion').map((x) => `${x.marca} ${x.modelo}`)
    atencion.push({ nivel: 'media', orden: 1000, titulo: `${plural(c.reparacion, 'equipo', 'equipos')} en reparación`, detalle: lista(nombres), a: '/equipos' })
  }
  if (ok.empleados && ok.asignaciones) {
    const conEquipo = new Set(activasEquipo.map((a) => a.empleado))
    const sinEquipo = empleados.filter((e) => e.estatus !== 'baja' && !conEquipo.has(e.id))
    if (sinEquipo.length > 0) {
      atencion.push({ nivel: 'info', orden: 2000, titulo: `${plural(sinEquipo.length, 'empleado activo sin equipo', 'empleados activos sin equipo')} asignado`, detalle: lista(sinEquipo.map((e) => e.nombre_completo)), a: '/asignaciones' })
    }
  }
  const peso = { alta: 0, media: 1, info: 2 }
  atencion.sort((a, b) => peso[a.nivel] - peso[b.nivel] || a.orden - b.orden)

  // --- Próximos vencimientos (licencias y pagos de servicios, a 90 días) ---
  const proximos = []
  if (ok.licencias) {
    licencias.forEach((l) => {
      if (l.modalidad === 'perpetua' || !l.fecha_vencimiento) return
      const dias = diasHasta(l.fecha_vencimiento)
      if (dias >= 0 && dias <= 90) proximos.push({ fecha: l.fecha_vencimiento, dias, titulo: nombreTipo(l), detalle: `Licencia · ${plural(l.asientos_totales || 0, 'asiento', 'asientos')}` })
    })
  }
  if (ok.servicios) {
    servicios.forEach((s) => {
      if (!s.fecha_proximo_pago) return
      const dias = diasHasta(s.fecha_proximo_pago)
      if (dias >= 0 && dias <= 90) proximos.push({ fecha: s.fecha_proximo_pago, dias, titulo: s.nombre, detalle: ['Pago', s.periodicidad, dinero(s.costo)].filter(Boolean).join(' · ') })
    })
  }
  proximos.sort((a, b) => a.dias - b.dias)

  // --- Barras ---
  const porCategoria = {}
  equipos.forEach((e) => { const k = e.categoria_nombre || 'Sin categoría'; porCategoria[k] = (porCategoria[k] || 0) + 1 })
  const categorias = Object.entries(porCategoria).map(([nombre, cantidad]) => ({ nombre, cantidad })).sort((a, b) => b.cantidad - a.cantidad).slice(0, 8)

  const porDepto = {}
  activasEquipo.forEach((a) => { const k = empleadoPorId[a.empleado]?.departamento_nombre || 'Sin departamento'; porDepto[k] = (porDepto[k] || 0) + 1 })
  const departamentos = Object.entries(porDepto).map(([nombre, cantidad]) => ({ nombre, cantidad })).sort((a, b) => b.cantidad - a.cantidad).slice(0, 8)

  // --- Datos al lado de la barra de salud ---
  const datos = []
  if (ok.empleados) datos.push({ icono: UserCheck, color: 'var(--fx-info)', fondo: 'var(--info-bg-2)', valor: empleados.filter((e) => e.estatus !== 'baja').length, texto: 'empleados activos' })
  if (ok.licencias && ok.asignaciones) {
    const total = licencias.reduce((s, l) => s + (l.asientos_totales || 0), 0)
    const usados = asignaciones.filter((a) => a.licencia && !a.fecha_devolucion).length
    if (total > 0) datos.push({ icono: KeyRound, color: 'var(--fx-violet)', fondo: 'var(--info-bg)', valor: `${usados}/${total}`, texto: 'asientos de licencia en uso' })
  }
  if (ok.mantenimientos) {
    const n = mantenimientos.filter((m) => { const dd = (new Date() - new Date(m.fecha)) / DIA; return dd >= 0 && dd <= 30 }).length
    datos.push({ icono: Wrench, color: 'var(--fx-warn)', fondo: 'var(--aviso-bg)', valor: n, texto: 'mantenimientos en los últimos 30 días' })
  }

  // --- Actividad reciente ---
  const actividad = [...activasEquipo]
    .filter((a) => a.fecha_asignacion)
    .sort((a, b) => (b.fecha_asignacion > a.fecha_asignacion ? 1 : b.fecha_asignacion < a.fecha_asignacion ? -1 : b.id - a.id))
    .slice(0, 6)

  return { c, vigentes, usoPct, atencion, proximos: proximos.slice(0, 6), categorias, departamentos, datos, actividad }
}

function Barras({ items }) {
  const max = Math.max(...items.map((i) => i.cantidad), 1)
  return (
    <div className="barras">
      {items.map((i, idx) => (
        <div key={i.nombre} className={`barra${idx === 0 ? ' top' : ''}`}>
          <span className="n" title={i.nombre}>{i.nombre}</span>
          <span className="pista"><span className="relleno" style={{ width: `${(i.cantidad / max) * 100}%` }} /></span>
          <span className="c">{i.cantidad}</span>
        </div>
      ))}
    </div>
  )
}

function Dashboard() {
  const [datos, setDatos] = useState(null)
  const [error, setError] = useState(false)
  const [refrescando, setRefrescando] = useState(true)

  const traer = useCallback(() => {
    return Promise.allSettled([
      pedir('equipos'), pedir('empleados'), pedir('asignaciones'), pedir('licencias'),
      pedir('tipos-licencia'), pedir('servicios-contratados'), pedir('mantenimientos'),
      axios.get(`${API_URL}/perfil/`).then((r) => r.data),
    ]).then(([eq, emp, asig, lic, tipos, serv, mant, perfil]) => {
      if (eq.status !== 'fulfilled') {
        console.error(eq.reason)
        setError(true)
        return
      }
      setError(false)
      setDatos({
        equipos: valor(eq), empleados: valor(emp), asignaciones: valor(asig), licencias: valor(lic),
        tipos: valor(tipos), servicios: valor(serv), mantenimientos: valor(mant),
        perfil: perfil.status === 'fulfilled' ? perfil.value : null,
        ok: {
          empleados: emp.status === 'fulfilled', asignaciones: asig.status === 'fulfilled',
          licencias: lic.status === 'fulfilled' && tipos.status === 'fulfilled',
          servicios: serv.status === 'fulfilled', mantenimientos: mant.status === 'fulfilled',
        },
      })
    })
  }, [])

  useEffect(() => { traer().finally(() => setRefrescando(false)) }, [traer])

  const refrescar = () => {
    setRefrescando(true)
    traer().finally(() => setRefrescando(false))
  }

  const r = useMemo(() => (datos ? calcular(datos) : null), [datos])

  if (error) return <p style={{ color: 'var(--peligro-texto)' }}>No se pudo cargar la información.</p>
  if (!datos || !r) return <p>Cargando dashboard...</p>

  const { c, vigentes, usoPct } = r

  return (
    <div className="dash">
      <div className="dash-head">
        <div>
          <h1>{saludo(datos.perfil)}</h1>
          <div className="dash-fecha">{fechaLarga()} · resumen del inventario</div>
        </div>
        <button type="button" className="dash-refrescar" onClick={refrescar} disabled={refrescando}>
          <ArrowsClockwise size={15} /> {refrescando ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      <section className="panel dash-hero" aria-label="Estado de los equipos" style={r.datos.length === 0 ? { gridTemplateColumns: '1fr' } : undefined}>
        <div className="dash-hero-main">
          <div className="dash-total-fila">
            <span className="dash-total">{c.total}</span>
            <span className="dash-total-et">{c.total === 1 ? 'equipo registrado' : 'equipos registrados'}</span>
          </div>
          {c.total > 0 ? (
            <>
              <div className="dash-en-uso">
                <b>{c.asignado}</b> en uso · <b>{c.disponible}</b> {c.disponible === 1 ? 'disponible' : 'disponibles'}
                {vigentes > 0 && <> · {usoPct}% de los equipos activos están asignados</>}
              </div>
              <div className="salud" role="img" aria-label={ESTADOS.map((e) => `${c[e.key]} ${e.nombre.toLowerCase()}`).join(', ')}>
                {ESTADOS.filter((e) => c[e.key] > 0).map((e) => (
                  <span key={e.key} style={{ flex: c[e.key], background: e.color }} title={`${e.nombre}: ${c[e.key]}`} />
                ))}
              </div>
              <div className="salud-leyenda">
                {ESTADOS.map((e) => (
                  <div key={e.key} className="salud-item" style={{ '--c': e.color }}>
                    <i /> {e.nombre} <b>{c[e.key]}</b>
                    <span>{Math.round((c[e.key] / c.total) * 100)}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="dash-vacio" style={{ marginTop: '0.75rem' }}>
              Todavía no hay equipos registrados. Empieza en <Link to="/equipos" style={{ color: 'var(--info-texto)', fontWeight: 600 }}>Equipos</Link>.
            </p>
          )}
        </div>
        {r.datos.length > 0 && (
          <div className="dash-hero-side">
            {r.datos.map((d) => (
              <div key={d.texto} className="dash-dato" style={{ '--c': d.color, '--c-bg': d.fondo }}>
                <div className="ic"><d.icono size={22} weight="duotone" /></div>
                <div>
                  <div className="v">{d.valor}</div>
                  <div className="l">{d.texto}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="dash-grid">
        <section className="panel panel-pad" aria-label="Requiere atención">
          <div className="panel-h">
            <h2>Requiere atención</h2>
            {r.atencion.length > 0 && <span className="sub">{plural(r.atencion.length, 'aviso', 'avisos')}</span>}
          </div>
          {r.atencion.length === 0 ? (
            <div className="todo-bien">
              <div className="ic"><CheckCircle2 size={24} weight="duotone" /></div>
              <div><b>Todo en orden</b>No hay licencias, pagos ni equipos que necesiten atención ahora.</div>
            </div>
          ) : (
            <ul className="atencion">
              {r.atencion.slice(0, 8).map((a, i) => (
                <li key={i} className={`sev-${a.nivel}`}>
                  <span className="riel" aria-hidden="true" />
                  <div>
                    <div className="tit">{a.titulo}</div>
                    <div className="det">{a.detalle}</div>
                  </div>
                  <Link className="ir" to={a.a}>Ver <ArrowRight size={13} /></Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel panel-pad" aria-label="Próximos vencimientos">
          <div className="panel-h">
            <h2>Próximos vencimientos</h2>
            <span className="sub">a 90 días</span>
          </div>
          {r.proximos.length === 0 ? (
            <p className="dash-vacio">Nada vence en los próximos 90 días.</p>
          ) : (
            <ul className="venc">
              {r.proximos.map((p, i) => {
                const f = new Date(p.fecha + 'T12:00:00')
                const nivel = p.dias <= 7 ? 'media' : p.dias <= 30 ? 'info' : 'ok'
                return (
                  <li key={i}>
                    <div className="fecha-tile"><b>{f.getDate()}</b><small>{MESES[f.getMonth()]}</small></div>
                    <div>
                      <div className="t">{p.titulo}</div>
                      <div className="d">{p.detalle}</div>
                    </div>
                    <span className={`pilula ${nivel}`}>{p.dias === 0 ? 'Hoy' : `${p.dias} d`}</span>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>

      <div className="dash-grid dos">
        <section className="panel panel-pad" aria-label="Equipos por categoría">
          <div className="panel-h">
            <h2>Equipos por categoría</h2>
            <Link to="/equipos">Ver equipos</Link>
          </div>
          {r.categorias.length === 0 ? <p className="dash-vacio">Sin datos todavía.</p> : <Barras items={r.categorias} />}
        </section>
        <section className="panel panel-pad" aria-label="Equipos asignados por departamento">
          <div className="panel-h">
            <h2>Equipos asignados por departamento</h2>
            <Link to="/asignaciones">Ver asignaciones</Link>
          </div>
          {r.departamentos.length === 0 ? <p className="dash-vacio">Todavía no hay equipos asignados.</p> : <Barras items={r.departamentos} />}
        </section>
      </div>

      {r.actividad.length > 0 && (
        <section className="panel panel-pad" aria-label="Actividad reciente">
          <div className="panel-h">
            <h2>Asignaciones recientes</h2>
            <Link to="/asignaciones">Ver todas</Link>
          </div>
          <ul className="actividad">
            {r.actividad.map((a) => (
              <li key={a.id}>
                <span className="av" aria-hidden="true">{(a.empleado_nombre || '?').charAt(0).toUpperCase()}</span>
                <span className="tx"><b>{a.empleado_nombre}</b> recibió {a.equipo_nombre}</span>
                <span className="cuando">{hace(a.fecha_asignacion)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

export default Dashboard
