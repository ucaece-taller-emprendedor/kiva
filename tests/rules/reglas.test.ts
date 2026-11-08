import { assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { collection, collectionGroup, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where, writeBatch } from 'firebase/firestore'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'
import { crearEntorno } from './ayuda'

let env: RulesTestEnvironment

beforeAll(async () => {
  env = await crearEntorno('demo-kiva-reglas')
})
afterAll(async () => env.cleanup())

const base = { isDemo: true, createdAt: new Date() }
const reservaBase = { unitId: 'u1', unitName: 'Cabaña 1', alojamientoNombre: 'Aloj Uno', guestName: 'Ana Prueba', contact: 'ana@test.com', checkIn: '2026-12-01', checkOut: '2026-12-05', total: 100000, paid: 20000, estado: 'confirmada' }

beforeEach(async () => {
  await env.clearFirestore()
  await env.withSecurityRulesDisabled(async ctx => {
    const db = ctx.firestore()
    await setDoc(doc(db, 'users/biz1'), { ...base, email: 'biz1@test.com', displayName: 'Dueño Uno', role: 'business', status: 'activo' })
    await setDoc(doc(db, 'users/biz2'), { ...base, email: 'biz2@test.com', displayName: 'Dueño Dos', role: 'business', status: 'activo' })
    await setDoc(doc(db, 'users/bizpend'), { ...base, email: 'bp@test.com', displayName: 'Dueño Pendiente', role: 'business', status: 'pendiente' })
    await setDoc(doc(db, 'users/cli1'), { ...base, email: 'cli1@test.com', displayName: 'Huésped Uno', role: 'client', status: 'activo' })
    await setDoc(doc(db, 'users/cli2'), { ...base, email: 'cli2@test.com', displayName: 'Huésped Dos', role: 'client', status: 'activo' })
    await setDoc(doc(db, 'alojamientos/biz1'), { ...base, nombre: 'Aloj Uno', whatsapp: '', email: '' })
    await setDoc(doc(db, 'alojamientos/biz2'), { ...base, nombre: 'Aloj Dos', whatsapp: '', email: '' })
    await setDoc(doc(db, 'alojamientos/biz1/unidades/u1'), { ...base, nombre: 'Cabaña 1', tipo: 'Cabaña', capacidad: 4, comodidades: ['Parrilla'] })
    await setDoc(doc(db, 'alojamientos/biz2/unidades/u2'), { ...base, nombre: 'Depto 2', tipo: 'Depto', capacidad: 2, comodidades: [] })
    await setDoc(doc(db, 'alojamientos/biz1/reservas/r1'), { ...base, ...reservaBase, clientId: 'cli1' })
    await setDoc(doc(db, 'alojamientos/biz1/reservas/r2'), { ...base, ...reservaBase, guestName: 'Otro Huésped', checkIn: '2026-12-10', checkOut: '2026-12-12', clientId: null })
    await setDoc(doc(db, 'alojamientos/biz1/reservas/c1'), { ...base, ...reservaBase, estado: 'consulta', total: 0, paid: 0, clientId: 'cli1' })
    await setDoc(doc(db, 'alojamientos/biz1/ocupacion/u1_2026-12-01'), { unitId: 'u1', date: '2026-12-01', reservaId: 'r1', isDemo: true })
    await setDoc(doc(db, 'alojamientos/biz1/pagos/p1'), { ...base, reservaId: 'r1', monto: 20000, nota: 'Seña', simulado: true })
  })
})

const como = (uid: string, email = `${uid}@test.com`, claims: Record<string, unknown> = {}) => env.authenticatedContext(uid, { email, ...claims }).firestore()
const anonimo = () => env.unauthenticatedContext().firestore()
const admin = () => como('admin1', 'admin@test.com', { admin: true })

describe('users', () => {
  it('registro: un huésped (client) se crea activo', async () => {
    await assertSucceeds(setDoc(doc(como('nuevo'), 'users/nuevo'), { email: 'nuevo@test.com', displayName: 'Nuevo', role: 'client', status: 'activo', isDemo: false, createdAt: serverTimestamp() }))
  })
  it('registro: un business solo puede crearse pendiente', async () => {
    const db = como('nuevo')
    await assertFails(setDoc(doc(db, 'users/nuevo'), { email: 'nuevo@test.com', displayName: 'Nuevo', role: 'business', status: 'activo', isDemo: false, createdAt: serverTimestamp() }))
    await assertSucceeds(setDoc(doc(db, 'users/nuevo'), { email: 'nuevo@test.com', displayName: 'Nuevo', role: 'business', status: 'pendiente', isDemo: false, createdAt: serverTimestamp() }))
  })
  it('registro: no se puede crear con role admin ni con campos de más', async () => {
    const db = como('nuevo')
    await assertFails(setDoc(doc(db, 'users/nuevo'), { email: 'nuevo@test.com', displayName: 'Nuevo', role: 'admin', status: 'activo', isDemo: false, createdAt: serverTimestamp() }))
    await assertFails(setDoc(doc(db, 'users/nuevo'), { email: 'nuevo@test.com', displayName: 'Nuevo', role: 'client', status: 'activo', isDemo: false, createdAt: serverTimestamp(), admin: true }))
  })
  it('registro: no se puede crear el perfil de otro uid', async () => {
    await assertFails(setDoc(doc(como('nuevo'), 'users/otro'), { email: 'nuevo@test.com', displayName: 'Otro', role: 'client', status: 'activo', isDemo: false, createdAt: serverTimestamp() }))
  })
  it('un usuario NO puede escalar su rol ni su estado', async () => {
    const db = como('cli1')
    await assertFails(updateDoc(doc(db, 'users/cli1'), { role: 'admin' }))
    await assertFails(updateDoc(doc(db, 'users/cli1'), { role: 'business' }))
    await assertFails(updateDoc(doc(db, 'users/cli1'), { status: 'suspendido' }))
    await assertSucceeds(updateDoc(doc(db, 'users/cli1'), { displayName: 'Otro Nombre' }))
  })
  it('un business pendiente NO puede aprobarse solo', async () => {
    await assertFails(updateDoc(doc(como('bizpend'), 'users/bizpend'), { status: 'activo' }))
  })
  it('no puede leer perfiles ajenos; anónimo tampoco; no se lista la colección', async () => {
    await assertFails(getDoc(doc(como('cli1'), 'users/cli2')))
    await assertFails(getDoc(doc(anonimo(), 'users/cli1')))
    await assertFails(getDocs(collection(como('cli1'), 'users')))
    await assertSucceeds(getDoc(doc(como('cli1'), 'users/cli1')))
  })
  it('el admin (claim) lee todos, aprueba, y no puede crear otro admin por Firestore', async () => {
    const db = admin()
    await assertSucceeds(getDocs(collection(db, 'users')))
    await assertSucceeds(updateDoc(doc(db, 'users/bizpend'), { status: 'activo' }))
    await assertFails(deleteDoc(doc(db, 'users/cli1')))
  })
})

describe('alojamientos', () => {
  const nuevo = (extra: Record<string, unknown> = {}) => ({ nombre: 'Mi Alojamiento', whatsapp: '+54 9 223 000-0000', email: 'a@test.com', isDemo: false, createdAt: serverTimestamp(), ...extra })

  it('un business aprobado crea SU alojamiento (id = su uid)', async () => {
    await env.withSecurityRulesDisabled(async ctx => deleteDoc(doc(ctx.firestore(), 'alojamientos/biz2')))
    await assertSucceeds(setDoc(doc(como('biz2'), 'alojamientos/biz2'), nuevo()))
  })
  it('un business PENDIENTE, un huésped o un id ajeno no pueden crear alojamientos', async () => {
    await assertFails(setDoc(doc(como('bizpend'), 'alojamientos/bizpend'), nuevo()))
    await assertFails(setDoc(doc(como('cli1'), 'alojamientos/cli1'), nuevo()))
    await assertFails(setDoc(doc(como('biz2'), 'alojamientos/otro'), nuevo()))
    await assertFails(setDoc(doc(como('biz2'), 'alojamientos/biz2x'), nuevo()))
  })
  it('usuarios activos ven alojamientos; anónimos y pendientes no', async () => {
    await assertSucceeds(getDocs(collection(como('cli1'), 'alojamientos')))
    await assertSucceeds(getDoc(doc(como('biz2'), 'alojamientos/biz1')))
    await assertFails(getDoc(doc(anonimo(), 'alojamientos/biz1')))
    await assertFails(getDoc(doc(como('bizpend'), 'alojamientos/biz1')))
  })
  it('solo el dueño edita su alojamiento', async () => {
    await assertSucceeds(updateDoc(doc(como('biz1'), 'alojamientos/biz1'), { nombre: 'Nuevo Nombre' }))
    await assertFails(updateDoc(doc(como('biz2'), 'alojamientos/biz1'), { nombre: 'Hackeado' }))
    await assertFails(updateDoc(doc(como('cli1'), 'alojamientos/biz1'), { nombre: 'Hackeado' }))
    await assertFails(updateDoc(doc(como('biz1'), 'alojamientos/biz1'), { isDemo: false }))
  })
})

describe('unidades', () => {
  const unidad = (extra: Record<string, unknown> = {}) => ({ nombre: 'Cabaña 9', tipo: 'Cabaña', capacidad: 4, comodidades: ['Parrilla'], isDemo: false, createdAt: serverTimestamp(), ...extra })

  it('el dueño gestiona SUS unidades', async () => {
    const db = como('biz1')
    await assertSucceeds(setDoc(doc(db, 'alojamientos/biz1/unidades/nueva'), unidad()))
    await assertSucceeds(updateDoc(doc(db, 'alojamientos/biz1/unidades/u1'), { nombre: 'Cabaña Uno' }))
    await assertSucceeds(deleteDoc(doc(db, 'alojamientos/biz1/unidades/u1')))
  })
  it('otro business NO toca las unidades ajenas', async () => {
    const db = como('biz2')
    await assertFails(setDoc(doc(db, 'alojamientos/biz1/unidades/nueva'), unidad()))
    await assertFails(updateDoc(doc(db, 'alojamientos/biz1/unidades/u1'), { nombre: 'Hackeada' }))
    await assertFails(deleteDoc(doc(db, 'alojamientos/biz1/unidades/u1')))
  })
  it('un business pendiente no crea unidades; datos inválidos se rechazan', async () => {
    await assertFails(setDoc(doc(como('bizpend'), 'alojamientos/bizpend/unidades/x'), unidad()))
    const db = como('biz1')
    await assertFails(setDoc(doc(db, 'alojamientos/biz1/unidades/x'), unidad({ capacidad: 0 })))
    await assertFails(setDoc(doc(db, 'alojamientos/biz1/unidades/x'), unidad({ nombre: 'a' })))
    await assertFails(setDoc(doc(db, 'alojamientos/biz1/unidades/x'), unidad({ extra: 1 })))
  })
  it('el huésped las lee pero no las modifica', async () => {
    await assertSucceeds(getDocs(collection(como('cli1'), 'alojamientos/biz1/unidades')))
    await assertFails(updateDoc(doc(como('cli1'), 'alojamientos/biz1/unidades/u1'), { nombre: 'Hackeada' }))
  })
})

describe('reservas', () => {
  const nueva = (extra: Record<string, unknown> = {}) => ({ ...reservaBase, clientId: null, isDemo: false, createdAt: serverTimestamp(), ...extra })
  const consulta = (extra: Record<string, unknown> = {}) => ({ ...reservaBase, guestName: 'Huésped Uno', estado: 'consulta', total: 0, paid: 0, clientId: 'cli1', isDemo: false, createdAt: serverTimestamp(), ...extra })

  it('el dueño crea, edita y borra reservas de SU alojamiento', async () => {
    const db = como('biz1')
    await assertSucceeds(setDoc(doc(db, 'alojamientos/biz1/reservas/n1'), nueva()))
    await assertSucceeds(updateDoc(doc(db, 'alojamientos/biz1/reservas/r2'), { paid: 50000, total: 90000 }))
    await assertSucceeds(deleteDoc(doc(db, 'alojamientos/biz1/reservas/r2')))
  })
  it('acceso cruzado entre alojamientos: otro business no lee, crea, edita ni borra', async () => {
    const db = como('biz2')
    await assertFails(getDoc(doc(db, 'alojamientos/biz1/reservas/r1')))
    await assertFails(getDocs(collection(db, 'alojamientos/biz1/reservas')))
    await assertFails(setDoc(doc(db, 'alojamientos/biz1/reservas/n1'), nueva()))
    await assertFails(updateDoc(doc(db, 'alojamientos/biz1/reservas/r2'), { paid: 1 }))
    await assertFails(deleteDoc(doc(db, 'alojamientos/biz1/reservas/r2')))
  })
  it('un business pendiente no crea reservas', async () => {
    await assertFails(setDoc(doc(como('bizpend'), 'alojamientos/bizpend/reservas/n1'), nueva()))
  })
  it('validaciones: unidad inexistente, fechas invertidas, cobrado > total, campos de más, clientId', async () => {
    const db = como('biz1')
    await assertFails(setDoc(doc(db, 'alojamientos/biz1/reservas/n1'), nueva({ unitId: 'fantasma' })))
    await assertFails(setDoc(doc(db, 'alojamientos/biz1/reservas/n2'), nueva({ checkIn: '2026-12-05', checkOut: '2026-12-01' })))
    await assertFails(setDoc(doc(db, 'alojamientos/biz1/reservas/n3'), nueva({ paid: 200000 })))
    await assertFails(setDoc(doc(db, 'alojamientos/biz1/reservas/n4'), nueva({ extra: 1 })))
    await assertFails(setDoc(doc(db, 'alojamientos/biz1/reservas/n5'), nueva({ clientId: 'cli2' })))
    await assertFails(setDoc(doc(db, 'alojamientos/biz1/reservas/n6'), nueva({ checkIn: '1/12/2026' })))
    await assertFails(updateDoc(doc(db, 'alojamientos/biz1/reservas/r1'), { clientId: 'cli2' }))
  })
  it('acceso cruzado entre huéspedes: cada uno ve solo SUS reservas', async () => {
    await assertSucceeds(getDoc(doc(como('cli1'), 'alojamientos/biz1/reservas/r1')))
    await assertFails(getDoc(doc(como('cli2'), 'alojamientos/biz1/reservas/r1')))
    await assertFails(getDoc(doc(como('cli1'), 'alojamientos/biz1/reservas/r2')))
    await assertFails(getDocs(collection(como('cli1'), 'alojamientos/biz1/reservas')))
    await assertFails(getDoc(doc(anonimo(), 'alojamientos/biz1/reservas/r1')))
  })
  it('"mis reservas" entre alojamientos (collection group) solo devuelve las propias', async () => {
    await assertSucceeds(getDocs(query(collectionGroup(como('cli1'), 'reservas'), where('clientId', '==', 'cli1'))))
    await assertFails(getDocs(query(collectionGroup(como('cli1'), 'reservas'), where('clientId', '==', 'cli2'))))
    await assertFails(getDocs(collectionGroup(como('cli1'), 'reservas')))
  })
  it('el admin NO lee datos de huéspedes (reservas)', async () => {
    await assertFails(getDoc(doc(admin(), 'alojamientos/biz1/reservas/r1')))
  })
  it('un huésped envía una consulta a su nombre, sin importes', async () => {
    const db = como('cli1')
    await assertSucceeds(setDoc(doc(db, 'alojamientos/biz1/reservas/n1'), consulta()))
  })
  it('un huésped NO puede crear una reserva confirmada, con importes, a nombre de otro ni con otro clientId', async () => {
    const db = como('cli1')
    await assertFails(setDoc(doc(db, 'alojamientos/biz1/reservas/n1'), consulta({ estado: 'confirmada' })))
    await assertFails(setDoc(doc(db, 'alojamientos/biz1/reservas/n2'), consulta({ total: 1000 })))
    await assertFails(setDoc(doc(db, 'alojamientos/biz1/reservas/n3'), consulta({ clientId: 'cli2' })))
    await assertFails(setDoc(doc(db, 'alojamientos/biz1/reservas/n4'), consulta({ guestName: 'Otra Persona' })))
    await assertFails(setDoc(doc(db, 'alojamientos/biz1/reservas/n5'), consulta({ clientId: null })))
  })
  it('un huésped no edita reservas y solo retira su propia consulta', async () => {
    const db = como('cli1')
    await assertFails(updateDoc(doc(db, 'alojamientos/biz1/reservas/r1'), { paid: 100000 }))
    await assertFails(updateDoc(doc(db, 'alojamientos/biz1/reservas/c1'), { estado: 'confirmada' }))
    await assertFails(deleteDoc(doc(db, 'alojamientos/biz1/reservas/r1')))
    await assertFails(deleteDoc(doc(como('cli2'), 'alojamientos/biz1/reservas/c1')))
    await assertSucceeds(deleteDoc(doc(db, 'alojamientos/biz1/reservas/c1')))
  })
  it('el dueño confirma una consulta', async () => {
    await assertSucceeds(updateDoc(doc(como('biz1'), 'alojamientos/biz1/reservas/c1'), { estado: 'confirmada', total: 80000 }))
  })
})

describe('ocupacion (bloqueo de noches)', () => {
  const noche = (unitId: string, date: string, extra: Record<string, unknown> = {}) => ({ unitId, date, reservaId: 'r9', isDemo: false, ...extra })

  it('el dueño bloquea una noche libre; la misma noche no se puede tomar dos veces', async () => {
    const db = como('biz1')
    await assertSucceeds(setDoc(doc(db, 'alojamientos/biz1/ocupacion/u1_2026-12-02'), noche('u1', '2026-12-02')))
    await assertFails(setDoc(doc(db, 'alojamientos/biz1/ocupacion/u1_2026-12-02'), noche('u1', '2026-12-02', { reservaId: 'otra' })))
    await assertFails(setDoc(doc(db, 'alojamientos/biz1/ocupacion/u1_2026-12-01'), noche('u1', '2026-12-01', { reservaId: 'otra' })))
  })
  it('en un batch, una noche ya ocupada hace fallar toda la reserva', async () => {
    const db = como('biz1')
    const b = writeBatch(db)
    b.set(doc(db, 'alojamientos/biz1/ocupacion/u1_2026-11-30'), noche('u1', '2026-11-30'))
    b.set(doc(db, 'alojamientos/biz1/ocupacion/u1_2026-12-01'), noche('u1', '2026-12-01'))
    await assertFails(b.commit())
  })
  it('el id debe coincidir con unidad_fecha', async () => {
    await assertFails(setDoc(doc(como('biz1'), 'alojamientos/biz1/ocupacion/cualquiera'), noche('u1', '2026-12-03')))
  })
  it('otro business y el huésped no escriben; el huésped lee sin ver nombres', async () => {
    await assertFails(setDoc(doc(como('biz2'), 'alojamientos/biz1/ocupacion/u1_2026-12-09'), noche('u1', '2026-12-09')))
    await assertFails(setDoc(doc(como('cli1'), 'alojamientos/biz1/ocupacion/u1_2026-12-09'), noche('u1', '2026-12-09')))
    await assertFails(deleteDoc(doc(como('biz2'), 'alojamientos/biz1/ocupacion/u1_2026-12-01')))
    await assertSucceeds(getDocs(collection(como('cli1'), 'alojamientos/biz1/ocupacion')))
    await assertFails(getDocs(collection(anonimo(), 'alojamientos/biz1/ocupacion')))
    await assertSucceeds(deleteDoc(doc(como('biz1'), 'alojamientos/biz1/ocupacion/u1_2026-12-01')))
  })
})

describe('pagos simulados', () => {
  const pago = (extra: Record<string, unknown> = {}) => ({ reservaId: 'r1', monto: 5000, nota: 'Registro de prueba', simulado: true, isDemo: false, createdAt: serverTimestamp(), ...extra })

  it('el dueño registra pagos de prueba en SU alojamiento', async () => {
    await assertSucceeds(setDoc(doc(como('biz1'), 'alojamientos/biz1/pagos/n1'), pago()))
    await assertSucceeds(getDocs(collection(como('biz1'), 'alojamientos/biz1/pagos')))
  })
  it('deben ser simulados y con monto válido', async () => {
    const db = como('biz1')
    await assertFails(setDoc(doc(db, 'alojamientos/biz1/pagos/n1'), pago({ simulado: false })))
    await assertFails(setDoc(doc(db, 'alojamientos/biz1/pagos/n2'), pago({ monto: 0 })))
    await assertFails(setDoc(doc(db, 'alojamientos/biz1/pagos/n3'), pago({ monto: 10.5 })))
    await assertFails(updateDoc(doc(db, 'alojamientos/biz1/pagos/p1'), { monto: 1 }))
  })
  it('otro business y los huéspedes no ven ni crean pagos ajenos', async () => {
    await assertFails(getDoc(doc(como('biz2'), 'alojamientos/biz1/pagos/p1')))
    await assertFails(getDoc(doc(como('cli1'), 'alojamientos/biz1/pagos/p1')))
    await assertFails(setDoc(doc(como('biz2'), 'alojamientos/biz1/pagos/n1'), pago()))
    await assertFails(setDoc(doc(como('cli1'), 'alojamientos/biz1/pagos/n1'), pago()))
    await assertFails(deleteDoc(doc(como('biz2'), 'alojamientos/biz1/pagos/p1')))
  })
})

describe('general', () => {
  it('colecciones no declaradas están denegadas', async () => {
    await assertFails(setDoc(doc(admin(), 'otra/x'), { a: 1 }))
    await assertFails(getDoc(doc(admin(), 'otra/x')))
  })
})

describe('administradores dados desde la app (role "admin" en el perfil)', () => {
  const adminDoc = (uid: string, status = 'activo') =>
    env.withSecurityRulesDisabled(async ctx => setDoc(doc(ctx.firestore(), `users/${uid}`), { email: `${uid}@test.com`, displayName: 'Admin De App', role: 'admin', status, isDemo: false, createdAt: new Date() }))

  it('un admin (claim) promueve a un usuario activo y esa persona pasa a ser admin', async () => {
    await assertFails(getDocs(collection(como('cli1'), 'users')))
    await assertSucceeds(updateDoc(doc(admin(), 'users/cli1'), { role: 'admin' }))
    await assertSucceeds(getDocs(collection(como('cli1'), 'users')))
  })
  it('no se puede promover a alguien pendiente o suspendido, ni cambiar otros campos a la vez', async () => {
    await assertFails(updateDoc(doc(admin(), 'users/bizpend'), { role: 'admin' }))
    await assertFails(updateDoc(doc(admin(), 'users/cli1'), { role: 'admin', displayName: 'Otro' }))
  })
  it('quien no es admin no puede promover a nadie, ni a sí mismo', async () => {
    await assertFails(updateDoc(doc(como('cli1'), 'users/cli2'), { role: 'admin' }))
    await assertFails(updateDoc(doc(como('cli1'), 'users/cli1'), { role: 'admin' }))
  })
  it('un admin de la app promueve y quita el rol a otros, pero no cambia el propio', async () => {
    await adminDoc('adm1')
    await adminDoc('adm2')
    const db = como('adm1')
    await assertSucceeds(updateDoc(doc(db, 'users/cli1'), { role: 'admin' }))
    await assertSucceeds(updateDoc(doc(db, 'users/adm2'), { role: 'client' }))
    await assertFails(updateDoc(doc(db, 'users/adm1'), { role: 'client' }))
    await assertFails(deleteDoc(doc(db, 'users/cli1')))
  })
  it('un admin de la app suspendido pierde los poderes', async () => {
    await adminDoc('adm3', 'suspendido')
    await assertFails(getDocs(collection(como('adm3'), 'users')))
  })
})
