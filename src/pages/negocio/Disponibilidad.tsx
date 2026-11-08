import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Boton } from '@/components/ui'
import { PageHeader, Panel } from '@/components/kiva-ui'
import { buscarConflicto, contarNoches, formatoDiaGrilla, formatoFechaLarga, hoyISO, ocupaNoche, sumarDias } from '@/lib/kiva'
import { useNegocio } from '@/negocio/NegocioContext'

const DIAS = 14
const fechaIn = 'min-h-11 rounded-tema border border-borde bg-superficie px-3 text-base'

export default function Disponibilidad() {
  const { unidades, reservas } = useNegocio()
  const [params] = useSearchParams()
  const hoy = hoyISO()
  const [inicio, setInicio] = useState(/^\d{4}-\d{2}-\d{2}$/.test(params.get('desde') ?? '') ? (params.get('desde') as string) : hoy)
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')

  const confirmadas = reservas.filter(r => r.estado === 'confirmada')
  const dias = Array.from({ length: DIAS }, (_, i) => sumarDias(inicio, i))
  const rangoOk = Boolean(desde && hasta && hasta > desde)

  return (
    <>
      <PageHeader titulo="Disponibilidad" descripcion="Cada casilla representa una noche. El día de check-out queda libre." />

      <Panel titulo="¿Qué unidad está disponible?">
        <div className="flex flex-col gap-4 p-4">
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Check-in
              <input type="date" className={fechaIn} value={desde} onChange={e => { setDesde(e.target.value); if (e.target.value) setInicio(e.target.value) }} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Check-out
              <input type="date" className={fechaIn} value={hasta} min={desde || undefined} onChange={e => setHasta(e.target.value)} />
            </label>
          </div>
          {desde && hasta && !rangoOk && <p className="text-sm text-peligro">El check-out debe ser posterior al check-in.</p>}
          {!desde || !hasta ? <p className="text-sm text-suave">Elegí fechas para ver qué unidades están libres.</p> : null}
          {rangoOk && (
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4" aria-live="polite">
              {unidades.map(u => {
                const conflicto = buscarConflicto(confirmadas, { unitId: u.id, checkIn: desde, checkOut: hasta })
                return (
                  <li key={u.id} className={`flex flex-col gap-1 rounded-tema border p-3 ${conflicto ? 'border-borde bg-fondo' : 'border-ok/40 bg-ok/5'}`}>
                    <span className="text-sm font-medium">{u.nombre}</span>
                    {conflicto ? <span className="text-xs text-suave">Ocupada · {conflicto.guestName}</span> : <span className="text-xs font-medium text-ok">Disponible</span>}
                    {!conflicto && <Link to="/app/reservas/nueva" className="text-xs text-primario hover:underline">Crear reserva</Link>}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </Panel>

      <Panel
        titulo={`${formatoFechaLarga(dias[0] as string)} — ${formatoFechaLarga(dias[dias.length - 1] as string)}`}
        accion={
          <div className="flex items-center gap-1">
            <Boton variante="borde" className="px-3" onClick={() => setInicio(sumarDias(inicio, -7))} aria-label="Semana anterior"><ChevronLeft className="size-4" aria-hidden /></Boton>
            <Boton variante="borde" onClick={() => setInicio(hoy)}>Hoy</Boton>
            <Boton variante="borde" className="px-3" onClick={() => setInicio(sumarDias(inicio, 7))} aria-label="Semana siguiente"><ChevronRight className="size-4" aria-hidden /></Boton>
          </div>
        }
      >
        <div className="relative overflow-x-auto" data-testid="grilla">
          <table className="w-full min-w-[980px] table-fixed border-collapse text-xs">
            <thead>
              <tr>
                <th scope="col" className="w-32 border-b border-borde px-3 py-2 text-left font-medium text-suave">Unidad</th>
                {dias.map(d => {
                  const f = formatoDiaGrilla(d)
                  return (
                    <th key={d} scope="col" className={`border-b border-l border-borde px-1 py-2 text-center font-medium ${d === hoy ? 'bg-primario/10 text-primario' : 'text-suave'}`}>
                      <div className="capitalize">{f.diaSemana}</div>
                      <div>{f.diaMes}</div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {unidades.map(u => (
                <tr key={u.id}>
                  <th scope="row" className="border-b border-borde px-3 py-2 text-left text-sm font-medium">{u.nombre}</th>
                  {dias.map((d, i) => {
                    const res = confirmadas.find(r => r.unitId === u.id && ocupaNoche(r, d))
                    const resaltada = rangoOk && d >= desde && d < hasta
                    if (!res) {
                      return <td key={d} className={`h-14 border-b border-l border-borde ${resaltada ? 'bg-primario/5' : ''}`}><span className="sr-only">Disponible</span></td>
                    }
                    const esInicio = res.checkIn === d || i === 0
                    const esFin = sumarDias(d, 1) === res.checkOut
                    const tramo = Math.min(contarNoches(d, res.checkOut), DIAS - i)
                    return (
                      <td key={d} className={`relative h-14 border-b border-borde p-0 py-1.5 ${esInicio ? 'border-l' : 'border-l-0'}`}>
                        <Link
                          to={`/app/reservas/${res.id}`}
                          title={`${res.guestName} · ${formatoFechaLarga(res.checkIn)} → ${formatoFechaLarga(res.checkOut)}`}
                          className={`flex h-full items-center bg-primario hover:opacity-90 ${esInicio ? 'ml-1 rounded-l-md' : ''} ${esFin ? 'mr-1 rounded-r-md' : ''}`}
                        >
                          {esInicio ? (
                            <span className="absolute top-1.5 bottom-1.5 left-2.5 z-10 flex items-center text-[11px] font-medium leading-tight text-primario-texto" style={{ width: `calc(${tramo * 100}% - 1.125rem)` }}>
                              <span className="line-clamp-2 break-words">{res.guestName}</span>
                            </span>
                          ) : (
                            <span className="sr-only">{res.guestName}</span>
                          )}
                        </Link>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center gap-4 border-t border-borde px-4 py-3 text-xs text-suave">
          <span className="flex items-center gap-2"><span className="size-3 rounded-sm bg-primario" aria-hidden /> Ocupada</span>
          <span className="flex items-center gap-2"><span className="size-3 rounded-sm border border-borde bg-superficie" aria-hidden /> Disponible</span>
          <Link to="/app/reservas/nueva" className="ml-auto font-semibold text-primario hover:underline">+ Nueva reserva</Link>
        </div>
      </Panel>
    </>
  )
}
