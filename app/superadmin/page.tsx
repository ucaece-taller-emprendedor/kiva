'use client'

import Link from 'next/link'
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  Database,
  ExternalLink,
  Layers,
  Server,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { PageHeader, Panel } from '@/components/kiva-ui'
import { UNITS } from '@/lib/kiva'
import { useReservations } from '@/components/reservations-provider'
import { cn } from '@/lib/utils'

export default function SuperadminPage() {
  const { reservations, ready } = useReservations()

  return (
    <>
      <div className="flex items-center justify-between">
        <PageHeader
          title="Consola de Plataforma (Superadmin)"
          description="Supervisión técnica y conceptual de las instancias de alojamiento en KIVA."
        />
        <Link
          href="/acceso"
          className={cn(
            buttonVariants({ variant: 'outline', size: 'sm' }),
            'gap-1.5 text-xs text-muted-foreground hover:text-foreground shrink-0',
          )}
        >
          <Users className="size-3.5" aria-hidden="true" />
          Cambiar perfil
        </Link>
      </div>

      {/* Demo clarification */}
      <p className="text-xs text-muted-foreground">
        Datos de demostración: las instancias y cifras presentadas no representan clientes comerciales reales.
      </p>

      {/* Platform KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="flex flex-col gap-1 rounded-lg border bg-card p-4">
          <span className="text-xs font-medium text-muted-foreground">Estado de plataforma</span>
          <div className="mt-1 flex items-center gap-2">
            <span className="size-2 rounded-full bg-success animate-pulse" />
            <span className="text-xl font-bold tracking-tight">Operativo</span>
          </div>
          <span className="text-[11px] text-muted-foreground">Versión MVP v1.0</span>
        </div>

        <div className="flex flex-col gap-1 rounded-lg border bg-card p-4">
          <span className="text-xs font-medium text-muted-foreground">Alojamientos registrados</span>
          <span className="mt-1 text-2xl font-bold tracking-tight">2 instancias</span>
          <span className="text-[11px] text-muted-foreground">1 activa en navegador · 1 simulada</span>
        </div>

        <div className="flex flex-col gap-1 rounded-lg border bg-card p-4">
          <span className="text-xs font-medium text-muted-foreground">Motor de persistencia</span>
          <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold">
            <Database className="size-4 text-primary" aria-hidden="true" />
            <span>localStorage</span>
          </div>
          <span className="text-[11px] text-muted-foreground">
            {ready ? `${reservations.length} reservas en almacenamiento local` : 'Cargando…'}
          </span>
        </div>

        <div className="flex flex-col gap-1 rounded-lg border bg-card p-4">
          <span className="text-xs font-medium text-muted-foreground">Módulos habilitados</span>
          <span className="mt-1 text-2xl font-bold tracking-tight text-primary">3 de 3</span>
          <span className="text-[11px] text-muted-foreground">Reservas, Disponibilidad y Cobros</span>
        </div>
      </div>

      {/* Main Content Panels */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Accommodations Table - 2 Columns */}
        <div className="lg:col-span-2">
          <Panel title="Instancias de Alojamiento Registradas (Demostración)">
            <div className="divide-y text-sm">
              {/* Local Active Instance */}
              <div className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary mt-0.5">
                    <Building2 className="size-4" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">Cabañas y Departamentos Demo</span>
                      <span className="rounded bg-success/15 px-2 py-0.2 text-[10px] font-semibold text-success">
                        Activo (Local)
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Identificador: <code>kiva-instancia-local-01</code> · {UNITS.length} unidades activas
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Unidades: {UNITS.map((u) => u.name).join(', ')}
                    </p>
                  </div>
                </div>

                <div className="sm:shrink-0 pt-2 sm:pt-0">
                  <Link
                    href="/panel"
                    className={cn(
                      buttonVariants({ size: 'sm' }),
                      'gap-1.5 text-xs font-medium w-full sm:w-auto',
                    )}
                  >
                    <span>Abrir panel Business</span>
                    <ArrowRight className="size-3" aria-hidden="true" />
                  </Link>
                </div>
              </div>

              {/* Simulated Instance */}
              <div className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-muted/20">
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground mt-0.5">
                    <Building2 className="size-4" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-muted-foreground">Posada de Montaña Las Acacias</span>
                      <span className="rounded bg-muted px-2 py-0.2 text-[10px] font-semibold text-muted-foreground">
                        Simulación de prueba
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Identificador: <code>kiva-demo-simulada-02</code> · 6 habitaciones
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Registro conceptual de prueba para validar escalabilidad multi-alojamiento.
                    </p>
                  </div>
                </div>

                <div className="sm:shrink-0 pt-2 sm:pt-0">
                  <span className="inline-block rounded border bg-card px-2.5 py-1 text-xs text-muted-foreground">
                    En configuración
                  </span>
                </div>
              </div>
            </div>
          </Panel>
        </div>

        {/* Modules & Technical Configuration - 1 Column */}
        <div className="flex flex-col gap-6">
          <Panel title="Estado de Módulos del Sistema">
            <div className="p-4 flex flex-col gap-3 text-xs">
              <div className="flex items-center justify-between border-b pb-2.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
                  <span className="font-medium">Gestión de Reservas</span>
                </div>
                <span className="rounded bg-success/15 px-2 py-0.5 font-semibold text-success">
                  Activo (MVP)
                </span>
              </div>

              <div className="flex items-center justify-between border-b pb-2.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
                  <span className="font-medium">Matriz de Disponibilidad</span>
                </div>
                <span className="rounded bg-success/15 px-2 py-0.5 font-semibold text-success">
                  Activo (MVP)
                </span>
              </div>

              <div className="flex items-center justify-between border-b pb-2.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
                  <span className="font-medium">Control de Saldos y Cobranzas</span>
                </div>
                <span className="rounded bg-success/15 px-2 py-0.5 font-semibold text-success">
                  Activo (MVP)
                </span>
              </div>

              <div className="flex items-center justify-between border-b pb-2.5 opacity-60">
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-muted-foreground" aria-hidden="true" />
                  <span>Channel Manager (OTAs)</span>
                </div>
                <span className="text-muted-foreground">Roadmap futuro</span>
              </div>

              <div className="flex items-center justify-between opacity-60">
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-muted-foreground" aria-hidden="true" />
                  <span>Facturación Electrónica</span>
                </div>
                <span className="text-muted-foreground">Roadmap futuro</span>
              </div>
            </div>
          </Panel>

          <Panel title="Navegación Rápida">
            <div className="p-4 flex flex-col gap-2 text-xs">
              <Link
                href="/panel"
                className="flex items-center justify-between rounded p-2 hover:bg-muted transition-colors font-medium text-foreground"
              >
                <span>Explorar como Administrador (Business)</span>
                <ArrowRight className="size-3.5 text-primary" aria-hidden="true" />
              </Link>
              <Link
                href="/cliente"
                className="flex items-center justify-between rounded p-2 hover:bg-muted transition-colors font-medium text-foreground"
              >
                <span>Explorar como Huésped (Client)</span>
                <ArrowRight className="size-3.5 text-primary" aria-hidden="true" />
              </Link>
              <Link
                href="/acceso"
                className="flex items-center justify-between rounded p-2 hover:bg-muted transition-colors text-muted-foreground"
              >
                <span>Volver al selector de perfiles</span>
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          </Panel>
        </div>
      </div>
    </>
  )
}
