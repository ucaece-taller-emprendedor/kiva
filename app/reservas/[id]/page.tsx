'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { CalendarDays, Pencil } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { BalanceBadge, LoadingState, PageHeader, Panel } from '@/components/kiva-ui'
import { NotFoundState } from '@/components/not-found-state'
import { useReservations } from '@/components/reservations-provider'
import { countNights, formatDate, formatMoney, getBalance, getUnitName } from '@/lib/kiva'
import { cn } from '@/lib/utils'

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium sm:text-right">{children}</dd>
    </div>
  )
}

export default function ReservaPage() {
  const { id } = useParams<{ id: string }>()
  const { ready, getReservation } = useReservations()
  const reservation = getReservation(id)

  if (!ready) return <LoadingState />
  if (!reservation) return <NotFoundState />

  const balance = getBalance(reservation)

  return (
    <>
      <div className="text-sm">
        <Link href="/reservas" className="text-muted-foreground hover:text-foreground">
          ← Reservas
        </Link>
      </div>
      <PageHeader
        title={reservation.guest.name}
        description={`${getUnitName(reservation.unitId)} · ${countNights(reservation.checkIn, reservation.checkOut)} noche(s)`}
        actions={
          <>
            <Link
              href={`/disponibilidad?desde=${reservation.checkIn}`}
              className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'px-3')}
            >
              <CalendarDays aria-hidden="true" />
              Ver en disponibilidad
            </Link>
            <Link
              href={`/reservas/${reservation.id}/editar`}
              className={cn(buttonVariants({ size: 'lg' }), 'px-3')}
            >
              <Pencil aria-hidden="true" />
              Editar
            </Link>
          </>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Panel title="Estadía">
          <dl className="flex flex-col gap-3 p-4">
            <Row label="Unidad">{getUnitName(reservation.unitId)}</Row>
            <Row label="Check-in">{formatDate(reservation.checkIn)}</Row>
            <Row label="Check-out">{formatDate(reservation.checkOut)}</Row>
            <Row label="Huésped">{reservation.guest.name}</Row>
            <Row label="Contacto">{reservation.guest.contact}</Row>
          </dl>
        </Panel>
        <Panel title="Cobro">
          <dl className="flex flex-col gap-3 p-4">
            <Row label="Importe total">
              <span className="tabular-nums">{formatMoney(reservation.total)}</span>
            </Row>
            <Row label="Importe cobrado">
              <span className="tabular-nums">{formatMoney(reservation.paid)}</span>
            </Row>
            <div className="flex items-center justify-between gap-4 border-t pt-3">
              <dt className="text-sm font-medium">Saldo pendiente</dt>
              <dd>
                <BalanceBadge balance={balance} />
              </dd>
            </div>
          </dl>
        </Panel>
      </div>
    </>
  )
}
