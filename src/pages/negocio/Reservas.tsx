import { Pencil } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { Alerta, Boton } from '@/components/ui'
import { EtiquetaSaldo, PageHeader, Panel } from '@/components/kiva-ui'
import type { Con } from '@/hooks/useColeccion'
import { formatoFechaCorta, formatoPlata, saldo, type Reserva } from '@/lib/kiva'
import { useNegocio } from '@/negocio/NegocioContext'

const th = 'px-2.5 py-3 font-medium'

function ConsultaItem({ r }: { r: Con<Reserva> }) {
  const { confirmarConsulta, rechazarConsulta } = useNegocio()
  const [total, setTotal] = useState('')
  const [error, setError] = useState('')
  async function confirmar() {
    const n = Number(total)
    if (!Number.isInteger(n) || n <= 0) return setError('Ingresá el importe total pactado.')
    const res = await confirmarConsulta(r, n)
    setError(res.ok ? '' : res.error)
  }
  return (
    <li className="flex flex-col gap-3 p-4">
      <div>
        <p className="text-sm font-medium">{r.guestName} <span className="font-normal text-suave">· {r.contact}</span></p>
        <p className="text-xs text-suave">{r.unitName} · {formatoFechaCorta(r.checkIn)} → {formatoFechaCorta(r.checkOut)}</p>
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <label className="text-xs font-medium">
          Importe total pactado
          <input inputMode="numeric" value={total} onChange={e => setTotal(e.target.value)} aria-label={`Importe total para ${r.guestName}`} className="mt-1 block min-h-10 w-40 rounded-tema border border-borde bg-superficie px-3 text-sm" />
        </label>
        <Boton onClick={() => void confirmar()}>Confirmar reserva</Boton>
        <Boton variante="borde" onClick={() => void rechazarConsulta(r)}>Rechazar</Boton>
      </div>
      {error && <Alerta>{error}</Alerta>}
    </li>
  )
}

export default function Reservas() {
  const { reservas } = useNegocio()
  const consultas = reservas.filter(r => r.estado === 'consulta').sort((a, b) => a.checkIn.localeCompare(b.checkIn))
  const lista = reservas.filter(r => r.estado === 'confirmada').sort((a, b) => a.checkIn.localeCompare(b.checkIn))

  return (
    <>
      <PageHeader titulo="Reservas" descripcion={`${lista.length} reserva(s) registradas`} />

      {consultas.length > 0 && (
        <Panel titulo={`Consultas de huéspedes (${consultas.length})`}>
          <ul className="divide-y divide-borde" data-testid="consultas">
            {consultas.map(r => <ConsultaItem key={r.id} r={r} />)}
          </ul>
        </Panel>
      )}

      {lista.length === 0 ? (
        <Panel><p className="p-8 text-center text-sm text-suave">Todavía no hay reservas.</p></Panel>
      ) : (
        <Panel className="relative overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-borde bg-fondo text-left text-xs text-suave">
                <th scope="col" className={`${th} border-l-[3px] border-l-transparent`}>Huésped</th>
                <th scope="col" className={th}>Unidad</th>
                <th scope="col" className={th}>Check-in</th>
                <th scope="col" className={th}>Check-out</th>
                <th scope="col" className={`${th} text-right`}>Total</th>
                <th scope="col" className={`${th} text-right`}>Cobrado</th>
                <th scope="col" className={`${th} text-right`}>Saldo</th>
                <th scope="col" className={th}><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {lista.map(r => {
                const pendiente = saldo(r) > 0
                const tono = pendiente ? '' : 'text-suave'
                return (
                  <tr key={r.id} className={`border-b border-borde last:border-b-0 hover:bg-fondo ${pendiente ? 'bg-acento/5' : ''}`}>
                    <td className={`border-l-[3px] px-2.5 py-3 ${pendiente ? 'border-l-acento' : 'border-l-transparent'}`}>
                      <Link to={`/app/reservas/${r.id}`} className="font-medium hover:underline">{r.guestName}</Link>
                      <div className="text-xs text-suave">{r.contact}</div>
                    </td>
                    <td className={`px-2.5 py-3 ${tono}`}>{r.unitName}</td>
                    <td className={`whitespace-nowrap px-2.5 py-3 tabular-nums ${tono}`}>{formatoFechaCorta(r.checkIn)}</td>
                    <td className={`whitespace-nowrap px-2.5 py-3 tabular-nums ${tono}`}>{formatoFechaCorta(r.checkOut)}</td>
                    <td className={`px-2.5 py-3 text-right tabular-nums ${tono}`}>{formatoPlata(r.total)}</td>
                    <td className={`px-2.5 py-3 text-right tabular-nums ${tono}`}>{formatoPlata(r.paid)}</td>
                    <td className="px-2.5 py-3 text-right"><EtiquetaSaldo saldo={saldo(r)} /></td>
                    <td className="px-2.5 py-3 text-right">
                      <Link to={`/app/reservas/${r.id}/editar`} title="Editar reserva" className="inline-flex size-9 items-center justify-center rounded-full hover:bg-primario/10">
                        <Pencil className="size-4" aria-hidden />
                        <span className="sr-only">Editar reserva de {r.guestName}</span>
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Panel>
      )}
    </>
  )
}
