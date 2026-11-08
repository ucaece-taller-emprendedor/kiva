import type { ReactNode } from 'react'
import { formatoPlata } from '@/lib/kiva'

export function PageHeader({ titulo, descripcion, acciones }: { titulo: string; descripcion?: string | undefined; acciones?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-balance">{titulo}</h1>
        {descripcion && <p className="text-sm text-suave text-pretty">{descripcion}</p>}
      </div>
      {acciones && <div className="flex flex-wrap gap-2">{acciones}</div>}
    </div>
  )
}

export function Panel({ titulo, accion, children, className = '' }: { titulo?: string; accion?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-tema border border-borde bg-superficie ${className}`}>
      {titulo && (
        <div className="flex items-center justify-between gap-2 rounded-t-tema border-b border-borde bg-fondo px-4 py-3">
          <h2 className="text-sm font-semibold">{titulo}</h2>
          {accion}
        </div>
      )}
      {children}
    </section>
  )
}

export function Indicador({ etiqueta, valor, sufijo, detalle, destacado }: { etiqueta: string; valor: string; sufijo?: string; detalle?: string; destacado?: boolean }) {
  return (
    <div className={`flex flex-col gap-2 rounded-tema border p-5 ${destacado ? 'border-acento/50 bg-acento/10' : 'border-borde bg-superficie'}`}>
      <span className="text-sm font-medium text-suave">{etiqueta}</span>
      <span className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold tracking-tight tabular-nums">{valor}</span>
        {sufijo && <span className="text-base text-suave">{sufijo}</span>}
      </span>
      {detalle && <span className="text-sm text-suave">{detalle}</span>}
    </div>
  )
}

/** "Pagada" o el saldo pendiente. */
export function EtiquetaSaldo({ saldo }: { saldo: number }) {
  if (saldo <= 0) return <span className="inline-flex items-center rounded-md bg-ok/10 px-2 py-0.5 text-xs font-medium text-ok">Pagada</span>
  return <span className="inline-flex items-center rounded-md bg-acento/15 px-2 py-0.5 text-xs font-medium tabular-nums text-aviso-texto">{formatoPlata(saldo)}</span>
}

export function EtiquetaPrueba() {
  return <span className="inline-flex rounded-full bg-primario/10 px-2 py-0.5 text-[11px] font-semibold text-primario">Registro de prueba</span>
}
