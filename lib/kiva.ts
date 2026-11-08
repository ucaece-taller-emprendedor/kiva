export type Unit = {
  id: string
  name: string
}

export type Guest = {
  name: string
  contact: string
}

export type Reservation = {
  id: string
  unitId: string
  guest: Guest
  checkIn: string
  checkOut: string
  total: number
  paid: number
}

export type ReservationInput = Omit<Reservation, 'id'>

export const UNITS: Unit[] = [
  { id: 'cabana-1', name: 'Cabaña 1' },
  { id: 'cabana-2', name: 'Cabaña 2' },
  { id: 'cabana-3', name: 'Cabaña 3' },
  { id: 'departamento-1', name: 'Departamento 1' },
]

export function getUnitName(unitId: string) {
  return UNITS.find((u) => u.id === unitId)?.name ?? 'Unidad desconocida'
}

export function getBalance(r: Pick<Reservation, 'total' | 'paid'>) {
  return r.total - r.paid
}

/* Dates are stored as local "YYYY-MM-DD" strings, so lexical comparison equals chronological comparison. */

function parseISO(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function toISO(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayISO() {
  return toISO(new Date())
}

export function addDays(iso: string, days: number) {
  const date = parseISO(iso)
  date.setDate(date.getDate() + days)
  return toISO(date)
}

export function countNights(checkIn: string, checkOut: string) {
  const diff = parseISO(checkOut).getTime() - parseISO(checkIn).getTime()
  return Math.round(diff / 86_400_000)
}

/** A reservation occupies the nights from check-in up to (not including) check-out. */
export function occupiesNight(r: Pick<Reservation, 'checkIn' | 'checkOut'>, day: string) {
  return r.checkIn <= day && day < r.checkOut
}

export function rangesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return aStart < bEnd && bStart < aEnd
}

export function findConflict(
  reservations: Reservation[],
  candidate: Pick<Reservation, 'unitId' | 'checkIn' | 'checkOut'>,
  excludeId?: string,
) {
  return (
    reservations.find(
      (r) =>
        r.id !== excludeId &&
        r.unitId === candidate.unitId &&
        rangesOverlap(r.checkIn, r.checkOut, candidate.checkIn, candidate.checkOut),
    ) ?? null
  )
}

const moneyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

export function formatMoney(value: number) {
  return moneyFormatter.format(value)
}

const dateFormatter = new Intl.DateTimeFormat('es-AR', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

export function formatDate(iso: string) {
  return dateFormatter.format(parseISO(iso))
}

const shortDateFormatter = new Intl.DateTimeFormat('es-AR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

export function formatShortDate(iso: string) {
  const parts = shortDateFormatter.formatToParts(parseISO(iso))
  const pick = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  return `${pick('day')} ${pick('month')} ${pick('year')}`
}

const weekdayFormatter = new Intl.DateTimeFormat('es-AR', { weekday: 'short' })
const dayMonthFormatter = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' })

export function formatGridDay(iso: string) {
  const date = parseISO(iso)
  return { weekday: weekdayFormatter.format(date), dayMonth: dayMonthFormatter.format(date) }
}

export function createDemoReservations(today: string): Reservation[] {
  return [
    {
      id: 'demo-1',
      unitId: 'cabana-1',
      guest: { name: 'Ana Ejemplo (demo)', contact: '+54 9 11 0000-0001' },
      checkIn: addDays(today, -2),
      checkOut: addDays(today, 3),
      total: 250000,
      paid: 250000,
    },
    {
      id: 'demo-2',
      unitId: 'cabana-2',
      guest: { name: 'Bruno Prueba (demo)', contact: 'bruno@ejemplo.com' },
      checkIn: addDays(today, 1),
      checkOut: addDays(today, 5),
      total: 180000,
      paid: 60000,
    },
    {
      id: 'demo-3',
      unitId: 'departamento-1',
      guest: { name: 'Carla Demo (demo)', contact: '+54 9 11 0000-0003' },
      checkIn: today,
      checkOut: addDays(today, 2),
      total: 90000,
      paid: 30000,
    },
    {
      id: 'demo-4',
      unitId: 'cabana-3',
      guest: { name: 'Diego Muestra (demo)', contact: 'diego@ejemplo.com' },
      checkIn: addDays(today, 6),
      checkOut: addDays(today, 10),
      total: 200000,
      paid: 0,
    },
    {
      id: 'demo-5',
      unitId: 'cabana-1',
      guest: { name: 'Elena Ficticia (demo)', contact: '+54 9 11 0000-0005' },
      checkIn: addDays(today, 5),
      checkOut: addDays(today, 8),
      total: 120000,
      paid: 40000,
    },
  ]
}
