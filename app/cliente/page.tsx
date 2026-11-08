'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Eye,
  Home,
  Info,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Users,
  XCircle,
} from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { LoadingState, PageHeader, Panel } from '@/components/kiva-ui'
import { useReservations } from '@/components/reservations-provider'
import {
  UNITS,
  addDays,
  formatDate,
  formatGridDay,
  occupiesNight,
  rangesOverlap,
  todayISO,
} from '@/lib/kiva'
import { cn } from '@/lib/utils'

const UNIT_DETAILS: Record<string, { type: string; capacity: string; features: string[] }> = {
  'cabana-1': {
    type: 'Cabaña de montaña',
    capacity: 'Hasta 4 personas',
    features: ['2 dormitorios', 'Cocina equipada', 'Galería con parrilla'],
  },
  'cabana-2': {
    type: 'Cabaña familiar',
    capacity: 'Hasta 4 personas',
    features: ['2 dormitorios', 'Vista al parque', 'Estacionamiento propio'],
  },
  'cabana-3': {
    type: 'Cabaña grande',
    capacity: 'Hasta 6 personas',
    features: ['3 dormitorios', 'Hogar a leña', 'Deck exterior privado'],
  },
  'departamento-1': {
    type: 'Departamento temporario',
    capacity: 'Hasta 2 personas',
    features: ['Monoambiente amplio', 'Balcón con vista', 'Kitchinette'],
  },
}

