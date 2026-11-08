import { CalendarDays, Pencil, Trash2 } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { Alerta, Boton, BotonLink, Campo, EstadoVacio } from '@/components/ui'
import { EtiquetaPrueba, EtiquetaSaldo, PageHeader, Panel } from '@/components/kiva-ui'
import { contarNoches, formatoFechaLarga, formatoPlata, saldo } from '@/lib/kiva'
import { validarFormulario, type Errores } from '@/lib/validations/form'
import { pagoSchema } from '@/lib/validations/kiva'
import { useNegocio } from '@/negocio/NegocioContext'

function Fila({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
      <dt className="text-sm text-suave">{etiqueta}</dt>
      <dd className="text-sm font-medium sm:text-right">{children}</dd>
    </div>
  )
}

export default function ReservaDetalle() {
  const { id } = useParams()
  const navegar = useNavigate()
  const { reservas, pagos, registrarPago, borrarReserva } = useNegocio()
  const [errores, setErrores] = useState<Errores>({})
  const [error, setError] = useState('')
  const r = reservas.find(x => x.id === id)

  if (!r) {
    return (
      <EstadoVacio>
        No encontramos esta reserva. Puede que el enlace sea incorrecto. <Link to="/app/reservas" className="font-semibold text-primario">Volver a Reservas</Link>
      </EstadoVacio>
    )
  }
  const reserva = r
  const s = saldo(reserva)
  const susPagos = pagos.filter(p => p.reservaId === reserva.id).sort((a, b) => a.id.localeCompare(b.id))

  async function pagar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const v = validarFormulario(pagoSchema, form)
    setErrores(v.errores ?? {})
    setError('')
    if (!v.datos) return
    const res = await registrarPago(reserva, v.datos.monto, v.datos.nota || ETIQUETA_NOTA)
    if (res.ok) form.reset()
    else setError(res.error)
  }
  async function borrar() {
    if (!window.confirm(`¿Borrar la reserva de ${reserva.guestName}? Se libera la unidad y se eliminan sus pagos de prueba.`)) return
    await borrarReserva(reserva)
    navegar('/app/reservas')
  }

  return (
    <>
      <div className="text-sm"><Link to="/app/reservas" className="text-suave hover:text-texto">← Reservas</Link></div>
      <PageHeader
        titulo={reserva.guestName}
        descripcion={`${reserva.unitName} · ${contarNoches(reserva.checkIn, reserva.checkOut)} noche(s)`}
        acciones={
          <>
            <BotonLink to={`/app/disponibilidad?desde=${reserva.checkIn}`} variante="borde"><CalendarDays className="size-4" aria-hidden /> Ver en disponibilidad</BotonLink>
            <BotonLink to={`/app/reservas/${reserva.id}/editar`}><Pencil className="size-4" aria-hidden /> Editar</BotonLink>
            <Boton variante="peligro" onClick={() => void borrar()}><Trash2 className="size-4" aria-hidden /> Borrar</Boton>
          </>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Panel titulo="Estadía">
          <dl className="flex flex-col gap-3 p-4">
            <Fila etiqueta="Unidad">{reserva.unitName}</Fila>
            <Fila etiqueta="Check-in">{formatoFechaLarga(reserva.checkIn)}</Fila>
            <Fila etiqueta="Check-out">{formatoFechaLarga(reserva.checkOut)}</Fila>
            <Fila etiqueta="Huésped">{reserva.guestName}</Fila>
            <Fila etiqueta="Contacto">{reserva.contact}</Fila>
            {reserva.clientId && <Fila etiqueta="Origen">Consulta de un huésped registrado</Fila>}
          </dl>
        </Panel>
        <Panel titulo="Cobro">
          <dl className="flex flex-col gap-3 p-4">
            <Fila etiqueta="Importe total"><span className="tabular-nums">{formatoPlata(reserva.total)}</span></Fila>
            <Fila etiqueta="Importe cobrado"><span className="tabular-nums">{formatoPlata(reserva.paid)}</span></Fila>
            <div className="flex items-center justify-between gap-4 border-t border-borde pt-3">
              <dt className="text-sm font-medium">Saldo pendiente</dt>
              <dd><EtiquetaSaldo saldo={s} /></dd>
            </div>
          </dl>
        </Panel>
      </div>

      <Panel titulo="Pagos">
        <div className="flex flex-col gap-4 p-4">
          <p className="text-xs text-suave">Los pagos son registros simulados para llevar el saldo: KIVA no cobra ni se conecta con ninguna pasarela de pago.</p>
          {susPagos.length === 0 ? (
            <p className="text-sm text-suave">Todavía no hay pagos registrados.</p>
          ) : (
            <ul className="divide-y divide-borde rounded-tema border border-borde" data-testid="pagos">
              {susPagos.map(p => (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm">
                  <span>{p.nota || ETIQUETA_NOTA} <EtiquetaPrueba /></span>
                  <span className="font-medium tabular-nums">{formatoPlata(p.monto)}</span>
                </li>
              ))}
            </ul>
          )}
          {s > 0 ? (
            <form onSubmit={e => void pagar(e)} noValidate className="grid items-start gap-3 sm:grid-cols-[160px_1fr_auto]">
              <Campo etiqueta="Importe" name="monto" type="number" inputMode="numeric" min={1} step={1} defaultValue={String(s)} error={errores.monto} />
              <Campo etiqueta="Nota (opcional)" name="nota" placeholder="Ej.: pago en efectivo" error={errores.nota} />
              <Boton type="submit" className="sm:mt-6">Registrar pago</Boton>
            </form>
          ) : (
            <p className="text-sm text-ok">La reserva está paga.</p>
          )}
          {error && <Alerta>{error}</Alerta>}
        </div>
      </Panel>
    </>
  )
}

const ETIQUETA_NOTA = 'Registro de prueba'
