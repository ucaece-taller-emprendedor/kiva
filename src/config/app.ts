// ──────────────────────────────────────────────────────────────────────────
// CONFIGURACIÓN DE KIVA — marca, roles y textos.
// Los colores y la tipografía se cambian en src/styles/tema.css.
// Si agregás o renombrás roles, hay que cambiarlos TAMBIÉN en firestore.rules.
// ──────────────────────────────────────────────────────────────────────────

export const MARCA = {
  nombre: 'KIVA',
  eslogan: 'La forma más clara y ordenada de gestionar tu alojamiento',
  logo: '/logo.svg',
  contacto: 'contacto@kiva-alojamientos.demo',
}

export type Rol = 'client' | 'business' | 'admin'
export type Estado = 'activo' | 'pendiente' | 'suspendido'

export const ESTADOS: Estado[] = ['activo', 'pendiente', 'suspendido']

export type RolRegistrable = Exclude<Rol, 'admin'>

export const ROLES_REGISTRABLES: {
  rol: RolRegistrable
  etiqueta: string
  descripcion: string
  /** Si es true el usuario queda "pendiente" hasta que el admin lo aprueba. */
  requiereAprobacion: boolean
  /** Panel al que va después de ingresar. */
  panel: string
}[] = [
  { rol: 'business', etiqueta: 'Business (alojamiento)', descripcion: 'Soy dueño o encargado de un alojamiento. Necesita aprobación del equipo de KIVA.', requiereAprobacion: true, panel: '/app/panel' },
  { rol: 'client', etiqueta: 'Client (huésped)', descripcion: 'Quiero consultar disponibilidad y reservar en un alojamiento.', requiereAprobacion: false, panel: '/app/cliente' },
]

export const ETIQUETA_ROL: Record<Rol, string> = { client: 'Client (huésped)', business: 'Business (alojamiento)', admin: 'Superadmin' }

export function panelDe(rol: Rol): string {
  if (rol === 'admin') return '/admin'
  return ROLES_REGISTRABLES.find(r => r.rol === rol)?.panel ?? '/app'
}

/** Credenciales DEMO públicas (las crea scripts/seed.ts solo en los emuladores). */
export const CLAVE_DEMO = 'Demo-Clave-2026'

/** Máximo de noches por reserva (cada noche ocupa un documento de bloqueo en Firestore). */
export const MAX_NOCHES = 60
