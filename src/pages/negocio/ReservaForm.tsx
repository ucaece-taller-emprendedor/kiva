import { AlertTriangle } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { Alerta, Boton, BotonLink, EstadoVacio } from '@/components/ui'
import { PageHeader, Panel } from '@/components/kiva-ui'
import type { Con } from '@/hooks/useColeccion'
import { buscarConflicto, contarNoches, formatoFechaLarga, formatoPlata, type Reserva } from '@/lib/kiva'
import { validarDatos, type Errores } from '@/lib/validations/form'
import { reservaSchema } from '@/lib/validations/kiva'
import { useNegocio } from '@/negocio/NegocioContext'

const entrada = 'mt-1.5 block min-h-11 w-full rounded-tema border border-borde bg-superficie px-3 text-base text-texto aria-[invalid=true]:border-peligro'

function Campo({ id, etiqueta, error, ayuda, children }: { id: string; etiqueta: string; error?: string | undefined; ayuda?: string | undefined; children: ReactNode }) {
  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="text-sm font-medium">{etiqueta}</label>
      {children}
      {error ? <p className="mt-1 text-xs text-peligro">{error}</p> : ayuda ? <p className="mt-1 text-xs text-suave">{ayuda}</p> : null}
    </div>
  )
}

function Formulario({ inicial }: { inicial?: Con<Reserva> | undefined }) {
  const navegar = useNavigate()
  const { unidades, reservas, guardarReserva } = useNegocio()
  const [guestName, setGuestName] = useState(inicial?.guestName ?? '')
  const [contact, setContact] = useState(inicial?.contact ?? '')
  const [unitId, setUnitId] = useState(inicial?.unitId ?? '')
  const [checkIn, setCheckIn] = useState(inicial?.checkIn ?? '')
  const [checkOut, setCheckOut] = useState(inicial?.checkOut ?? '')
  const [total, setTotal] = useState(inicial ? String(inicial.total) : '')
  const [paid, setPaid] = useState(inicial ? String(inicial.paid) : '0')
  const [errores, setErrores] = useState<Errores>({})
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  const fechasOk = Boolean(checkIn && checkOut && checkOut > checkIn)
  const conflicto = unitId && fechasOk ? buscarConflicto(reservas, { unitId, checkIn, checkOut }, inicial?.id) : null
  const totalN = Number(total) || 0
  const paidN = Number(paid) || 0
  const unidadNombre = unidades.find(u => u.id === unitId)?.nombre ?? ''

  async function enviar(e: FormEvent) {
    e.preventDefault()
    const r = validarDatos(reservaSchema, { guestName, contact, unitId, checkIn, checkOut, total, paid })
    setErrores(r.errores ?? {})
    setError('')
    if (!r.datos || conflicto) return
    setGuardando(true)
    const res = await guardarReserva(r.datos, inicial)
    setGuardando(false)
    if (res.ok) navegar(`/app/reservas/${res.id}`)
    else setError(res.error)
  }

  const inv = (c: string) => (errores[c] ? { 'aria-invalid': true } : {})

  return (
    <form onSubmit={e => void enviar(e)} noValidate className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-6">
        <Panel titulo="Huésped">
          <div className="grid items-start gap-4 p-4 sm:grid-cols-2">
            <Campo id="guestName" etiqueta="Nombre del huésped" error={errores.guestName}>
              <input id="guestName" className={entrada} value={guestName} onChange={e => setGuestName(e.target.value)} autoComplete="off" {...inv('guestName')} />
            </Campo>
            <Campo id="contact" etiqueta="Contacto" ayuda="Teléfono o email" error={errores.contact}>
              <input id="contact" className={entrada} value={contact} onChange={e => setContact(e.target.value)} autoComplete="off" {...inv('contact')} />
            </Campo>
          </div>
        </Panel>

        <Panel titulo="Estadía">
          <div className="grid items-start gap-4 p-4 sm:grid-cols-3">
            <Campo id="unitId" etiqueta="Unidad" error={errores.unitId}>
              <select id="unitId" className={entrada} value={unitId} onChange={e => setUnitId(e.target.value)} {...inv('unitId')}>
                <option value="">Seleccionar…</option>
                {unidades.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
              </select>
            </Campo>
            <Campo id="checkIn" etiqueta="Check-in" error={errores.checkIn}>
              <input id="checkIn" type="date" className={entrada} value={checkIn} onChange={e => setCheckIn(e.target.value)} {...inv('checkIn')} />
            </Campo>
            <Campo id="checkOut" etiqueta="Check-out" error={errores.checkOut} ayuda={fechasOk ? `${contarNoches(checkIn, checkOut)} noche(s)` : undefined}>
              <input id="checkOut" type="date" className={entrada} value={checkOut} min={checkIn || undefined} onChange={e => setCheckOut(e.target.value)} {...inv('checkOut')} />
            </Campo>
          </div>
          {conflicto && (
            <div role="alert" className="mx-4 mb-4 flex gap-3 rounded-tema border border-peligro/30 bg-peligro/5 p-3 text-sm">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-peligro" aria-hidden />
              <div className="flex flex-col gap-1">
                <p className="font-medium text-peligro">{unidadNombre} ya está reservada en esas fechas.</p>
                <p className="text-suave">
                  Se superpone con la reserva de <Link to={`/app/reservas/${conflicto.id}`} className="font-medium text-texto underline">{conflicto.guestName}</Link>{' '}
                  ({formatoFechaLarga(conflicto.checkIn)} → {formatoFechaLarga(conflicto.checkOut)}). Cambiá las fechas o elegí otra unidad.
                </p>
              </div>
            </div>
          )}
        </Panel>

        <Panel titulo="Cobro">
          <div className="grid items-start gap-4 p-4 sm:grid-cols-2">
            <Campo id="total" etiqueta="Importe total" error={errores.total}>
              <input id="total" type="number" inputMode="numeric" min={0} step={1} className={`${entrada} tabular-nums`} value={total} onChange={e => setTotal(e.target.value)} {...inv('total')} />
            </Campo>
            {inicial ? (
              <Campo id="paid" etiqueta="Importe cobrado" ayuda="Para sumar un cobro usá «Registrar pago» en el detalle de la reserva.">
                <p id="paid" className="mt-1.5 flex min-h-11 items-center rounded-tema border border-borde bg-fondo px-3 tabular-nums">{formatoPlata(inicial.paid)}</p>
              </Campo>
            ) : (
              <Campo id="paid" etiqueta="Importe cobrado" ayuda="Seña recibida hasta ahora (se guarda como registro de prueba)" error={errores.paid}>
                <input id="paid" type="number" inputMode="numeric" min={0} step={1} className={`${entrada} tabular-nums`} value={paid} onChange={e => setPaid(e.target.value)} {...inv('paid')} />
              </Campo>
            )}
          </div>
        </Panel>
      </div>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
        <Panel titulo="Resumen">
          <dl className="flex flex-col gap-3 p-4 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-suave">Importe total</dt><dd className="tabular-nums">{formatoPlata(totalN)}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-suave">Cobrado</dt><dd className="tabular-nums">{formatoPlata(inicial ? inicial.paid : paidN)}</dd></div>
            <div className="flex justify-between gap-4 border-t border-borde pt-3">
              <dt className="font-medium">Saldo pendiente</dt>
              <dd className={`text-base font-semibold tabular-nums ${totalN - (inicial ? inicial.paid : paidN) > 0 ? 'text-aviso-texto' : totalN - (inicial ? inicial.paid : paidN) < 0 ? 'text-peligro' : 'text-ok'}`} aria-live="polite">
                {formatoPlata(totalN - (inicial ? inicial.paid : paidN))}
              </dd>
            </div>
          </dl>
        </Panel>
        {error && <Alerta>{error}</Alerta>}
        <div className="flex flex-col gap-2">
          <Boton type="submit" className="w-full" disabled={Boolean(conflicto) || guardando}>{guardando ? 'Guardando…' : inicial ? 'Guardar cambios' : 'Guardar reserva'}</Boton>
          <BotonLink to={inicial ? `/app/reservas/${inicial.id}` : '/app/reservas'} variante="fantasma" className="w-full">Cancelar</BotonLink>
        </div>
      </aside>
    </form>
  )
}

export function ReservaNueva() {
  const { unidades } = useNegocio()
  return (
    <>
      <PageHeader titulo="Nueva reserva" descripcion="Cargá los datos de la estadía. No se permiten fechas superpuestas en una misma unidad." />
      {unidades.length === 0 ? (
        <EstadoVacio>
          Primero cargá al menos una unidad. <Link to="/app/unidades" className="font-semibold text-primario">Ir a Unidades</Link>
        </EstadoVacio>
      ) : (
        <Formulario />
      )}
    </>
  )
}

export function ReservaEditar() {
  const { id } = useParams()
  const { reservas } = useNegocio()
  const r = reservas.find(x => x.id === id)
  if (!r) return <EstadoVacio>No encontramos esta reserva. <Link to="/app/reservas" className="font-semibold text-primario">Volver a Reservas</Link></EstadoVacio>
  return (
    <>
      <PageHeader titulo="Editar reserva" descripcion={r.guestName} />
      <Formulario inicial={r} />
    </>
  )
}
