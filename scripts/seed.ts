/**
 * Datos de DEMO de KIVA (todo marcado isDemo: true). Por defecto corre contra los EMULADORES. Para producción: FIREBASE_PROJECT_ID=... GOOGLE_APPLICATION_CREDENTIALS=... npm run seed -- --produccion --yes
 *   1) npm run emuladores   (en otra terminal)
 *   2) npm run seed
 * Es idempotente: se puede correr varias veces. Las fechas son relativas a hoy (como en el prototipo original).
 */
import { pathToFileURL } from 'node:url'
import { iniciarAdmin } from './lib/admin-sdk'

export const CLAVE_DEMO = 'Demo-Clave-2026' // pública, solo existe en los emuladores

export const USUARIOS_DEMO = [
  { uid: 'demo-client', email: 'client.demo@kiva.test', displayName: 'Huésped Demo', role: 'client', status: 'activo' },
  { uid: 'demo-business', email: 'business.demo@kiva.test', displayName: 'Dueño Demo', role: 'business', status: 'activo' },
  { uid: 'demo-business-pendiente', email: 'pendiente.demo@kiva.test', displayName: 'Dueño Pendiente Demo', role: 'business', status: 'pendiente' },
  { uid: 'demo-admin', email: 'admin.demo@kiva.test', displayName: 'Superadmin Demo', role: 'admin', status: 'activo' },
] as const

const AID = 'demo-business'

const UNIDADES = [
  { id: 'cabana-1', nombre: 'Cabaña 1', tipo: 'Cabaña de montaña', capacidad: 4, comodidades: ['2 dormitorios', 'Cocina equipada', 'Galería con parrilla'] },
  { id: 'cabana-2', nombre: 'Cabaña 2', tipo: 'Cabaña familiar', capacidad: 4, comodidades: ['2 dormitorios', 'Vista al parque', 'Estacionamiento propio'] },
  { id: 'cabana-3', nombre: 'Cabaña 3', tipo: 'Cabaña grande', capacidad: 6, comodidades: ['3 dormitorios', 'Hogar a leña', 'Deck exterior privado'] },
  { id: 'departamento-1', nombre: 'Departamento 1', tipo: 'Departamento temporario', capacidad: 2, comodidades: ['Monoambiente amplio', 'Balcón con vista', 'Kitchinette'] },
]

const pad = (n: number) => String(n).padStart(2, '0')
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const sumar = (fecha: string, dias: number) => {
  const [y, m, d] = fecha.split('-').map(Number) as [number, number, number]
  const f = new Date(y, m - 1, d)
  f.setDate(f.getDate() + dias)
  return iso(f)
}

function reservasDemo(hoy: string) {
  const r = (id: string, unitId: string, guestName: string, contact: string, desde: number, hasta: number, total: number, paid: number, extra: { clientId?: string; estado?: string } = {}) =>
    ({ id, unitId, guestName, contact, checkIn: sumar(hoy, desde), checkOut: sumar(hoy, hasta), total, paid, estado: extra.estado ?? 'confirmada', clientId: extra.clientId ?? null })
  return [
    r('demo-1', 'cabana-1', 'Ana Ejemplo (demo)', '+54 9 11 0000-0001', -2, 3, 250000, 250000),
    r('demo-2', 'cabana-2', 'Bruno Prueba (demo)', 'bruno@ejemplo.com', 1, 5, 180000, 60000),
    r('demo-3', 'departamento-1', 'Carla Demo (demo)', '+54 9 11 0000-0003', 0, 2, 90000, 30000),
    r('demo-4', 'cabana-3', 'Diego Muestra (demo)', 'diego@ejemplo.com', 6, 10, 200000, 0),
    r('demo-5', 'cabana-1', 'Elena Ficticia (demo)', '+54 9 11 0000-0005', 5, 8, 120000, 40000),
    // Reserva confirmada del huésped demo (la ve en su panel) y una consulta pendiente de respuesta.
    r('demo-6', 'cabana-2', 'Huésped Demo', 'client.demo@kiva.test', 8, 11, 90000, 30000, { clientId: 'demo-client' }),
    r('demo-consulta', 'departamento-1', 'Huésped Demo', 'client.demo@kiva.test', 12, 14, 0, 0, { clientId: 'demo-client', estado: 'consulta' }),
  ]
}

/** En producción NO se crean cuentas demo (tendrían contraseña pública): solo datos de ejemplo. */
function usuariosDemoActivos() {
  return process.argv.includes('--produccion') ? [] : USUARIOS_DEMO
}

export async function sembrar() {
  const { auth, db, esEmulador } = iniciarAdmin({ produccion: process.argv.includes('--produccion') })
  if (!esEmulador && !process.argv.includes('--yes')) throw new Error('Para sembrar PRODUCCIÓN agregá --produccion --yes (en producción solo se cargan datos de ejemplo, sin cuentas demo).')

  for (const u of usuariosDemoActivos()) {
    const datos = { email: u.email, displayName: u.displayName, password: CLAVE_DEMO, emailVerified: true }
    await auth.updateUser(u.uid, datos).catch(() => auth.createUser({ uid: u.uid, ...datos }))
    await auth.setCustomUserClaims(u.uid, u.role === 'admin' ? { admin: true } : {})
    await db.doc(`users/${u.uid}`).set({ email: u.email, displayName: u.displayName, role: u.role, status: u.status, isDemo: true, createdAt: new Date() })
  }

  // Alojamiento demo del business demo: se rearma entero para que las fechas relativas queden al día.
  await db.recursiveDelete(db.doc(`alojamientos/${AID}`))
  const nombre = 'Cabañas y Departamentos Demo'
  await db.doc(`alojamientos/${AID}`).set({ nombre, whatsapp: '+54 9 11 0000-0000', email: 'contacto@kiva-alojamientos.demo', isDemo: true, createdAt: new Date() })

  for (const { id, ...u } of UNIDADES) await db.doc(`alojamientos/${AID}/unidades/${id}`).set({ ...u, isDemo: true, createdAt: new Date() })

  for (const r of reservasDemo(iso(new Date()))) {
    const { id, ...resto } = r
    const unitName = UNIDADES.find(u => u.id === r.unitId)?.nombre ?? r.unitId
    await db.doc(`alojamientos/${AID}/reservas/${id}`).set({ ...resto, unitName, alojamientoNombre: nombre, isDemo: true, createdAt: new Date() })
    if (r.estado === 'confirmada') {
      for (let f = r.checkIn; f < r.checkOut; f = sumar(f, 1)) {
        await db.doc(`alojamientos/${AID}/ocupacion/${r.unitId}_${f}`).set({ unitId: r.unitId, date: f, reservaId: id, isDemo: true })
      }
      if (r.paid > 0) await db.doc(`alojamientos/${AID}/pagos/pago-${id}`).set({ reservaId: id, monto: r.paid, nota: 'Seña (demo)', simulado: true, isDemo: true, createdAt: new Date() })
    }
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  sembrar()
    .then(() => {
      console.log('✔ Seed de demo listo (emuladores). Usuarios DEMO (clave pública de demo):')
      for (const u of usuariosDemoActivos()) console.log(`  ${u.role.padEnd(9)} ${u.email}  /  ${CLAVE_DEMO}`)
    })
    .catch((e: unknown) => {
      console.error(`✖ ${e instanceof Error ? e.message : String(e)}`)
      process.exit(1)
    })
}
