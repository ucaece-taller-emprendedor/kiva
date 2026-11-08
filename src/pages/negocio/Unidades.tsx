import { useState, type FormEvent } from 'react'
import { Alerta, Boton, Campo, Tarjeta, EstadoVacio } from '@/components/ui'
import { PageHeader, Panel } from '@/components/kiva-ui'
import type { Con } from '@/hooks/useColeccion'
import type { Unidad } from '@/lib/kiva'
import { alojamientoSchema, unidadSchema } from '@/lib/validations/kiva'
import { mensajeDeError, validarFormulario, type Errores } from '@/lib/validations/form'
import { useNegocio } from '@/negocio/NegocioContext'

function FormAlojamiento({ onListo }: { onListo?: () => void }) {
  const { alojamiento, guardarAlojamiento } = useNegocio()
  const [errores, setErrores] = useState<Errores>({})
  const [error, setError] = useState('')
  const [ocupado, setOcupado] = useState(false)
  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const v = validarFormulario(alojamientoSchema, e.currentTarget)
    setErrores(v.errores ?? {})
    if (!v.datos) return
    setOcupado(true)
    setError('')
    try {
      await guardarAlojamiento(v.datos)
      onListo?.()
    } catch (err) {
      setError(mensajeDeError(err))
    } finally {
      setOcupado(false)
    }
  }
  return (
    <form onSubmit={e => void enviar(e)} noValidate className="space-y-3">
      <Campo etiqueta="Nombre del alojamiento" name="nombre" defaultValue={alojamiento?.nombre ?? ''} error={errores.nombre} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Campo etiqueta="WhatsApp de reservas" name="whatsapp" defaultValue={alojamiento?.whatsapp ?? ''} placeholder="+54 9 223 000-0000" error={errores.whatsapp} />
        <Campo etiqueta="Correo de contacto" name="email" type="email" defaultValue={alojamiento?.email ?? ''} error={errores.email} />
      </div>
      <p className="text-xs text-suave">Los huéspedes ven estos datos al consultar una reserva.</p>
      {error && <Alerta>{error}</Alerta>}
      <Boton type="submit" disabled={ocupado}>{alojamiento ? 'Guardar datos' : 'Crear mi alojamiento'}</Boton>
    </form>
  )
}

/** Primer ingreso de un business aprobado: crea su alojamiento. */
export function ConfigurarAlojamiento() {
  return (
    <div className="mx-auto w-full max-w-xl">
      <Tarjeta>
        <h1 className="text-2xl font-semibold">Configurá tu alojamiento</h1>
        <p className="mb-4 mt-1 text-sm text-suave">Tu cuenta está aprobada. Contanos cómo se llama tu alojamiento para empezar a cargar unidades y reservas.</p>
        <FormAlojamiento />
      </Tarjeta>
    </div>
  )
}

function FormUnidad({ inicial, onListo }: { inicial?: Con<Unidad>; onListo: () => void }) {
  const { guardarUnidad } = useNegocio()
  const [errores, setErrores] = useState<Errores>({})
  const [error, setError] = useState('')
  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const v = validarFormulario(unidadSchema, form)
    setErrores(v.errores ?? {})
    if (!v.datos) return
    setError('')
    try {
      await guardarUnidad(v.datos, inicial?.id)
      form.reset()
      onListo()
    } catch (err) {
      setError(mensajeDeError(err))
    }
  }
  return (
    <form onSubmit={e => void enviar(e)} noValidate className="grid gap-3 sm:grid-cols-2">
      <Campo etiqueta="Nombre" name="nombre" defaultValue={inicial?.nombre ?? ''} error={errores.nombre} />
      <Campo etiqueta="Tipo" name="tipo" defaultValue={inicial?.tipo ?? ''} placeholder="Cabaña de montaña" error={errores.tipo} />
      <Campo etiqueta="Capacidad (personas)" name="capacidad" type="number" min={1} defaultValue={inicial?.capacidad ?? 2} error={errores.capacidad} />
      <Campo etiqueta="Comodidades" name="comodidades" defaultValue={inicial?.comodidades.join(', ') ?? ''} ayuda="Separadas por coma." error={errores.comodidades} />
      {error && <div className="sm:col-span-2"><Alerta>{error}</Alerta></div>}
      <div className="flex gap-2 sm:col-span-2">
        <Boton type="submit">{inicial ? 'Guardar unidad' : 'Agregar unidad'}</Boton>
        {inicial && <Boton variante="borde" onClick={onListo}>Cancelar</Boton>}
      </div>
    </form>
  )
}

export default function Unidades() {
  const { unidades, reservas, borrarUnidad } = useNegocio()
  const [editando, setEditando] = useState<string | null>(null)
  const [aviso, setAviso] = useState('')

  async function borrar(u: Con<Unidad>) {
    if (reservas.some(r => r.unitId === u.id)) return setAviso(`No se puede borrar ${u.nombre}: tiene reservas. Borrá o movés esas reservas primero.`)
    if (!window.confirm(`¿Borrar la unidad ${u.nombre}?`)) return
    setAviso('')
    await borrarUnidad(u.id)
  }

  return (
    <>
      <PageHeader titulo="Unidades" descripcion="Las cabañas y departamentos de tu alojamiento." />
      {aviso && <Alerta tipo="aviso">{aviso}</Alerta>}
      {unidades.length === 0 ? (
        <EstadoVacio>Todavía no cargaste unidades.</EstadoVacio>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2" data-testid="unidades">
          {unidades.map(u => (
            <li key={u.id}>
              <Tarjeta>
                {editando === u.id ? (
                  <FormUnidad inicial={u} onListo={() => setEditando(null)} />
                ) : (
                  <>
                    <p className="text-xs font-medium text-suave">{u.tipo || 'Alojamiento'}</p>
                    <h3 className="text-lg font-bold tracking-tight">{u.nombre}</h3>
                    <p className="text-xs text-suave">Hasta {u.capacidad} persona(s)</p>
                    <ul className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-suave">
                      {u.comodidades.map(c => <li key={c} className="rounded bg-borde/60 px-2 py-0.5">{c}</li>)}
                    </ul>
                    <div className="mt-4 flex gap-2">
                      <Boton variante="borde" onClick={() => setEditando(u.id)}>Editar</Boton>
                      <Boton variante="peligro" onClick={() => void borrar(u)}>Borrar</Boton>
                    </div>
                  </>
                )}
              </Tarjeta>
            </li>
          ))}
        </ul>
      )}
      <Panel titulo="Agregar unidad"><div className="p-4"><FormUnidad onListo={() => undefined} /></div></Panel>
      <Panel titulo="Datos del alojamiento"><div className="p-4"><FormAlojamiento /></div></Panel>
    </>
  )
}
