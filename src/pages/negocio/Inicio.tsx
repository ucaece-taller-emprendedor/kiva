import { Link } from 'react-router'
import { EtiquetaSaldo, Indicador, PageHeader, Panel } from '@/components/kiva-ui'
import { formatoFechaLarga, formatoPlata, hoyISO, ocupaNoche, saldo } from '@/lib/kiva'
import { useNegocio } from '@/negocio/NegocioContext'

export default function Inicio() {
  const { alojamiento, unidades, reservas, error } = useNegocio()
  const hoy = hoyISO()
  const confirmadas = reservas.filter(r => r.estado === 'confirmada')
  const ocupadasHoy = new Set(confirmadas.filter(r => ocupaNoche(r, hoy)).map(r => r.unitId))
  const libres = unidades.filter(u => !ocupadasHoy.has(u.id))
  const proximas = confirmadas.filter(r => r.checkIn >= hoy).sort((a, b) => a.checkIn.localeCompare(b.checkIn)).slice(0, 5)
  const conSaldo = confirmadas.filter(r => saldo(r) > 0).sort((a, b) => a.checkIn.localeCompare(b.checkIn))
  const totalPendiente = conSaldo.reduce((s, r) => s + saldo(r), 0)
  const consultas = reservas.filter(r => r.estado === 'consulta')

  return (
    <>
      <PageHeader titulo="Inicio" descripcion={`${alojamiento?.nombre ?? ''} · Hoy, ${formatoFechaLarga(hoy)}`} />
      {error && <p role="alert" className="rounded-tema bg-peligro/10 px-4 py-3 text-sm text-peligro">{error}</p>}

      {consultas.length > 0 && (
        <Link to="/app/reservas" className="rounded-tema border border-primario/30 bg-primario/5 px-4 py-3 text-sm font-medium text-primario">
          Tenés {consultas.length} consulta(s) de huéspedes para revisar →
        </Link>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Indicador etiqueta="Unidades ocupadas hoy" valor={String(ocupadasHoy.size)} sufijo={`de ${unidades.length}`} />
        <Indicador etiqueta="Unidades disponibles hoy" valor={String(libres.length)} detalle={libres.length ? libres.map(u => u.nombre).join(', ') : 'Ninguna'} />
        <Indicador etiqueta="Saldo pendiente total" valor={formatoPlata(totalPendiente)} detalle={`${conSaldo.length} reserva(s) con saldo`} destacado={totalPendiente > 0} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel titulo="Próximas reservas" accion={<Link to="/app/reservas" className="text-xs text-suave hover:text-texto">Ver todas</Link>}>
          {proximas.length === 0 ? (
            <p className="p-4 text-sm text-suave">No hay check-ins próximos.</p>
          ) : (
            <ul className="divide-y divide-borde">
              {proximas.map(r => (
                <li key={r.id}>
                  <Link to={`/app/reservas/${r.id}`} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-fondo">
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium">{r.guestName}</span>
                      <span className="text-xs text-suave">{r.unitName}</span>
                    </div>
                    <span className={`shrink-0 text-sm tabular-nums ${r.checkIn === hoy ? 'font-semibold' : 'text-suave'}`}>{r.checkIn === hoy ? 'Hoy' : formatoFechaLarga(r.checkIn)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel titulo="Saldos pendientes">
          {conSaldo.length === 0 ? (
            <p className="p-4 text-sm text-suave">No hay saldos pendientes.</p>
          ) : (
            <ul className="divide-y divide-borde">
              {conSaldo.map(r => (
                <li key={r.id}>
                  <Link to={`/app/reservas/${r.id}`} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-fondo">
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium">{r.guestName}</span>
                      <span className="text-xs text-suave">{r.unitName} · check-in {formatoFechaLarga(r.checkIn)}</span>
                    </div>
                    <EtiquetaSaldo saldo={saldo(r)} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  )
}
