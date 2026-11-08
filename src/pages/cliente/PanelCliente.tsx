import { collection, collectionGroup, deleteDoc, doc, query, serverTimestamp, setDoc, where } from 'firebase/firestore'
import { CheckCircle2, MessageSquare, ShieldCheck, XCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useAuth } from '@/auth/useAuth'
import { Alerta, Boton, Cargando, Etiqueta, EstadoVacio, Selector } from '@/components/ui'
import { EtiquetaSaldo, PageHeader, Panel } from '@/components/kiva-ui'
import { useColeccion, type Con } from '@/hooks/useColeccion'
import { db } from '@/lib/firebase'
import { formatoDiaGrilla, formatoFechaCorta, formatoFechaLarga, formatoPlata, hoyISO, idNoche, nochesDe, saldo, sumarDias, type Alojamiento, type Reserva, type Unidad } from '@/lib/kiva'
import { mensajeDeError } from '@/lib/validations/form'

type Noche = { unitId: string; date: string }

const fechaIn = 'min-h-11 rounded-tema border border-borde bg-superficie px-3 text-base'

export default function PanelCliente() {
  const { usuario, perfil } = useAuth()
  const uid = usuario?.uid
  const hoy = hoyISO()
  const [elegido, setElegido] = useState('')
  const [checkIn, setCheckIn] = useState(hoy)
  const [checkOut, setCheckOut] = useState(sumarDias(hoy, 2))
  const [consulta, setConsulta] = useState<Con<Unidad> | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')

  const alojQ = useMemo(() => query(collection(db, 'alojamientos')), [])
  const aloj = useColeccion<Alojamiento>(alojQ)
  const misQ = useMemo(() => (uid ? query(collectionGroup(db, 'reservas'), where('clientId', '==', uid)) : null), [uid])
  const mis = useColeccion<Reserva>(misQ)
  // Por defecto, el alojamiento donde ya tiene reservas; si no, el primero.
  const conReservas = mis.datos[0]?.ruta.split('/')[1]
  const alojamiento = aloj.datos.find(a => a.id === elegido) ?? aloj.datos.find(a => a.id === conReservas) ?? aloj.datos[0]
  const aid = alojamiento?.id

  const unidadesQ = useMemo(() => (aid ? query(collection(db, 'alojamientos', aid, 'unidades')) : null), [aid])
  const ocupacionQ = useMemo(() => (aid ? query(collection(db, 'alojamientos', aid, 'ocupacion')) : null), [aid])
  const unidades = useColeccion<Unidad>(unidadesQ)
  const ocupacion = useColeccion<Noche>(ocupacionQ)

  const ocupadas = useMemo(() => new Set(ocupacion.datos.map(o => idNoche(o.unitId, o.date))), [ocupacion.datos])
  const unidadesOrd = useMemo(() => [...unidades.datos].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')), [unidades.datos])
  const dias7 = useMemo(() => Array.from({ length: 7 }, (_, i) => sumarDias(hoy, i)), [hoy])
  const rangoOk = checkIn < checkOut && checkIn !== '' && checkOut !== ''
  const noches = rangoOk ? nochesDe(checkIn, checkOut) : []
  const estaOcupada = (unitId: string) => noches.some(f => ocupadas.has(idNoche(unitId, f)))
  const reservasPropias = [...mis.datos].sort((a, b) => b.checkIn.localeCompare(a.checkIn))

  async function enviarConsulta() {
    if (!consulta || !aid || !alojamiento || !uid || !perfil) return
    setEnviando(true)
    setError('')
    try {
      await setDoc(doc(collection(db, 'alojamientos', aid, 'reservas')), {
        unitId: consulta.id, unitName: consulta.nombre, alojamientoNombre: alojamiento.nombre,
        guestName: perfil.displayName, contact: perfil.email, checkIn, checkOut, total: 0, paid: 0,
        estado: 'consulta', clientId: uid, isDemo: false, createdAt: serverTimestamp(),
      })
      setAviso(`Enviamos tu consulta por ${consulta.nombre} a ${alojamiento.nombre}. El alojamiento te va a responder para acordar la seña.`)
      setConsulta(null)
    } catch (e) {
      setError(mensajeDeError(e))
    } finally {
      setEnviando(false)
    }
  }
  async function retirar(r: Con<Reserva>) {
    await deleteDoc(doc(db, r.ruta))
  }

  if (aloj.cargando) return <div className="mx-auto max-w-6xl px-4"><Cargando /></div>

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <PageHeader titulo="Consulta de Disponibilidad" descripcion="Verificá las fechas disponibles para tu estadía en nuestras cabañas y departamentos." />

      <div className="flex items-start gap-3 rounded-tema border border-borde bg-superficie p-4 text-xs text-suave">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-ok" aria-hidden />
        <p>
          <strong>Vista para huéspedes:</strong> Podés consultar la disponibilidad en tiempo real. Esta vista protege la privacidad al no mostrar nombres de huéspedes ni datos comerciales o administrativos.
        </p>
      </div>

      {aviso && <Alerta tipo="ok">{aviso}</Alerta>}

      <Panel titulo="Mis reservas y consultas">
        {reservasPropias.length === 0 ? (
          <p className="p-4 text-sm text-suave">Todavía no tenés reservas ni consultas.</p>
        ) : (
          <ul className="divide-y divide-borde" data-testid="mis-reservas">
            {reservasPropias.map(r => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-semibold">{r.unitName} <span className="font-normal text-suave">· {r.alojamientoNombre}</span></p>
                  <p className="text-xs text-suave">{formatoFechaCorta(r.checkIn)} → {formatoFechaCorta(r.checkOut)}</p>
                  {r.estado === 'confirmada' && (
                    <p className="mt-1 text-xs text-suave">Total {formatoPlata(r.total)} · Cobrado {formatoPlata(r.paid)} <span className="text-primario">(registro de prueba)</span></p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {r.estado === 'confirmada' && <><Etiqueta tono="ok">Confirmada</Etiqueta><EtiquetaSaldo saldo={saldo(r)} /></>}
                  {r.estado === 'consulta' && <><Etiqueta tono="aviso">Consulta enviada</Etiqueta><Boton variante="borde" onClick={() => void retirar(r)}>Retirar</Boton></>}
                  {r.estado === 'rechazada' && <Etiqueta tono="peligro">No disponible</Etiqueta>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {aloj.datos.length === 0 ? (
        <EstadoVacio>Todavía no hay alojamientos cargados en KIVA.</EstadoVacio>
      ) : (
        <>
          {aloj.datos.length > 1 && (
            <Selector etiqueta="Alojamiento" value={alojamiento?.id ?? ''} onChange={e => setElegido(e.target.value)}>
              {aloj.datos.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
            </Selector>
          )}
          {aloj.datos.length === 1 && <p className="text-sm text-suave">Alojamiento: <strong className="text-texto">{alojamiento?.nombre}</strong></p>}

          <Panel titulo="Consultar por rango de fechas">
            <div className="grid gap-4 p-4 sm:grid-cols-3">
              <label className="flex flex-col gap-1.5 text-xs font-medium text-suave">
                Fecha de llegada (Check-in)
                <input type="date" min={hoy} value={checkIn} onChange={e => setCheckIn(e.target.value)} className={fechaIn} />
              </label>
              <label className="flex flex-col gap-1.5 text-xs font-medium text-suave">
                Fecha de salida (Check-out)
                <input type="date" min={checkIn ? sumarDias(checkIn, 1) : undefined} value={checkOut} onChange={e => setCheckOut(e.target.value)} className={fechaIn} />
              </label>
              <div className="flex flex-col justify-end">
                <div className="rounded-tema bg-fondo p-2 text-center text-xs text-suave">
                  {rangoOk ? <span>Consulta para estadía del <strong>{formatoFechaLarga(checkIn)}</strong> al <strong>{formatoFechaLarga(checkOut)}</strong></span> : <span className="text-peligro">La fecha de salida debe ser posterior a la de llegada</span>}
                </div>
              </div>
            </div>
          </Panel>

          <div>
            <h2 className="mb-3 text-base font-semibold tracking-tight">Estado de las unidades para las fechas seleccionadas</h2>
            {unidadesOrd.length === 0 ? (
              <EstadoVacio>Este alojamiento todavía no cargó unidades.</EstadoVacio>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2" data-testid="unidades-cliente">
                {unidadesOrd.map(u => {
                  const ocupada = rangoOk && estaOcupada(u.id)
                  return (
                    <div key={u.id} className={`flex flex-col justify-between rounded-tema border bg-superficie p-5 ${ocupada ? 'border-borde opacity-80' : 'border-ok/30'}`}>
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-xs font-medium text-suave">{u.tipo || 'Alojamiento'}</span>
                            <h3 className="text-lg font-bold tracking-tight">{u.nombre}</h3>
                            <span className="text-xs text-suave">Hasta {u.capacidad} persona(s)</span>
                          </div>
                          {ocupada ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-borde/60 px-2.5 py-1 text-xs font-medium text-suave"><XCircle className="size-3.5" aria-hidden /> No disponible</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-md bg-ok/15 px-2.5 py-1 text-xs font-semibold text-ok"><CheckCircle2 className="size-3.5" aria-hidden /> Disponible</span>
                          )}
                        </div>
                        <ul className="mt-4 flex flex-wrap gap-1.5 text-[11px] text-suave">
                          {u.comodidades.map(c => <li key={c} className="rounded bg-borde/60 px-2 py-0.5">{c}</li>)}
                        </ul>
                      </div>
                      <div className="mt-5 flex items-center justify-between border-t border-borde pt-4">
                        <span className="text-xs text-suave">{ocupada ? 'Fechas no disponibles' : 'Fechas libres para reservar'}</span>
                        {!ocupada && rangoOk && (
                          <Boton className="min-h-9 text-xs" onClick={() => { setError(''); setConsulta(u) }}>
                            <MessageSquare className="size-3.5" aria-hidden /> Consultar reserva
                          </Boton>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {consulta && alojamiento && (
            <div role="dialog" aria-modal="true" aria-label="Consulta de reserva" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-md rounded-tema border border-borde bg-superficie p-6 shadow-xl">
                <h3 className="text-lg font-bold">Consulta de reserva para {consulta.nombre}</h3>
                <p className="mt-1 text-xs text-suave">Estadía del {formatoFechaLarga(checkIn)} al {formatoFechaLarga(checkOut)}.</p>
                <div className="mt-4 space-y-2 rounded-tema bg-fondo p-3 text-xs text-suave">
                  <p className="font-medium text-texto">Canal de atención directa del alojamiento:</p>
                  {alojamiento.whatsapp && <p>📱 WhatsApp de reservas: <strong>{alojamiento.whatsapp}</strong></p>}
                  {alojamiento.email && <p>📧 Correo: <strong>{alojamiento.email}</strong></p>}
                  <p className="border-t border-borde pt-2 text-[11px]">
                    En KIVA, las consultas de huéspedes son revisadas y confirmadas por el administrador desde el panel de gestión para acordar la seña y garantizar un trato personalizado. Enviar la consulta no confirma la reserva ni genera ningún cobro.
                  </p>
                </div>
                {error && <div className="mt-3"><Alerta>{error}</Alerta></div>}
                <div className="mt-6 flex justify-end gap-2">
                  <Boton variante="borde" onClick={() => setConsulta(null)}>Cerrar consulta</Boton>
                  <Boton onClick={() => void enviarConsulta()} disabled={enviando}>{enviando ? 'Enviando…' : 'Enviar consulta'}</Boton>
                </div>
              </div>
            </div>
          )}

          <Panel titulo="Disponibilidad para los próximos 7 días">
            <div className="overflow-x-auto p-4">
              <table className="w-full min-w-[560px] text-center text-sm">
                <thead>
                  <tr className="border-b border-borde bg-fondo text-xs text-suave">
                    <th scope="col" className="p-2 text-left font-medium">Unidad</th>
                    {dias7.map(d => {
                      const f = formatoDiaGrilla(d)
                      return <th key={d} scope="col" className="p-2 font-medium"><div>{f.diaSemana}</div><div className="text-[11px]">{f.diaMes}</div></th>
                    })}
                  </tr>
                </thead>
                <tbody>
                  {unidadesOrd.map(u => (
                    <tr key={u.id} className="border-b border-borde last:border-b-0">
                      <td className="p-2.5 text-left font-medium">{u.nombre}</td>
                      {dias7.map(d => (
                        <td key={d} className="p-2">
                          {ocupadas.has(idNoche(u.id, d)) ? (
                            <span className="inline-block size-6 select-none rounded bg-borde/70 text-[10px] font-medium leading-6 text-suave" title="Ocupada">—</span>
                          ) : (
                            <span className="inline-block size-6 select-none rounded bg-ok/20 text-[10px] font-bold leading-6 text-ok" title="Disponible">✓</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 flex items-center justify-end gap-4 text-xs text-suave">
                <span className="flex items-center gap-1.5"><span className="inline-block size-3 rounded bg-ok/20 text-center text-[9px] font-bold leading-3 text-ok">✓</span> Disponible</span>
                <span className="flex items-center gap-1.5"><span className="inline-block size-3 rounded bg-borde/70 text-center text-[9px] leading-3 text-suave">—</span> Ocupada</span>
              </div>
            </div>
          </Panel>
        </>
      )}
    </div>
  )
}
