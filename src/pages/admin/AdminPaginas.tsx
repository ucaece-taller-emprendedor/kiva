import { collection, doc, orderBy, query, updateDoc } from 'firebase/firestore'
import { Building2, CheckCircle2, Clock, Database } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Alerta, Boton, Cargando, EstadoVacio, Etiqueta, Selector } from '@/components/ui'
import { PageHeader, Panel } from '@/components/kiva-ui'
import { ESTADOS, ETIQUETA_ROL, ROLES_REGISTRABLES, type Estado, type Rol } from '@/config/app'
import { useColeccion } from '@/hooks/useColeccion'
import { db } from '@/lib/firebase'
import type { Alojamiento } from '@/lib/kiva'
import { mensajeDeError } from '@/lib/validations/form'

type Usuario = { email: string; displayName: string; role: Rol; status: Estado; isDemo: boolean }

const MODULOS = [
  { nombre: 'Gestión de Reservas', activo: true },
  { nombre: 'Matriz de Disponibilidad', activo: true },
  { nombre: 'Control de Saldos y Cobranzas', activo: true },
  { nombre: 'Channel Manager (OTAs)', activo: false },
  { nombre: 'Facturación Electrónica', activo: false },
]

function useDatosAdmin() {
  const usuarios = useColeccion<Usuario>(useMemo(() => query(collection(db, 'users'), orderBy('email')), []))
  const alojamientos = useColeccion<Alojamiento>(useMemo(() => query(collection(db, 'alojamientos')), []))
  return { usuarios, alojamientos }
}

async function cambiarUsuario(uid: string, campos: Partial<Pick<Usuario, 'status' | 'role'>>) {
  await updateDoc(doc(db, 'users', uid), campos)
}