export default function ClientePage() {
  const { reservations, ready } = useReservations()
  const today = todayISO()

  const [checkIn, setCheckIn] = useState(today)
  const [checkOut, setCheckOut] = useState(addDays(today, 2))
  const [consultUnit, setConsultUnit] = useState<string | null>(null)

  // Generate 7 days for the public visual calendar
  const nextDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(today, i))
  }, [today])

  if (!ready) return <LoadingState />

  const validRange = checkIn < checkOut

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeader
          title="Consulta de Disponibilidad"
          description="Verificá las fechas disponibles para tu estadía en nuestras cabañas y departamentos."
        />
        <Link
          href="/acceso"
          className={cn(
            buttonVariants({ variant: 'outline', size: 'sm' }),
            'gap-1.5 text-xs text-muted-foreground hover:text-foreground shrink-0',
          )}
        >
          <Users className="size-3.5" aria-hidden="true" />
          Cambiar perfil
        </Link>
      </div>

      {/* Privacy Guarantee Notice */}
      <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 text-xs text-muted-foreground">
        <ShieldCheck className="size-4 shrink-0 text-success mt-0.5" aria-hidden="true" />
        <p>
          <strong>Vista pública para huéspedes:</strong> Podés consultar la disponibilidad en tiempo real.
          Esta vista protege la privacidad al no mostrar nombres de huéspedes ni datos comerciales o administrativos.
        </p>
      </div>

      {/* Date Search Filter */}
      <Panel title="Consultar por rango de fechas">
        <div className="p-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="checkin" className="text-xs font-medium text-muted-foreground">
                Fecha de llegada (Check-in)
              </label>
              <input
                id="checkin"
                type="date"
                min={today}
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="rounded-md border bg-background px-3 py-2 text-sm focus:outline-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="checkout" className="text-xs font-medium text-muted-foreground">
                Fecha de salida (Check-out)
              </label>
              <input
                id="checkout"
                type="date"
                min={addDays(checkIn, 1)}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="rounded-md border bg-background px-3 py-2 text-sm focus:outline-primary"
              />
            </div>

            <div className="flex flex-col justify-end">
              <div className="rounded-md bg-muted/50 p-2 text-center text-xs text-muted-foreground">
                {validRange ? (
                  <span>
                    Consulta para estadía del <strong>{formatDate(checkIn)}</strong> al{' '}
                    <strong>{formatDate(checkOut)}</strong>
                  </span>
                ) : (
                  <span className="text-destructive">La fecha de salida debe ser posterior a la de llegada</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Panel>

      {/* Available Units Cards Grid */}
      <div>
        <h2 className="text-base font-semibold tracking-tight mb-3">
          Estado de las unidades para las fechas seleccionadas
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {UNITS.map((unit) => {
            const detail = UNIT_DETAILS[unit.id] ?? {
              type: 'Alojamiento',
              capacity: 'Consultar',
              features: ['Equipamiento estándar'],
            }

            // Check if occupied in candidate range WITHOUT exposing who booked it
            const isOccupied =
              validRange &&
              reservations.some(
                (r) =>
                  r.unitId === unit.id &&
                  rangesOverlap(r.checkIn, r.checkOut, checkIn, checkOut),
              )

            return (
              <div
                key={unit.id}
                className={cn(
                  'flex flex-col justify-between rounded-lg border bg-card p-5 transition-all',
                  isOccupied ? 'border-border/60 opacity-80' : 'border-success/30 shadow-xs',
                )}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">{detail.type}</span>
                      <h3 className="text-lg font-bold tracking-tight">{unit.name}</h3>
                      <span className="text-xs text-muted-foreground">{detail.capacity}</span>
                    </div>

                    <div>
                      {isOccupied ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                          <XCircle className="size-3.5 text-muted-foreground" aria-hidden="true" />
                          No disponible
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-success/15 px-2.5 py-1 text-xs font-semibold text-success">
                          <CheckCircle2 className="size-3.5 text-success" aria-hidden="true" />
                          Disponible
                        </span>
                      )}
                    </div>
                  </div>

                  <ul className="mt-4 flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
                    {detail.features.map((f) => (
                      <li key={f} className="rounded bg-muted px-2 py-0.5">
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5 pt-4 border-t flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {isOccupied ? 'Fechas no disponibles' : 'Fechas libres para reservar'}
                  </span>

                  {!isOccupied && validRange && (
                    <button
                      type="button"
                      onClick={() => setConsultUnit(unit.id)}
                      className={cn(buttonVariants({ size: 'sm' }), 'text-xs gap-1.5')}
                    >
                      <MessageSquare className="size-3.5" aria-hidden="true" />
                      Consultar reserva
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal / Card for Consultation (Demostrativo - does NOT auto-create confirmed bookings) */}
      {consultUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-xl">
            <h3 className="text-lg font-bold">Consulta de reserva para {UNITS.find((u) => u.id === consultUnit)?.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Estadía del {formatDate(checkIn)} al {formatDate(checkOut)}.
            </p>

            <div className="mt-4 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground space-y-2">
              <p className="font-medium text-foreground">Canal de atención directa del alojamiento:</p>
              <p>📱 WhatsApp de reservas: <strong>+54 9 11 0000-0000</strong></p>
              <p>📧 Correo: <strong>contacto@kiva-alojamientos.demo</strong></p>
              <p className="text-[11px] text-muted-foreground border-t pt-2">
                En KIVA, las consultas de huéspedes son revisadas y confirmadas por el administrador desde el panel
                de gestión para acordar la seña y garantizar un trato personalizado.
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConsultUnit(null)}
                className={cn(buttonVariants({ variant: 'default', size: 'sm' }))}
              >
                Cerrar consulta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7-Day Public Availability Calendar (Strict Privacy: only shows free vs occupied) */}
      <Panel title="Disponibilidad para los próximos 7 días">
        <div className="overflow-x-auto p-4">
          <table className="w-full min-w-[560px] text-sm text-center">
            <thead>
              <tr className="border-b bg-muted/20 text-xs text-muted-foreground">
                <th scope="col" className="p-2 text-left font-medium">Unidad</th>
                {nextDays.map((day) => {
                  const { weekday, dayMonth } = formatGridDay(day)
                  return (
                    <th key={day} scope="col" className="p-2 font-medium">
                      <div>{weekday}</div>
                      <div className="text-[11px] text-muted-foreground">{dayMonth}</div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {UNITS.map((unit) => (
                <tr key={unit.id} className="border-b last:border-b-0 hover:bg-muted/30">
                  <td className="p-2.5 text-left font-medium">{unit.name}</td>
                  {nextDays.map((day) => {
                    const isOccupied = reservations.some(
                      (r) => r.unitId === unit.id && occupiesNight(r, day),
                    )

                    return (
                      <td key={day} className="p-2">
                        {isOccupied ? (
                          <span
                            className="inline-block size-6 rounded bg-muted text-[10px] leading-6 font-medium text-muted-foreground select-none"
                            title="Ocupada"
                          >
                            —
                          </span>
                        ) : (
                          <span
                            className="inline-block size-6 rounded bg-success/20 text-[10px] leading-6 font-bold text-success select-none"
                            title="Disponible"
                          >
                            ✓
                          </span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 flex items-center justify-end gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="inline-block size-3 rounded bg-success/20 text-success text-[9px] font-bold text-center leading-3">✓</span>
              <span>Disponible</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block size-3 rounded bg-muted text-muted-foreground text-[9px] text-center leading-3">—</span>
              <span>Ocupada</span>
            </div>
          </div>
        </div>
      </Panel>
    </>
  )
}
