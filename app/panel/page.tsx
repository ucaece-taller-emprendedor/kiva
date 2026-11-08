'use client'

import Link from 'next/link'
import { BalanceBadge, LoadingState, PageHeader, Panel } from '@/components/kiva-ui'
import { useReservations } from '@/components/reservations-provider'
import {
  UNITS,
  formatDate,
  formatMoney,
  getBalance,
  getUnitName,
  occupiesNight,
  todayISO,
} from '@/lib/kiva'
import { cn } from '@/lib/utils'

function Stat({
  label,
  value,
  suffix,
  detail,
  emphasis,
}: {
  label: string
  value: string
  suffix?: string
  detail?: string
  emphasis?: boolean
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-lg border bg-card p-5',
        emphasis && 'border-warning/50 bg-warning/5',
      )}
    >
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold tracking-tight tabular-nums">{value}</span>
        {suffix && <span className="text-base text-muted-foreground">{suffix}</span>}
      </span>
      {detail && <span className="text-sm text-muted-foreground">{detail}</span>}
    </div>
  )
}

export default function PanelPage() {
  const { reservations, ready } = useReservations()

  if (!ready) return <LoadingState />

  const today = todayISO()
  const occupiedUnitIds = new Set(reservations.filter((r) => occupiesNight(r, today)).map((r) => r.unitId))
  const freeUnits = UNITS.filter((u) => !occupiedUnitIds.has(u.id))

  const upcoming = reservations
    .filter((r) => r.checkIn >= today)
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn))
    .slice(0, 5)

  const withBalance = reservations
    .filter((r) => getBalance(r) > 0)
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn))
  const totalPending = withBalance.reduce((sum, r) => sum + getBalance(r), 0)

  return (
    <>
      <PageHeader title="Inicio" description={`Hoy, ${formatDate(today)}`} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          label="Unidades ocupadas hoy"
          value={String(occupiedUnitIds.size)}
          suffix={`de ${UNITS.length}`}
        />
        <Stat
          label="Unidades disponibles hoy"
          value={String(freeUnits.length)}
          detail={freeUnits.length ? freeUnits.map((u) => u.name).join(', ') : 'Ninguna'}
        />
        <Stat
          label="Saldo pendiente total"
          value={formatMoney(totalPending)}
          detail={`${withBalance.length} reserva(s) con saldo`}
          emphasis={totalPending > 0}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="Próximas reservas"
          action={
            <Link href="/reservas" className="text-xs text-muted-foreground hover:text-foreground">
              Ver todas
            </Link>
          }
        >
          {upcoming.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No hay check-ins próximos.</p>
          ) : (
            <ul className="divide-y">
              {upcoming.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/reservas/${r.id}`}
                    className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-muted/50"
                  >
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium">{r.guest.name}</span>
                      <span className="text-xs text-muted-foreground">{getUnitName(r.unitId)}</span>
                    </div>
                    <span
                      className={cn(
                        'shrink-0 text-sm tabular-nums',
                        r.checkIn === today ? 'font-semibold text-foreground' : 'text-muted-foreground',
                      )}
                    >
                      {r.checkIn === today ? 'Hoy' : formatDate(r.checkIn)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Saldos pendientes">
          {withBalance.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No hay saldos pendientes.</p>
          ) : (
            <ul className="divide-y">
              {withBalance.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/reservas/${r.id}`}
                    className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-muted/50"
                  >
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium">{r.guest.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {getUnitName(r.unitId)} · check-in {formatDate(r.checkIn)}
                      </span>
                    </div>
                    <BalanceBadge balance={getBalance(r)} />
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
