import { cn } from '@/lib/utils'
import { formatMoney } from '@/lib/kiva'

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-balance">{title}</h1>
        {description && <p className="text-sm text-muted-foreground text-pretty">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function Panel({
  title,
  action,
  children,
  className,
}: {
  title?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('rounded-lg border bg-card', className)}>
      {title && (
        <div className="flex items-center justify-between gap-2 rounded-t-lg border-b bg-muted/30 px-4 py-3">
          <h2 className="text-sm font-semibold">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export function BalanceBadge({ balance }: { balance: number }) {
  if (balance <= 0) {
    return (
      <span className="inline-flex items-center rounded-md bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
        Pagada
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-md bg-warning/15 px-2 py-0.5 text-xs font-medium tabular-nums text-warning-foreground">
      {formatMoney(balance)}
    </span>
  )
}

export function LoadingState() {
  return (
    <p className="py-12 text-center text-sm text-muted-foreground" role="status">
      Cargando datos…
    </p>
  )
}