export function AdminInicio() {
  const { usuarios, alojamientos } = useDatosAdmin()
  const [aviso, setAviso] = useState('')
  const businesses = usuarios.datos.filter(u => u.role === 'business')
  const pendientes = businesses.filter(u => u.status === 'pendiente')

  async function aprobar(uid: string) {
    setAviso('')
    try {
      await cambiarUsuario(uid, { status: 'activo' })
    } catch (e) {
      setAviso(mensajeDeError(e))
    }
  }

  if (usuarios.cargando || alojamientos.cargando) return <Cargando />

  return (
    <div className="space-y-6">
      <PageHeader titulo="Administración" descripcion="Supervisión de la plataforma KIVA: alojamientos registrados y usuarios." />
      {(usuarios.error || alojamientos.error || aviso) && <Alerta>{usuarios.error ?? alojamientos.error ?? aviso}</Alerta>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-1 rounded-tema border border-borde bg-superficie p-4">
          <span className="text-xs font-medium text-suave">Estado de plataforma</span>
          <div className="mt-1 flex items-center gap-2"><span className="size-2 animate-pulse rounded-full bg-ok" /><span className="text-xl font-bold tracking-tight">Operativo</span></div>
          <span className="text-[11px] text-suave">Versión MVP v1.0</span>
        </div>
        <div className="flex flex-col gap-1 rounded-tema border border-borde bg-superficie p-4">
          <span className="text-xs font-medium text-suave">Alojamientos registrados</span>
          <span className="mt-1 text-2xl font-bold tracking-tight" data-testid="total-alojamientos">{alojamientos.datos.length}</span>
          <span className="text-[11px] text-suave">{businesses.length} cuenta(s) business</span>
        </div>
        <div className="flex flex-col gap-1 rounded-tema border border-borde bg-superficie p-4">
          <span className="text-xs font-medium text-suave">Pendientes de aprobación</span>
          <span className="mt-1 text-2xl font-bold tracking-tight" data-testid="pendientes">{pendientes.length}</span>
          <span className="text-[11px] text-suave">{usuarios.datos.length} usuarios en total</span>
        </div>
        <div className="flex flex-col gap-1 rounded-tema border border-borde bg-superficie p-4">
          <span className="text-xs font-medium text-suave">Motor de persistencia</span>
          <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold"><Database className="size-4 text-primario" aria-hidden /> Cloud Firestore</div>
          <span className="text-[11px] text-suave">Reglas de seguridad por alojamiento</span>
        </div>
      </div>

      {pendientes.length > 0 && (
        <Panel titulo="Alojamientos pendientes de aprobación">
          <ul className="divide-y divide-borde">
            {pendientes.map(u => (
              <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 p-4" data-testid={`pendiente-${u.email}`}>
                <div><p className="text-sm font-semibold">{u.displayName}</p><p className="text-xs text-suave">{u.email}</p></div>
                <Boton onClick={() => void aprobar(u.id)} aria-label={`Aprobar a ${u.email}`}>Aprobar</Boton>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2"><TablaAlojamientos /></div>
        <Panel titulo="Estado de Módulos del Sistema">
          <div className="flex flex-col gap-3 p-4 text-xs">
            {MODULOS.map(m => (
              <div key={m.nombre} className={`flex items-center justify-between gap-2 border-b border-borde pb-2.5 last:border-0 last:pb-0 ${m.activo ? '' : 'opacity-60'}`}>
                <div className="flex items-center gap-2">
                  {m.activo ? <CheckCircle2 className="size-4 text-ok" aria-hidden /> : <Clock className="size-4 text-suave" aria-hidden />}
                  <span className={m.activo ? 'font-medium' : ''}>{m.nombre}</span>
                </div>
                {m.activo ? <span className="rounded bg-ok/15 px-2 py-0.5 font-semibold text-ok">Activo (MVP)</span> : <span className="text-suave">Roadmap futuro</span>}
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}

function TablaAlojamientos() {
  const { usuarios, alojamientos } = useDatosAdmin()
  return (
    <Panel titulo="Alojamientos registrados">
      {alojamientos.datos.length === 0 ? (
        <p className="p-4 text-sm text-suave">Todavía no hay alojamientos configurados.</p>
      ) : (
        <ul className="divide-y divide-borde text-sm" data-testid="alojamientos">
          {alojamientos.datos.map(a => {
            const dueño = usuarios.datos.find(u => u.id === a.id)
            return (
              <li key={a.id} className="flex items-start gap-3 p-4">
                <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-tema bg-primario/10 text-primario"><Building2 className="size-4" aria-hidden /></div>
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 font-semibold">{a.nombre} {a.isDemo && <Etiqueta tono="demo">DEMO</Etiqueta>} {dueño && <Etiqueta tono={dueño.status === 'activo' ? 'ok' : 'aviso'}>{dueño.status}</Etiqueta>}</p>
                  <p className="text-xs text-suave">Dueño: {dueño ? `${dueño.displayName} · ${dueño.email}` : a.id}</p>
                  <p className="text-xs text-suave">Identificador: <code>{a.id}</code></p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Panel>
  )
}

export function AdminAlojamientos() {
  return (
    <div className="space-y-4">
      <PageHeader titulo="Alojamientos" descripcion="Instancias de alojamiento registradas en la plataforma." />
      <TablaAlojamientos />
    </div>
  )
}

export function AdminUsuarios() {
  const { datos, cargando, error } = useColeccion<Usuario>(useMemo(() => query(collection(db, 'users'), orderBy('email')), []))
  const [aviso, setAviso] = useState('')

  async function cambiar(uid: string, campos: Partial<Pick<Usuario, 'status' | 'role'>>) {
    setAviso('')
    try {
      await cambiarUsuario(uid, campos)
    } catch (e) {
      setAviso(mensajeDeError(e))
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader titulo="Usuarios" />
      {(error || aviso) && <Alerta>{error ?? aviso}</Alerta>}
      {cargando ? <Cargando /> : datos.length === 0 ? <EstadoVacio>No hay usuarios.</EstadoVacio> : (
        <div className="overflow-x-auto rounded-tema border border-borde bg-superficie">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-borde text-xs uppercase text-suave">
              <tr><th className="p-3">Usuario</th><th className="p-3">Tipo</th><th className="p-3">Estado</th></tr>
            </thead>
            <tbody>
              {datos.map(u => (
                <tr key={u.id} className="border-b border-borde last:border-0" data-testid={`usuario-${u.email}`}>
                  <td className="p-3"><p className="font-medium">{u.displayName} {u.isDemo && <Etiqueta tono="demo">DEMO</Etiqueta>}</p><p className="text-xs text-suave">{u.email}</p></td>
                  <td className="p-3">
                    {u.role === 'admin' ? <Etiqueta>{ETIQUETA_ROL.admin}</Etiqueta> : (
                      <Selector etiqueta="" aria-label={`Tipo de ${u.email}`} value={u.role} onChange={e => void cambiar(u.id, { role: e.target.value as Rol })}>
                        {ROLES_REGISTRABLES.map(r => <option key={r.rol} value={r.rol}>{r.etiqueta}</option>)}
                      </Selector>
                    )}
                  </td>
                  <td className="p-3">
                    <Selector etiqueta="" aria-label={`Estado de ${u.email}`} value={u.status} onChange={e => void cambiar(u.id, { status: e.target.value as Estado })}>
                      {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
                    </Selector>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
