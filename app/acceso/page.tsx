import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  Eye,
  Info,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const metadata = {
  title: 'Acceso Demostrativo — KIVA',
  description: 'Seleccioná un perfil para evaluar las diferentes vistas de KIVA: Superadmin, Business o Client.',
}

export default function AccesoPage() {
  return (
    <div className="flex flex-col items-center">
      {/* Header Banner */}
      <div className="mx-auto max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
          <Sparkles className="size-3.5" aria-hidden="true" />
          <span>Acceso demostrativo sin autenticación real</span>
        </div>

        <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl text-balance">
          Seleccioná un perfil para explorar KIVA
        </h1>

        <p className="mt-3 text-sm text-muted-foreground sm:text-base text-pretty">
          Este selector permite evaluar el software desde las tres perspectivas fundamentales
          del modelo de negocio sin requerir contraseñas ni registro de usuarios.
        </p>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-2.5 max-w-xl mx-auto border">
          <Info className="size-4 shrink-0 text-primary" aria-hidden="true" />
          <span>
            Desarrollo para el segundo parcial de <strong>Taller Emprendedor (Universidad CAECE)</strong>.
          </span>
        </div>
      </div>

      {/* 3 Profile Cards Grid */}
      <div className="mt-10 grid w-full gap-6 md:grid-cols-3">
        {/* Profile 1: Superadmin */}
        <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-xs transition-all hover:border-primary/40">
          <div>
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                Supervisión
              </span>
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ShieldCheck className="size-5" aria-hidden="true" />
              </div>
            </div>

            <h2 className="mt-4 text-lg font-bold tracking-tight">Superadmin</h2>
            <p className="text-xs font-medium text-muted-foreground">Plataforma KIVA</p>

            <p className="mt-3 text-sm text-muted-foreground">
              Visión técnica y conceptual de la plataforma. Supervisión de alojamientos registrados
              y estado de los módulos operativos.
            </p>

            <ul className="mt-5 space-y-2 border-t pt-4 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 shrink-0 text-primary mt-0.5" aria-hidden="true" />
                <span>Estado general de la plataforma y almacenamiento</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 shrink-0 text-primary mt-0.5" aria-hidden="true" />
                <span>Alojamientos registrados de prueba</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 shrink-0 text-primary mt-0.5" aria-hidden="true" />
                <span>Control de módulos activos del MVP</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t">
            <Link
              href="/superadmin"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'w-full gap-2 font-medium justify-center',
              )}
            >
              <span>Ingresar como Superadmin</span>
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Profile 2: Business (Core MVP) */}
        <div className="relative flex flex-col justify-between rounded-xl border-2 border-primary bg-card p-6 shadow-md">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="rounded-full bg-primary px-3 py-0.5 text-[11px] font-semibold text-primary-foreground shadow-xs">
              MVP Operativo Principal
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                Operación Hotelera
              </span>
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Building2 className="size-5" aria-hidden="true" />
              </div>
            </div>

            <h2 className="mt-4 text-lg font-bold tracking-tight">Business</h2>
            <p className="text-xs font-medium text-muted-foreground">Administrador del Alojamiento</p>

            <p className="mt-3 text-sm text-muted-foreground">
              Sistema completo de gestión diaria: recepción de huéspedes, registro de estadías,
              control de disponibilidad y seguimiento de saldos pendientes.
            </p>

            <ul className="mt-5 space-y-2 border-t pt-4 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 shrink-0 text-primary mt-0.5" aria-hidden="true" />
                <span>Panel diario con ocupación y saldos</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 shrink-0 text-primary mt-0.5" aria-hidden="true" />
                <span>Listado y carga de reservas con validación</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 shrink-0 text-primary mt-0.5" aria-hidden="true" />
                <span>Matriz de disponibilidad sin solapamientos</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t">
            <Link
              href="/panel"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'w-full gap-2 font-semibold justify-center bg-primary text-primary-foreground shadow-xs',
              )}
            >
              <Building2 className="size-4" aria-hidden="true" />
              <span>Ingresar como Administrador</span>
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Profile 3: Client */}
        <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-xs transition-all hover:border-primary/40">
          <div>
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                Vista Pública
              </span>
              <div className="flex size-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                <Eye className="size-5" aria-hidden="true" />
              </div>
            </div>

            <h2 className="mt-4 text-lg font-bold tracking-tight">Client</h2>
            <p className="text-xs font-medium text-muted-foreground">Portal para Huéspedes</p>

            <p className="mt-3 text-sm text-muted-foreground">
              Consulta ágil de disponibilidad de cabañas y departamentos. No expone datos de otros huéspedes,
              información financiera ni opciones de edición.
            </p>

            <ul className="mt-5 space-y-2 border-t pt-4 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 shrink-0 text-primary mt-0.5" aria-hidden="true" />
                <span>Visualización de unidades y comodidades</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 shrink-0 text-primary mt-0.5" aria-hidden="true" />
                <span>Calendario público de fechas libres y ocupadas</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 shrink-0 text-primary mt-0.5" aria-hidden="true" />
                <span>Canal de consulta directa de estadía</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t">
            <Link
              href="/cliente"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'w-full gap-2 font-medium justify-center',
              )}
            >
              <span>Ingresar como Huésped</span>
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation aid footer */}
      <div className="mt-12 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          <span>Volver a la landing comercial</span>
        </Link>
      </div>
    </div>
  )
}
