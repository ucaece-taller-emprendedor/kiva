'use client'

import Link from 'next/link'
import { ArrowLeft, Eye, Users } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ClientHeader() {
  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <Link href="/cliente" className="text-xl font-bold tracking-tight">
            KIVA
          </Link>
          <span className="flex items-center gap-1 rounded bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
            <Eye className="size-3.5" aria-hidden="true" />
            Portal Huésped (Client)
          </span>
          <span className="hidden text-xs text-muted-foreground sm:inline-block">
            Consulta pública de disponibilidad
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/acceso"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'sm' }),
              'gap-1.5 text-xs text-muted-foreground hover:text-foreground',
            )}
            title="Volver al selector de perfiles"
          >
            <Users className="size-3.5" aria-hidden="true" />
            Cambiar perfil
          </Link>

          <Link
            href="/"
            className="hidden items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
            title="Volver a la landing comercial"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Landing
          </Link>
        </div>
      </div>
    </header>
  )
}
