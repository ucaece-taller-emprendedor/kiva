'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight, ShieldCheck, Users } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function SuperadminHeader() {
  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <Link href="/superadmin" className="text-xl font-bold tracking-tight">
            KIVA
          </Link>
          <span className="flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            Consola Superadmin
          </span>
          <span className="hidden text-xs text-muted-foreground sm:inline-block">
            Supervisión de plataforma
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
            href="/panel"
            className={cn(
              buttonVariants({ variant: 'secondary', size: 'sm' }),
              'gap-1.5 text-xs font-medium',
            )}
          >
            <span>Ver modo Business</span>
            <ArrowRight className="size-3" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  )
}
