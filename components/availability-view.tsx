'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { LoadingState, PageHeader, Panel } from '@/components/kiva-ui'
import { useReservations } from '@/components/reservations-provider'
import {
  UNITS,
  addDays,
  countNights,
  findConflict,
  formatDate,
  formatGridDay,
  occupiesNight,
  todayISO,
} from '@/lib/kiva'
import { cn } from '@/lib/utils'

const DAYS_SHOWN = 14

const inputClass =
  'h-10 rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30'

export function AvailabilityView({ initialStart }: { initialStart?: string }) {
  const { reservations, ready } = useReservations()
  const today = todayISO()
  const [start, setStart] = useState(initialStart ?? today)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const days = Array.from({ length: DAYS_SHOWN }, (_, i) => addDays(start, i))
  const rangeValid = Boolean(from && to && to > from)

  return (
    <>
      <PageHeader
        title="Disponibilidad"
        description="Cada casilla representa una noche. El día de check-out queda libre."
      />

      <Panel title="¿Qué unidad está disponible?">
        <div className="flex flex-col gap-4 p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="from" className="text-sm font-medium">
                Check-in
              </label>
              <input
                id="from"
                type="date"
                className={inputClass}
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value)
                  if (e.target.value) setStart(e.target.value)
                }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="to" className="text-sm font-medium">
                Check-out
              </label>
              <input
                id="to"
                type="date"
                className={inputClass}
                value={to}
                min={from || undefined}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
          </div>

          {from && to && !rangeValid && (
            <p className="text-sm text-destructive">El check-out debe ser posterior al check-in.</p>
          )}
          {!from || !to ? (
            <p className="text-sm text-muted-foreground">Elegí fechas para ver qué unidades están libres.</p>
          ) : null}

          {ready && rangeValid && (
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4" aria-live="polite">
              {UNITS.map((unit) => {
                const conflict = findConflict(reservations, { unitId: unit.id, checkIn: from, checkOut: to })
                return (
                  <li
                    key={unit.id}
                    className={cn(
                      'flex flex-col gap-1 rounded-md border p-3',
                      conflict ? 'border-border bg-muted/50' : 'border-success/40 bg-success/5',
                    )}
                  >
                    <span className="text-sm font-medium">{unit.name}</span>
                    {conflict ? (
                      <span className="text-xs text-muted-foreground">
                        Ocupada · {conflict.guest.name}
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-success">Disponible</span>
                    )}
                    {!conflict && (
                      <Link
                        href="/reservas/nueva"
                        className="text-xs text-primary underline-offset-2 hover:underline"
                      >
                        Crear reserva
                      </Link>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </Panel>

      <Panel
        title={`${formatDate(days[0])} — ${formatDate(days[days.length - 1])}`}
        action={
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={() => setStart(addDays(start, -7))}>
              <ChevronLeft aria-hidden="true" />
              <span className="sr-only">Semana anterior</span>
            </Button>
            <Button variant="outline" onClick={() => setStart(today)}>
              Hoy
            </Button>
            <Button variant="outline" size="icon" onClick={() => setStart(addDays(start, 7))}>
              <ChevronRight aria-hidden="true" />
              <span className="sr-only">Semana siguiente</span>
            </Button>
          </div>
        }
      >
        {!ready ? (
          <LoadingState />
        ) : (
          <div className="relative overflow-x-auto">
            <table className="w-full min-w-[980px] table-fixed border-collapse text-xs">
              <thead>
                <tr>
                  <th scope="col" className="w-32 border-b px-3 py-2 text-left font-medium text-muted-foreground">
                    Unidad
                  </th>
                  {days.map((day) => {
                    const { weekday, dayMonth } = formatGridDay(day)
                    return (
                      <th
                        key={day}
                        scope="col"
                        className={cn(
                          'border-b border-l px-1 py-2 text-center font-medium',
                          day === today ? 'bg-primary/10 text-primary' : 'text-muted-foreground',
                        )}
                      >
                        <div className="capitalize">{weekday}</div>
                        <div>{dayMonth}</div>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {UNITS.map((unit) => (
                  <tr key={unit.id}>
                    <th scope="row" className="border-b px-3 py-2 text-left text-sm font-medium">
                      {unit.name}
                    </th>
                    {days.map((day, i) => {
                      const res = reservations.find((r) => r.unitId === unit.id && occupiesNight(r, day))
                      const highlighted = rangeValid && day >= from && day < to
                      if (!res) {
                        return (
                          <td
                            key={day}
                            className={cn('h-14 border-b border-l', highlighted && 'bg-primary/5')}
                          >
                            <span className="sr-only">Disponible</span>
                          </td>
                        )
                      }
                      const isStart = res.checkIn === day || i === 0
                      const isEnd = addDays(day, 1) === res.checkOut
                      const span = Math.min(countNights(day, res.checkOut), DAYS_SHOWN - i)
                      return (
                        <td
                          key={day}
                          className={cn('relative h-14 border-b p-0 py-1.5', isStart ? 'border-l' : 'border-l-0')}
                        >
                          <Link
                            href={`/reservas/${res.id}`}
                            title={`${res.guest.name} · ${formatDate(res.checkIn)} → ${formatDate(res.checkOut)}`}
                            className={cn(
                              'flex h-full items-center bg-occupied hover:opacity-90',
                              isStart && 'ml-1 rounded-l-md',
                              isEnd && 'mr-1 rounded-r-md',
                            )}
                          >
                            {isStart ? (
                              <span
                                className="absolute top-1.5 bottom-1.5 left-2.5 z-10 flex items-center text-[11px] leading-tight font-medium text-primary-foreground"
                                style={{ width: `calc(${span * 100}% - 1.125rem)` }}
                              >
                                <span className="line-clamp-2 break-words">{res.guest.name}</span>
                              </span>
                            ) : (
                              <span className="sr-only">{res.guest.name}</span>
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
        )}
        <div className="flex flex-wrap items-center gap-4 border-t px-4 py-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="size-3 rounded-sm bg-occupied" aria-hidden="true" /> Ocupada
          </span>
          <span className="flex items-center gap-2">
            <span className="size-3 rounded-sm border bg-card" aria-hidden="true" /> Disponible
          </span>
          <Link href="/reservas/nueva" className={cn(buttonVariants({ variant: 'link', size: 'sm' }), 'ml-auto h-auto p-0')}>
            + Nueva reserva
          </Link>
        </div>
      </Panel>
    </>
  )
}
