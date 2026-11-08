// Tipos y utilidades de KIVA (portadas del prototipo original).
// Las fechas se guardan como texto local "AAAA-MM-DD": comparar texto equivale a comparar fechas.

export type Alojamiento = { nombre: string; whatsapp: string; email: string; isDemo: boolean }

export type Unidad = { nombre: string; tipo: string; capacidad: number; comodidades: string[]; isDemo: boolean }

export type EstadoReserva = 'confirmada' | 'consulta' | 'rechazada'

export type Reserva = {
  unitId: string
  unitName: string
  alojamientoNombre: string
  guestName: string
  contact: string
  checkIn: string
  checkOut: string
  total: number
  paid: number
  estado: EstadoReserva
  clientId: string | null
  isDemo: boolean
}

/** Pago SIMULADO: no hay pasarela, es solo un registro del dueño ("Registro de prueba"). */
export type Pago = { reservaId: string; monto: number; nota: string; simulado: true; isDemo: boolean }

export const ETIQUETA_PAGO = 'Registro de prueba'

export function saldo(r: Pick<Reserva, 'total' | 'paid'>) {
  return r.total - r.paid
}

function parseISO(iso: string) {
  const [y, m, d] = iso.split('-').map(Number) as [number, number, number]
  return new Date(y, m - 1, d)
}

export function toISO(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function hoyISO() {
  return toISO(new Date())
}

export function sumarDias(iso: string, dias: number) {
  const date = parseISO(iso)
  date.setDate(date.getDate() + dias)
  return toISO(date)
}

export function contarNoches(checkIn: string, checkOut: string) {
  return Math.round((parseISO(checkOut).getTime() - parseISO(checkIn).getTime()) / 86_400_000)
}

/** Una reserva ocupa las noches desde el check-in hasta el check-out (sin incluirlo). */
export function ocupaNoche(r: Pick<Reserva, 'checkIn' | 'checkOut'>, dia: string) {
  return r.checkIn <= dia && dia < r.checkOut
}

export function rangosSeSuperponen(aIni: string, aFin: string, bIni: string, bFin: string) {
  return aIni < bFin && bIni < aFin
}

/** Lista de noches (AAAA-MM-DD) que ocupa una estadía. */
export function nochesDe(checkIn: string, checkOut: string) {
  const n = contarNoches(checkIn, checkOut)
  return Array.from({ length: Math.max(0, n) }, (_, i) => sumarDias(checkIn, i))
}

/** Id del documento de ocupación de una noche: único por unidad y fecha (impide la doble reserva). */
export const idNoche = (unitId: string, fecha: string) => `${unitId}_${fecha}`

type ConId<T> = T & { id: string }

/** Primera reserva confirmada de la misma unidad que se superpone con las fechas pedidas. */
export function buscarConflicto(
  reservas: ConId<Reserva>[],
  candidata: Pick<Reserva, 'unitId' | 'checkIn' | 'checkOut'>,
  excluirId?: string,
) {
  return (
    reservas.find(
      r => r.id !== excluirId && r.estado === 'confirmada' && r.unitId === candidata.unitId && rangosSeSuperponen(r.checkIn, r.checkOut, candidata.checkIn, candidata.checkOut),
    ) ?? null
  )
}

const formatoMoneda = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
export const formatoPlata = (v: number) => formatoMoneda.format(v)

const formatoFecha = new Intl.DateTimeFormat('es-AR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
export const formatoFechaLarga = (iso: string) => formatoFecha.format(parseISO(iso))

const formatoCorto = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
export function formatoFechaCorta(iso: string) {
  const partes = formatoCorto.formatToParts(parseISO(iso))
  const dato = (t: string) => partes.find(p => p.type === t)?.value ?? ''
  return `${dato('day')} ${dato('month')} ${dato('year')}`
}

const diaSemana = new Intl.DateTimeFormat('es-AR', { weekday: 'short' })
const diaMes = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' })
export function formatoDiaGrilla(iso: string) {
  const d = parseISO(iso)
  return { diaSemana: diaSemana.format(d), diaMes: diaMes.format(d) }
}
