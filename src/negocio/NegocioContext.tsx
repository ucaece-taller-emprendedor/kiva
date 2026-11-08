import { collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, setDoc, updateDoc, writeBatch } from 'firebase/firestore'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from '@/auth/useAuth'
import { useColeccion, type Con } from '@/hooks/useColeccion'
import { db } from '@/lib/firebase'
import { buscarConflicto, idNoche, nochesDe, type Alojamiento, type Pago, type Reserva, type Unidad } from '@/lib/kiva'

export type DatosReserva = { unitId: string; guestName: string; contact: string; checkIn: string; checkOut: string; total: number; paid: number }
export type Resultado = { ok: true; id: string } | { ok: false; error: string }

type NegocioValor = {
  /** undefined mientras carga; null si todavía no configuró su alojamiento. */
  alojamiento: Con<Alojamiento> | null | undefined
  unidades: Con<Unidad>[]
  reservas: Con<Reserva>[]
  pagos: Con<Pago>[]
  listo: boolean
  error: string | null
  guardarAlojamiento: (d: { nombre: string; whatsapp: string; email: string }) => Promise<void>
  guardarReserva: (d: DatosReserva, existente?: Con<Reserva>) => Promise<Resultado>
  confirmarConsulta: (r: Con<Reserva>, total: number) => Promise<Resultado>
  rechazarConsulta: (r: Con<Reserva>) => Promise<void>
  borrarReserva: (r: Con<Reserva>) => Promise<void>
  registrarPago: (r: Con<Reserva>, monto: number, nota: string) => Promise<Resultado>
  guardarUnidad: (d: Pick<Unidad, 'nombre' | 'tipo' | 'capacidad' | 'comodidades'>, id?: string) => Promise<void>
  borrarUnidad: (id: string) => Promise<void>
}

const NegocioContext = createContext<NegocioValor | null>(null)

// eslint-disable-next-line react-refresh/only-export-components
export function useNegocio() {
  const v = useContext(NegocioContext)
  if (!v) throw new Error('useNegocio va dentro de <NegocioProvider>')
  return v
}

const ERROR_NOCHE = 'Esa unidad ya está reservada en alguna de esas noches. Cambiá las fechas o elegí otra unidad.'

