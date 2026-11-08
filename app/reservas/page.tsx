'use client'

import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { BalanceBadge, LoadingState, PageHeader, Panel } from '@/components/kiva-ui'
import { useReservations } from '@/components/reservations-provider'
import { formatMoney, formatShortDate, getBalance, getUnitName } from '@/lib/kiva'
import { cn } from '@/lib/utils'

const headCell = 'px-2.5 py-3 font-medium'

export default function ReservasPage() {
  const { reservations, ready } = useReservations()
  const sorted = [...reservations].sort((a, b) => a.checkIn.localeCompare(b.checkIn))

  return (
    <>
      <PageHeader
        title="Reservas"
        description={ready ? `${reservations.length} reserva(s) registradas` : undefined}
      />

      {!ready ? (
        <LoadingState />
      ) : sorted.length === 0 ? (
        <Panel>
          <p className="p-8 text-center text-sm text-muted-foreground">Todavía no hay reservas.</p>
        </Panel>
      ) : (
        <Panel className="relative overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-left text-xs text-muted-foreground">
                <th scope="col" className={cn(headCell, 'border-l-[3px] border-l-transparent')}>Huésped</th>
                <th scope="col" className={headCell}>Unidad</th>
                <th scope="col" className={headCell}>Check-in</th>
                <th scope="col" className={headCell}>Check-out</th>
                <th scope="col" className={cn(headCell, 'text-right')}>Total</th>
                <th scope="col" className={cn(headCell, 'text-right')}>Cobrado</th>
                <th scope="col" className={cn(headCell, 'text-right')}>Saldo</th>
                <th scope="col" className={headCell}>
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => {
                const balance = getBalance(r)
                const pending = balance > 0
                return (
                  <tr
                    key={r.id}
                    className={cn(
                      'border-b last:border-b-0 hover:bg-muted/50',
                      pending && 'bg-warning/5',
                    )}
                  >
                    <td
                      className={cn(
                        'border-l-[3px] px-2.5 py-3',
                        pending ? 'border-l-warning' : 'border-l-transparent',
                      )}
                    >
                      <Link href={`/reservas/${r.id}`} className="font-medium hover:underline">
                        {r.guest.name}
                      </Link>
                      <div className="text-xs text-muted-foreground">{r.guest.contact}</div>
                    </td>
                    <td className={cn('px-2.5 py-3', !pending && 'text-muted-foreground')}>
                      {getUnitName(r.unitId)}
                    </td>
                    <td className={cn('px-2.5 py-3 whitespace-nowrap tabular-nums', !pending && 'text-muted-foreground')}>
                      {formatShortDate(r.checkIn)}
                    </td>
                    <td className={cn('px-2.5 py-3 whitespace-nowrap tabular-nums', !pending && 'text-muted-foreground')}>
                      {formatShortDate(r.checkOut)}
                    </td>
                    <td className={cn('px-2.5 py-3 text-right tabular-nums', !pending && 'text-muted-foreground')}>
                      {formatMoney(r.total)}
                    </td>
                    <td className={cn('px-2.5 py-3 text-right tabular-nums', !pending && 'text-muted-foreground')}>
                      {formatMoney(r.paid)}
                    </td>
                    <td className="px-2.5 py-3 text-right">
                      <BalanceBadge balance={balance} />
                    </td>
                    <td className="px-2.5 py-3 text-right">
                      <Link
                        href={`/reservas/${r.id}/editar`}
                        className={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}
                        title="Editar reserva"
                      >
                        <Pencil aria-hidden="true" />
                        <span className="sr-only">Editar reserva de {r.guest.name}</span>
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
