'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertTriangle } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Panel } from '@/components/kiva-ui'
import { useReservations } from '@/components/reservations-provider'
import {
  UNITS,
  countNights,
  findConflict,
  formatDate,
  formatMoney,
  getUnitName,
  type Reservation,
} from '@/lib/kiva'
import { cn } from '@/lib/utils'

type FieldName = 'guestName' | 'contact' | 'unitId' | 'checkIn' | 'checkOut' | 'total' | 'paid'
type Errors = Partial<Record<FieldName, string>>

const inputClass =
  'h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 aria-invalid:border-destructive'

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string
  label: string
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

export function ReservationForm({ initial }: { initial?: Reservation }) {
  const router = useRouter()
  const { reservations, saveReservation } = useReservations()

  const [guestName, setGuestName] = useState(initial?.guest.name ?? '')
  const [contact, setContact] = useState(initial?.guest.contact ?? '')
  const [unitId, setUnitId] = useState(initial?.unitId ?? '')
  const [checkIn, setCheckIn] = useState(initial?.checkIn ?? '')
  const [checkOut, setCheckOut] = useState(initial?.checkOut ?? '')
  const [total, setTotal] = useState(initial ? String(initial.total) : '')
  const [paid, setPaid] = useState(initial ? String(initial.paid) : '0')
  const [errors, setErrors] = useState<Errors>({})

  const totalNum = Number(total) || 0
  const paidNum = Number(paid) || 0
  const balance = totalNum - paidNum
  const datesValid = Boolean(checkIn && checkOut && checkOut > checkIn)
  const conflict =
    unitId && datesValid ? findConflict(reservations, { unitId, checkIn, checkOut }, initial?.id) : null

  function validate(): Errors {
    const next: Errors = {}
    if (!guestName.trim()) next.guestName = 'Ingresá el nombre del huésped.'
    if (!contact.trim()) next.contact = 'Ingresá un teléfono o email de contacto.'
    if (!unitId) next.unitId = 'Elegí una unidad.'
    if (!checkIn) next.checkIn = 'Ingresá la fecha de check-in.'
    if (!checkOut) next.checkOut = 'Ingresá la fecha de check-out.'
    else if (checkIn && checkOut <= checkIn)
      next.checkOut = 'El check-out debe ser posterior al check-in.'
    if (total === '' || !Number.isFinite(Number(total)) || Number(total) < 0)
      next.total = 'Ingresá un importe total válido.'
    if (paid === '' || !Number.isFinite(Number(paid)) || Number(paid) < 0)
      next.paid = 'Ingresá un importe cobrado válido (0 si no hubo cobro).'
    else if (!next.total && Number(paid) > Number(total))
      next.paid = 'El importe cobrado no puede superar el importe total.'
    return next
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0 || conflict) return

    const result = saveReservation(
      {
        unitId,
        guest: { name: guestName.trim(), contact: contact.trim() },
        checkIn,
        checkOut,
        total: Number(total),
        paid: Number(paid),
      },
      initial?.id,
    )
    if (result.ok) router.push(`/reservas/${result.id}`)
  }

  const errorProps = (name: FieldName) =>
    errors[name] ? { 'aria-invalid': true, 'aria-describedby': `${name}-error` } : {}

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-6">
        <Panel title="Huésped">
          <div className="grid items-start gap-4 p-4 sm:grid-cols-2">
            <Field id="guestName" label="Nombre del huésped" error={errors.guestName}>
              <input
                id="guestName"
                className={inputClass}
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                autoComplete="off"
                {...errorProps('guestName')}
              />
            </Field>
            <Field id="contact" label="Contacto" error={errors.contact} hint="Teléfono o email">
              <input
                id="contact"
                className={inputClass}
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                autoComplete="off"
                {...errorProps('contact')}
              />
            </Field>
          </div>
        </Panel>

        <Panel title="Estadía">
          <div className="grid items-start gap-4 p-4 sm:grid-cols-3">
            <Field id="unitId" label="Unidad" error={errors.unitId}>
              <select
                id="unitId"
                className={inputClass}
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
                {...errorProps('unitId')}
              >
                <option value="">Seleccionar…</option>
                {UNITS.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="checkIn" label="Check-in" error={errors.checkIn}>
              <input
                id="checkIn"
                type="date"
                className={inputClass}
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                {...errorProps('checkIn')}
              />
            </Field>
            <Field
              id="checkOut"
              label="Check-out"
              error={errors.checkOut}
              hint={datesValid ? `${countNights(checkIn, checkOut)} noche(s)` : undefined}
            >
              <input
                id="checkOut"
                type="date"
                className={inputClass}
                value={checkOut}
                min={checkIn || undefined}
                onChange={(e) => setCheckOut(e.target.value)}
                {...errorProps('checkOut')}
              />
            </Field>
          </div>

          {conflict && (
            <div
              role="alert"
              className="mx-4 mb-4 flex gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm"
            >
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
              <div className="flex flex-col gap-1">
                <p className="font-medium text-destructive">
                  {getUnitName(unitId)} ya está reservada en esas fechas.
                </p>
                <p className="text-muted-foreground">
                  Se superpone con la reserva de{' '}
                  <Link href={`/reservas/${conflict.id}`} className="font-medium text-foreground underline">
                    {conflict.guest.name}
                  </Link>{' '}
                  ({formatDate(conflict.checkIn)} → {formatDate(conflict.checkOut)}). Cambiá las fechas o
                  elegí otra unidad.
                </p>
              </div>
            </div>
          )}
        </Panel>

        <Panel title="Cobro">
          <div className="grid items-start gap-4 p-4 sm:grid-cols-2">
            <Field id="total" label="Importe total" error={errors.total}>
              <input
                id="total"
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                className={cn(inputClass, 'tabular-nums')}
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                {...errorProps('total')}
              />
            </Field>
            <Field
              id="paid"
              label="Importe cobrado"
              error={errors.paid}
              hint="Seña o pagos recibidos hasta ahora"
            >
              <input
                id="paid"
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                className={cn(inputClass, 'tabular-nums')}
                value={paid}
                onChange={(e) => setPaid(e.target.value)}
                {...errorProps('paid')}
              />
            </Field>
          </div>
        </Panel>
      </div>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
        <Panel title="Resumen">
          <dl className="flex flex-col gap-3 p-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Importe total</dt>
              <dd className="tabular-nums">{formatMoney(totalNum)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Cobrado</dt>
              <dd className="tabular-nums">{formatMoney(paidNum)}</dd>
            </div>
            <div className="flex justify-between gap-4 border-t pt-3">
              <dt className="font-medium">Saldo pendiente</dt>
              <dd
                className={cn(
                  'text-base font-semibold tabular-nums',
                  balance > 0 ? 'text-warning-foreground' : balance < 0 ? 'text-destructive' : 'text-success',
                )}
                aria-live="polite"
              >
                {formatMoney(balance)}
              </dd>
            </div>
          </dl>
        </Panel>
        <div className="flex flex-col gap-2">
          <Button type="submit" size="lg" className="h-11 w-full text-sm font-semibold" disabled={Boolean(conflict)}>
            {initial ? 'Guardar cambios' : 'Guardar reserva'}
          </Button>
          <Link
            href={initial ? `/reservas/${initial.id}` : '/reservas'}
            className={cn(buttonVariants({ variant: 'ghost', size: 'lg' }), 'h-10 w-full text-muted-foreground')}
          >
            Cancelar
          </Link>
        </div>
      </aside>
    </form>
  )
}