/** Datos del alojamiento del business que inició sesión (su id es su uid). Todo en tiempo real. */
export function NegocioProvider({ children }: { children: ReactNode }) {
  const { usuario } = useAuth()
  const aid = usuario?.uid ?? ''
  const [alojamiento, setAlojamiento] = useState<Con<Alojamiento> | null | undefined>(undefined)

  useEffect(() => {
    if (!aid) return
    return onSnapshot(
      doc(db, 'alojamientos', aid),
      snap => setAlojamiento(snap.exists() ? { id: snap.id, ruta: snap.ref.path, ...(snap.data() as Alojamiento) } : null),
      () => setAlojamiento(null),
    )
  }, [aid])

  const unidadesQ = useMemo(() => (aid ? query(collection(db, 'alojamientos', aid, 'unidades')) : null), [aid])
  const reservasQ = useMemo(() => (aid ? query(collection(db, 'alojamientos', aid, 'reservas')) : null), [aid])
  const pagosQ = useMemo(() => (aid ? query(collection(db, 'alojamientos', aid, 'pagos')) : null), [aid])
  const u = useColeccion<Unidad>(unidadesQ)
  const r = useColeccion<Reserva>(reservasQ)
  const p = useColeccion<Pago>(pagosQ)

  const unidades = useMemo(() => [...u.datos].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')), [u.datos])

  const guardarAlojamiento = useCallback<NegocioValor['guardarAlojamiento']>(
    async d => {
      if (alojamiento) await updateDoc(doc(db, 'alojamientos', aid), d)
      else await setDoc(doc(db, 'alojamientos', aid), { ...d, isDemo: false, createdAt: serverTimestamp() })
    },
    [aid, alojamiento],
  )

  const guardarReserva = useCallback<NegocioValor['guardarReserva']>(
    async (d, existente) => {
      const unidad = unidades.find(x => x.id === d.unitId)
      if (!unidad || !alojamiento) return { ok: false, error: 'Elegí una unidad válida.' }
      if (buscarConflicto(r.datos, d, existente?.id)) return { ok: false, error: ERROR_NOCHE }
      const col = collection(db, 'alojamientos', aid, 'reservas')
      const ref = existente ? doc(col, existente.id) : doc(col)
      const batch = writeBatch(db)
      const nuevas = nochesDe(d.checkIn, d.checkOut).map(f => idNoche(d.unitId, f))
      const viejas = existente && existente.estado === 'confirmada' ? nochesDe(existente.checkIn, existente.checkOut).map(f => idNoche(existente.unitId, f)) : []
      for (const id of viejas) if (!nuevas.includes(id)) batch.delete(doc(db, 'alojamientos', aid, 'ocupacion', id))
      for (const id of nuevas) {
        if (viejas.includes(id)) continue
        const fecha = id.slice(id.length - 10)
        batch.set(doc(db, 'alojamientos', aid, 'ocupacion', id), { unitId: d.unitId, date: fecha, reservaId: ref.id, isDemo: false })
      }
      if (existente) {
        batch.update(ref, { unitId: d.unitId, unitName: unidad.nombre, guestName: d.guestName, contact: d.contact, checkIn: d.checkIn, checkOut: d.checkOut, total: d.total })
      } else {
        batch.set(ref, { unitId: d.unitId, unitName: unidad.nombre, alojamientoNombre: alojamiento.nombre, guestName: d.guestName, contact: d.contact, checkIn: d.checkIn, checkOut: d.checkOut, total: d.total, paid: d.paid, estado: 'confirmada', clientId: null, isDemo: false, createdAt: serverTimestamp() })
        if (d.paid > 0) batch.set(doc(collection(db, 'alojamientos', aid, 'pagos')), { reservaId: ref.id, monto: d.paid, nota: 'Seña inicial', simulado: true, isDemo: false, createdAt: serverTimestamp() })
      }
      try {
        await batch.commit()
        return { ok: true, id: ref.id }
      } catch (e) {
        return { ok: false, error: codigo(e) === 'permission-denied' ? ERROR_NOCHE : 'No se pudo guardar la reserva. Probá de nuevo.' }
      }
    },
    [aid, alojamiento, unidades, r.datos],
  )

  const confirmarConsulta = useCallback<NegocioValor['confirmarConsulta']>(
    async (res, total) => {
      if (buscarConflicto(r.datos, res, res.id)) return { ok: false, error: ERROR_NOCHE }
      const batch = writeBatch(db)
      for (const f of nochesDe(res.checkIn, res.checkOut)) batch.set(doc(db, 'alojamientos', aid, 'ocupacion', idNoche(res.unitId, f)), { unitId: res.unitId, date: f, reservaId: res.id, isDemo: false })
      batch.update(doc(db, 'alojamientos', aid, 'reservas', res.id), { estado: 'confirmada', total })
      try {
        await batch.commit()
        return { ok: true, id: res.id }
      } catch (e) {
        return { ok: false, error: codigo(e) === 'permission-denied' ? ERROR_NOCHE : 'No se pudo confirmar la consulta.' }
      }
    },
    [aid, r.datos],
  )

  const rechazarConsulta = useCallback<NegocioValor['rechazarConsulta']>(async res => updateDoc(doc(db, 'alojamientos', aid, 'reservas', res.id), { estado: 'rechazada' }), [aid])

  const borrarReserva = useCallback<NegocioValor['borrarReserva']>(
    async res => {
      const batch = writeBatch(db)
      if (res.estado === 'confirmada') for (const f of nochesDe(res.checkIn, res.checkOut)) batch.delete(doc(db, 'alojamientos', aid, 'ocupacion', idNoche(res.unitId, f)))
      for (const pg of p.datos) if (pg.reservaId === res.id) batch.delete(doc(db, 'alojamientos', aid, 'pagos', pg.id))
      batch.delete(doc(db, 'alojamientos', aid, 'reservas', res.id))
      await batch.commit()
    },
    [aid, p.datos],
  )

  const registrarPago = useCallback<NegocioValor['registrarPago']>(
    async (res, monto, nota) => {
      if (res.paid + monto > res.total) return { ok: false, error: 'El pago supera el saldo pendiente de la reserva.' }
      const batch = writeBatch(db)
      const ref = doc(collection(db, 'alojamientos', aid, 'pagos'))
      batch.set(ref, { reservaId: res.id, monto, nota, simulado: true, isDemo: false, createdAt: serverTimestamp() })
      batch.update(doc(db, 'alojamientos', aid, 'reservas', res.id), { paid: res.paid + monto })
      try {
        await batch.commit()
        return { ok: true, id: ref.id }
      } catch {
        return { ok: false, error: 'No se pudo registrar el pago.' }
      }
    },
    [aid],
  )

  const guardarUnidad = useCallback<NegocioValor['guardarUnidad']>(
    async (d, id) => {
      if (id) await updateDoc(doc(db, 'alojamientos', aid, 'unidades', id), d)
      else await setDoc(doc(collection(db, 'alojamientos', aid, 'unidades')), { ...d, isDemo: false, createdAt: serverTimestamp() })
    },
    [aid],
  )
  const borrarUnidad = useCallback<NegocioValor['borrarUnidad']>(async id => deleteDoc(doc(db, 'alojamientos', aid, 'unidades', id)), [aid])

  const valor: NegocioValor = {
    alojamiento,
    unidades,
    reservas: r.datos,
    pagos: p.datos,
    listo: alojamiento !== undefined && !u.cargando && !r.cargando && !p.cargando,
    error: u.error ?? r.error ?? p.error,
    guardarAlojamiento,
    guardarReserva,
    confirmarConsulta,
    rechazarConsulta,
    borrarReserva,
    registrarPago,
    guardarUnidad,
    borrarUnidad,
  }
  return <NegocioContext.Provider value={valor}>{children}</NegocioContext.Provider>
}

function codigo(e: unknown) {
  return typeof e === 'object' && e !== null && 'code' in e ? String((e as { code: unknown }).code) : ''
}
