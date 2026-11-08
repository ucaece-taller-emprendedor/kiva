'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft, Building2, Plus, Users } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/panel', label: 'Inicio' },
  { href: '/reservas', label: 'Reservas' },
  { href: '/disponibilidad', label: 'Disponibilidad' },
]

function isActive(pathname: string, href: string) {
  if (href === '/panel') return pathname === '/panel'
  if (href === '/reservas') return pathname.startsWith('/reservas') && pathname !== '/reservas/nueva'
  return pathname.startsWith(href)
}

export function AppHeader() {
  const pathname = usePathname()

  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 md:px-6">
        <div className="flex items-center gap-2.5">
          <Link href="/panel" className="text-lg font-semibold tracking-tight">
            KIVA
          </Link>
          <span className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            <Building2 className="size-3" aria-hidden="true" />
            Business
          </span>
        </div>

        <nav aria-label="Principal" className="order-last w-full md:order-none md:w-auto">
          <ul className="flex gap-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'inline-flex h-9 items-center rounded-md px-3 text-sm font-medium transition-colors',
                      active
                        ? 'bg-secondary text-foreground'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/acceso"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'sm' }),
              'gap-1.5 text-xs text-muted-foreground hover:text-foreground',
            )}
            title="Cambiar de rol demostrativo"
          >
            <Users className="size-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Cambiar rol</span>
          </Link>

          <Link
            href="/"
            className="hidden items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
            title="Volver a la landing comercial"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Landing
          </Link>

          <Link href="/reservas/nueva" className={cn(buttonVariants({ size: 'lg' }), 'px-3.5')}>
            <Plus aria-hidden="true" />
            Nueva reserva
          </Link>
        </div>
      </div>
    </header>
  )
}
