import { ArrowRight, Building2, CalendarCheck, CalendarDays, CheckCircle2, CreditCard, DoorOpen, Eye, Layers, LayoutDashboard, ShieldCheck, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import { BotonLink } from '@/components/ui'
import { MARCA } from '@/config/app'

const BENEFICIOS = [
  {
    icono: CalendarCheck,
    titulo: 'Organización de reservas',
    texto: 'Centralizá los datos de cada huésped, teléfono o correo de contacto, unidad asignada, fechas de check-in y cálculo exacto de noches de estadía.',
    puntos: ['Historial ordenado cronológicamente', 'Edición ágil de reservas existentes', 'Ficha de estadía completa y detallada'],
  },
  {
    icono: CalendarDays,
    titulo: 'Control de disponibilidad',
    texto: 'Visualizá la ocupación día por día en una grilla intuitiva. Comprobá qué unidades están libres hoy y navegá semanas futuras sin esfuerzo.',
    puntos: ['Grilla organizada por cabaña o departamento', 'Prevención activa de solapamientos', 'Acceso directo desde cualquier fecha a la reserva'],
  },
  {
    icono: CreditCard,
    titulo: 'Seguimiento de saldos',
    texto: 'Llevá el control entre el total pactado y el monto efectivamente cobrado (seña o anticipo), detectando al instante los saldos a cobrar al ingreso.',
    puntos: ['Etiquetas visuales de reservas pagadas y pendientes', 'Total general adeudado en el panel de inicio', 'Actualización inmediata al registrar cobros'],
  },
]

const MODULOS = [
  { icono: LayoutDashboard, titulo: '1. Inicio (Panel)', texto: 'Resumen diario con unidades ocupadas y libres hoy, saldo pendiente acumulado y próximos check-ins.' },
  { icono: Layers, titulo: '2. Reservas', texto: 'Tabla integral con listado de estadías, montos totales, pagos registrados, saldo y acceso a edición.' },
  { icono: CalendarDays, titulo: '3. Disponibilidad', texto: 'Matriz interactiva por cabaña y día que permite verificar disponibilidad y anticipar desocupaciones.' },
  { icono: DoorOpen, titulo: '4. Carga de reserva', texto: 'Formulario con validación automática que impide asignar fechas superpuestas a una misma unidad.' },
]

function Chip({ children }: { children: ReactNode }) {
  return <span className="inline-flex items-center gap-1.5 rounded-md bg-borde/60 px-2.5 py-1 text-xs font-semibold">{children}</span>
}

export default function Landing() {
  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden border-b border-borde bg-gradient-to-b from-superficie via-fondo to-fondo py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primario/20 bg-primario/5 px-3 py-1 text-xs font-medium text-primario">
              <Sparkles className="size-3.5" aria-hidden />
              <span>Software de gestión para pequeños alojamientos turísticos</span>
            </div>
            <h1 className="mt-5 text-balance text-3xl font-extrabold tracking-tight sm:text-5xl sm:leading-tight">{MARCA.eslogan}</h1>
            <p className="mt-4 text-pretty text-base text-suave sm:text-lg">
              Diseñado especialmente para cabañas, complejos y departamentos de alquiler temporario. Organizá tus reservas, evitá solapamientos en el calendario y mantené el control de tus cobros y saldos pendientes en un solo lugar.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <BotonLink to="/app/registro" className="w-full px-8 sm:w-auto">Registrarme <ArrowRight className="size-4" aria-hidden /></BotonLink>
              <BotonLink to="/app/ingresar" variante="borde" className="w-full px-8 sm:w-auto">Ingresar</BotonLink>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-suave">
              {['3 perfiles: Superadmin, Business y Client', 'Prevención de reservas duplicadas', 'Cálculo automático de saldos'].map(t => (
                <div key={t} className="flex items-center gap-1.5"><CheckCircle2 className="size-4 text-ok" aria-hidden /><span>{t}</span></div>
              ))}
            </div>
          </div>

          <div className="mt-12 rounded-xl border border-borde bg-superficie p-3 shadow-xl sm:p-5">
            <div className="mb-4 flex items-center gap-2 border-b border-borde pb-3 text-xs text-suave">
              <div className="size-2.5 rounded-full bg-peligro/60" /><div className="size-2.5 rounded-full bg-acento/60" /><div className="size-2.5 rounded-full bg-ok/60" />
              <span className="ml-2 font-medium text-texto">KIVA — Vista previa</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-tema border border-borde bg-fondo p-4">
                <div className="text-xs font-medium text-suave">Unidades administradas</div>
                <div className="mt-1 text-2xl font-bold tracking-tight">4 unidades</div>
                <div className="mt-1 truncate text-xs text-suave">Cabaña 1, Cabaña 2, Cabaña 3, Depto 1</div>
              </div>
              <div className="rounded-tema border border-borde bg-fondo p-4">
                <div className="text-xs font-medium text-suave">Control de ocupación</div>
                <div className="mt-1 text-2xl font-bold tracking-tight">Tiempo real</div>
                <div className="mt-1 text-xs text-suave">Validación automática sin solapamientos</div>
              </div>
              <div className="rounded-tema border border-acento/40 bg-acento/10 p-4">
                <div className="text-xs font-medium text-suave">Seguimiento de cobros</div>
                <div className="mt-1 text-2xl font-bold tracking-tight text-aviso-texto">Al día</div>
                <div className="mt-1 text-xs text-suave">Control de señas y cobros pendientes</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-borde bg-superficie py-14">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 md:grid-cols-2 md:px-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">El problema</h2>
            <p className="mt-3 text-suave">Reservas anotadas en cuadernos, planillas y mensajes sueltos: es fácil que dos huéspedes terminen con la misma cabaña, y los saldos pendientes se pierden hasta el día del check-in.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">La solución</h2>
            <p className="mt-3 text-suave">KIVA reúne en un solo lugar las reservas, la grilla de disponibilidad y los cobros de tu alojamiento, con validación automática de fechas y cálculo de saldos.</p>
          </div>
        </div>
      </section>

      <section className="border-b border-borde py-14">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">Vistas diferenciadas según el tipo de usuario</h2>
            <p className="mt-3 text-sm text-suave sm:text-base">KIVA contempla tres perspectivas clave para la gestión hotelera.</p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { icono: ShieldCheck, titulo: '1. Superadmin (Plataforma)', texto: 'Supervisión técnica de la plataforma KIVA, estado de instancias de alojamiento registradas y aprobación de nuevos alojamientos.' },
              { icono: Building2, titulo: '2. Business (Alojamiento)', texto: 'Gestión operativa completa para dueños y encargados: calendario de ocupación, prevención de solapamientos, registro de reservas y balance de pagos.' },
              { icono: Eye, titulo: '3. Client (Huésped)', texto: 'Portal donde los potenciales huéspedes pueden consultar qué cabañas están libres sin ver datos personales de otros clientes ni importes contables.' },
            ].map(p => (
              <div key={p.titulo} className="rounded-tema border border-borde bg-superficie p-6">
                <div className="flex size-10 items-center justify-center rounded-tema bg-primario/10 text-primario"><p.icono className="size-5" aria-hidden /></div>
                <h3 className="mt-4 text-base font-semibold">{p.titulo}</h3>
                <p className="mt-2 text-sm text-suave">{p.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="beneficios" className="border-b border-borde py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Chip>Beneficios reales del MVP</Chip>
            <h2 className="mt-3 text-balance text-2xl font-bold tracking-tight sm:text-3xl">Tres pilares operativos para simplificar tu gestión</h2>
            <p className="mt-3 text-sm text-suave sm:text-base">Funcionalidades concretas diseñadas para resolver operativamente la administración diaria.</p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {BENEFICIOS.map(b => (
              <div key={b.titulo} className="flex flex-col rounded-xl border border-borde bg-superficie p-6">
                <div className="flex size-11 items-center justify-center rounded-tema bg-primario/10 text-primario"><b.icono className="size-6" aria-hidden /></div>
                <h3 className="mt-4 text-lg font-semibold">{b.titulo}</h3>
                <p className="mt-2 text-sm text-suave">{b.texto}</p>
                <ul className="mt-5 space-y-2 border-t border-borde pt-4 text-xs text-suave">
                  {b.puntos.map(p => <li key={p} className="flex items-center gap-2"><CheckCircle2 className="size-3.5 text-primario" aria-hidden /><span>{p}</span></li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="modulos" className="border-b border-borde bg-superficie py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <Chip>Estructura del sistema</Chip>
          <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Los módulos de KIVA</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {MODULOS.map(m => (
              <div key={m.titulo} className="rounded-tema border border-borde bg-fondo p-5">
                <div className="flex size-9 items-center justify-center rounded-md bg-primario/10 text-primario"><m.icono className="size-4" aria-hidden /></div>
                <h3 className="mt-3 font-semibold">{m.titulo}</h3>
                <p className="mt-1.5 text-xs text-suave">{m.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center md:px-6">
          <h2 className="text-balance text-2xl font-bold tracking-tight sm:text-4xl">Empezá a ordenar tu alojamiento hoy</h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-sm text-suave sm:text-base">Creá tu cuenta gratis: elegí si sos dueño de un alojamiento o huésped e ingresá con tu email o con Google.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <BotonLink to="/app/registro" className="w-full px-8 sm:w-auto">Registrarme</BotonLink>
            <BotonLink to="/app/ingresar" variante="borde" className="w-full px-8 sm:w-auto">Ingresar</BotonLink>
          </div>
        </div>
      </section>
    </div>
  )
}
