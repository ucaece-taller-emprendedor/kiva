import Link from 'next/link'
import {
  ArrowRight,
  Building2,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  DoorOpen,
  Eye,
  Layers,
  LayoutDashboard,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-card via-background to-background py-16 md:py-24">
        {/* Subtle decorative glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-96 w-full max-w-4xl -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
        />

        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="size-3.5" aria-hidden="true" />
              <span>Software de gestión para pequeños alojamientos turísticos</span>
            </div>

            <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl sm:leading-tight text-balance">
              La forma más clara y ordenada de gestionar tu alojamiento
            </h1>

            <p className="mt-4 text-base text-muted-foreground sm:text-lg text-pretty">
              Diseñado especialmente para cabañas, complejos y departamentos de alquiler temporario.
              Organizá tus reservas, evitá solapamientos en el calendario y mantené el control de tus
              cobros y saldos pendientes en un solo lugar.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/acceso"
                className={cn(
                  buttonVariants({ size: 'lg' }),
                  'w-full gap-2 bg-primary px-6 py-6 text-base font-semibold shadow-md transition-all hover:bg-primary/90 active:scale-[0.98] sm:w-auto',
                )}
              >
                <Users className="size-5" aria-hidden="true" />
                <span>Explorar demo por rol</span>
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>

              <Link
                href="/panel"
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'w-full gap-2 px-6 py-6 text-base font-medium sm:w-auto',
                )}
              >
                <LayoutDashboard className="size-5 text-muted-foreground" aria-hidden="true" />
                <span>Panel directo (Business)</span>
              </Link>
            </div>

            {/* Trust badges - real attributes of the MVP */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
                <span>3 perfiles: Superadmin, Business y Client</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
                <span>Prevención de reservas duplicadas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
                <span>Cálculo automático de saldos</span>
              </div>
            </div>
          </div>

          {/* Interactive UI Preview Showcase */}
          <div className="mt-12 rounded-xl border border-border bg-card p-3 shadow-xl sm:p-5">
            <div className="mb-4 flex items-center justify-between border-b pb-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="size-2.5 rounded-full bg-destructive/60" />
                <div className="size-2.5 rounded-full bg-warning/60" />
                <div className="size-2.5 rounded-full bg-success/60" />
                <span className="ml-2 font-medium text-foreground">KIVA — Vista previa de la demo interactiva</span>
              </div>
              <div className="flex items-center gap-1 text-[11px]">
                <span className="rounded bg-primary/10 px-2 py-0.5 font-medium text-primary">Superadmin</span>
                <span className="rounded bg-primary/10 px-2 py-0.5 font-medium text-primary">Business</span>
                <span className="rounded bg-secondary px-2 py-0.5 font-medium text-secondary-foreground">Client</span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border bg-background p-4">
                <div className="text-xs font-medium text-muted-foreground">Unidades administradas</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-bold tracking-tight">4 unidades</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground truncate">
                  Cabaña 1, Cabaña 2, Cabaña 3, Depto 1
                </div>
              </div>

              <div className="rounded-lg border bg-background p-4">
                <div className="text-xs font-medium text-muted-foreground">Control de ocupación</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-bold tracking-tight text-foreground">Tiempo real</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Validación automática sin solapamientos
                </div>
              </div>

              <div className="rounded-lg border border-warning/40 bg-warning/5 p-4">
                <div className="text-xs font-medium text-muted-foreground">Seguimiento de cobros</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-bold tracking-tight text-warning-foreground">Al día</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Control de señas y cobros pendientes
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-col items-center justify-between gap-3 rounded-lg bg-muted/40 p-3 sm:flex-row sm:px-4">
              <span className="text-xs text-muted-foreground text-center sm:text-left">
                Probá el sistema con datos de ejemplo ya cargados en tu navegador sin necesidad de registro.
              </span>
              <Link
                href="/acceso"
                className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                Abrir selector de perfiles
                <ArrowRight className="size-3" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE 3 PROFILES EXPLAINED */}
      <section className="border-b border-border bg-card py-14">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Vistas diferenciadas según el tipo de usuario
            </h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              KIVA contempla tres perspectivas clave para la gestión hotelera, accesibles desde la demo interactiva.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="flex flex-col justify-between rounded-lg border bg-background p-6">
              <div>
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShieldCheck className="size-5" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-base font-semibold">1. Superadmin (Plataforma)</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Supervisión técnica de la plataforma KIVA, estado de instancias de alojamiento registradas
                  y configuración de módulos del prototipo.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t">
                <Link href="/superadmin" className="text-xs font-semibold text-primary hover:underline">
                  Ver consola Superadmin →
                </Link>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-lg border bg-background p-6">
              <div>
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Building2 className="size-5" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-base font-semibold">2. Business (Alojamiento)</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Gestión operativa completa para dueños y encargados: calendario de ocupación, prevención de solapamientos,
                  registro de reservas y balance de pagos.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t">
                <Link href="/panel" className="text-xs font-semibold text-primary hover:underline">
                  Ver panel Business →
                </Link>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-lg border bg-background p-6">
              <div>
                <div className="flex size-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  <Eye className="size-5" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-base font-semibold">3. Client (Huésped)</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Portal público donde los potenciales huéspedes pueden consultar qué cabañas están libres sin ver datos
                  personales de otros clientes ni importes contables.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t">
                <Link href="/cliente" className="text-xs font-semibold text-primary hover:underline">
                  Ver vista de huésped →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE BENEFITS OF THE MVP */}
      <section id="beneficios" className="border-b border-border bg-background py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
              Beneficios reales del MVP
            </div>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Tres pilares operativos para simplificar tu gestión
            </h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Funcionalidades concretas diseñadas para resolver operativamente la administración diaria.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {/* Benefit 1 */}
            <div className="flex flex-col rounded-xl border bg-card p-6 shadow-xs">
              <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CalendarCheck className="size-6" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Organización de reservas</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Centralizá los datos de cada huésped, teléfono o correo de contacto, unidad asignada,
                fechas de check-in y cálculo exacto de noches de estadía.
              </p>
              <ul className="mt-5 space-y-2 border-t pt-4 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-primary" aria-hidden="true" />
                  <span>Historial ordenado cronológicamente</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-primary" aria-hidden="true" />
                  <span>Edición ágil de reservas existentes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-primary" aria-hidden="true" />
                  <span>Ficha de estadía completa y detallada</span>
                </li>
              </ul>
              <div className="mt-6 pt-2">
                <Link
                  href="/reservas"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  Ver módulo de reservas
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="flex flex-col rounded-xl border bg-card p-6 shadow-xs">
              <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CalendarDays className="size-6" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Control de disponibilidad</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Visualizá la ocupación día por día en una grilla intuitiva. Comprobá qué unidades están libres
                hoy y navegá semanas futuras sin esfuerzo.
              </p>
              <ul className="mt-5 space-y-2 border-t pt-4 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-primary" aria-hidden="true" />
                  <span>Grilla organizada por cabaña o departamento</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-primary" aria-hidden="true" />
                  <span>Prevención activa de solapamientos</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-primary" aria-hidden="true" />
                  <span>Acceso directo desde cualquier fecha a la reserva</span>
                </li>
              </ul>
              <div className="mt-6 pt-2">
                <Link
                  href="/disponibilidad"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  Ver grilla de disponibilidad
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="flex flex-col rounded-xl border bg-card p-6 shadow-xs">
              <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CreditCard className="size-6" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Seguimiento de saldos</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Llevá el control entre el total pactado y el monto efectivamente cobrado (seña o anticipo),
                detectando al instante los saldos a cobrar al ingreso.
              </p>
              <ul className="mt-5 space-y-2 border-t pt-4 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-primary" aria-hidden="true" />
                  <span>Etiquetas visuales de reservas pagadas y pendientes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-primary" aria-hidden="true" />
                  <span>Total general adeudado en el panel de inicio</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-primary" aria-hidden="true" />
                  <span>Actualización inmediata al registrar cobros</span>
                </li>
              </ul>
              <div className="mt-6 pt-2">
                <Link
                  href="/panel"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  Ver seguimiento en el panel
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MVP MODULES OVERVIEW */}
      <section id="modulos" className="border-b border-border bg-card py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
                Estructura del sistema
              </div>
              <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                Los módulos disponibles en la demo
              </h2>
            </div>
            <Link
              href="/panel"
              className={cn(buttonVariants({ variant: 'default', size: 'default' }), 'gap-1.5 font-medium')}
            >
              <span>Ir al panel principal</span>
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col justify-between rounded-lg border bg-background p-5">
              <div>
                <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <LayoutDashboard className="size-4" aria-hidden="true" />
                </div>
                <h3 className="mt-3 font-semibold">1. Inicio (Panel)</h3>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Resumen diario con unidades ocupadas y libres hoy, saldo pendiente acumulado y próximos check-ins.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t">
                <Link href="/panel" className="text-xs font-medium text-primary hover:underline">
                  Abrir Inicio →
                </Link>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-lg border bg-background p-5">
              <div>
                <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Layers className="size-4" aria-hidden="true" />
                </div>
                <h3 className="mt-3 font-semibold">2. Reservas</h3>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Tabla integral con listado de estadías, montos totales, pagos registrados, saldo y acceso a edición.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t">
                <Link href="/reservas" className="text-xs font-medium text-primary hover:underline">
                  Ver reservas →
                </Link>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-lg border bg-background p-5">
              <div>
                <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <CalendarDays className="size-4" aria-hidden="true" />
                </div>
                <h3 className="mt-3 font-semibold">3. Disponibilidad</h3>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Matriz interactiva por cabaña y día que permite verificar disponibilidad y anticipar desocupaciones.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t">
                <Link href="/disponibilidad" className="text-xs font-medium text-primary hover:underline">
                  Ver calendario →
                </Link>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-lg border bg-background p-5">
              <div>
                <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <DoorOpen className="size-4" aria-hidden="true" />
                </div>
                <h3 className="mt-3 font-semibold">4. Carga de reserva</h3>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Formulario con validación automática que impide asignar fechas superpuestas a una misma unidad.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t">
                <Link href="/reservas/nueva" className="text-xs font-medium text-primary hover:underline">
                  Crear reserva →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FINAL CTA */}
      <section className="bg-gradient-to-b from-background to-card py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center md:px-6">
          <h2 className="text-2xl font-bold tracking-tight sm:text-4xl text-balance">
            Probá la demo de KIVA en funcionamiento
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground sm:text-base text-pretty">
            Seleccioná el perfil que deseás evaluar o ingresá directamente al panel de gestión operativa.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/acceso"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'w-full gap-2 bg-primary px-8 py-6 text-base font-semibold shadow-md sm:w-auto',
              )}
            >
              <Users className="size-5" aria-hidden="true" />
              <span>Ver vistas por rol (/acceso)</span>
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>

            <Link
              href="/panel"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'w-full px-6 py-6 text-base font-medium sm:w-auto',
              )}
            >
              Ir directo al panel Business
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
